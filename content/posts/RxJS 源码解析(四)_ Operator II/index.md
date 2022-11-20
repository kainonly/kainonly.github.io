---
title: "RxJS 源码解析(四): Operator II"
date: 2020-11-07
tags:
  - Angular
categories:
  - 前端
---

在本文开始之前，先定义一些自定义术语，方便阅读。

- 顶流：调用了操作符的流。
- 上游流：操作符的内部订阅器所订阅的流。
- 下游流：由操作符的内部订阅器管理的流。
- 终结订阅：订阅了操作符生成的流的订阅者。

我并不打算像上一篇那样，抓着几个操作符一顿输出。从这篇开始，无论是 Join Operator、还是 Transformation Operator，都有很大的规律性。所以我想先总结出来它们的规律，再来对 operator 进行分析。

## 如何控制下游流

为了让操作符可以控制下游流，RxJS 通过委托模式，让操作符生成的了一个特定的 Subscriber，它在内部就能拿到所有传入的下游流的订阅。因此，在这里先介绍两个 Subscriber： OuterSubscriber 和 InnerSubscriber 。

- OuterSubscriber ：相当于委托者，提供了三个 notify 的接口—— notifyNext， notifyComplete， notifyError 。
- InnerSubscriber ：相当于被委托者，在它构造的时候需要传入 OuterSubscriber ，之后触发相对应的订阅操作，它会去调用 OuterSubscriber 相对应的 notify 接口。

其内部实现实际上就是把 InnerSubscriber 的 next，error，complete 转发给 OuterSubscriber 。

```typescript
export class InnerSubscriber<T, R> extends Subscriber<R> {
  private index = 0;

  constructor(
    private parent: OuterSubscriber<T, R>,
    public outerValue: T,
    public outerIndex: number
  ) {
    super();
  }

  protected _next(value: R): void {
    this.parent.notifyNext(
      this.outerValue,
      value,
      this.outerIndex,
      this.index++,
      this
    );
  }

  protected _error(error: any): void {
    this.parent.notifyError(error, this);
    this.unsubscribe();
  }

  protected _complete(): void {
    this.parent.notifyComplete(this);
    this.unsubscribe();
  }
}
```

而 OuterSubscriber 的默认实现则是将数据交由终结订阅转发出去。

```typescript
export class OuterSubscriber<T, R> extends Subscriber<T> {
  notifyNext(
    outerValue: T,
    innerValue: R,
    outerIndex: number,
    innerIndex: number,
    innerSub: InnerSubscriber<T, R>
  ): void {
    this.destination.next(innerValue);
  }

  notifyError(error: any, innerSub: InnerSubscriber<T, R>): void {
    this.destination.error(error);
  }

  notifyComplete(innerSub: InnerSubscriber<T, R>): void {
    this.destination.complete();
  }
}
```

不同的操作符可能会要生成不同的 Subscriber，而生成这些 Subscriber 都会调用 subscribeToResult。这个函数会根据传入的 ObservableInput ，进行类型判断，并返回一个正确处理后的订阅。这里为了可以复用，就调用了之前 from 也使用过的 subscribeTo ，在这个函数中，会处理列表、Promise、以及生成器等数据并返回一个订阅。

```typescript
export function subscribeToResult<T, R>(
  outerSubscriber: OuterSubscriber<T, R>,
  result: any,
  outerValue?: T,
  outerIndex: number = 0,
  innerSubscriber: Subscriber<R> = new InnerSubscriber(
    outerSubscriber,
    outerValue,
    outerIndex
  )
): Subscription | undefined {
  if (innerSubscriber.closed) {
    return undefined;
  }
  if (result instanceof Observable) {
    return result.subscribe(innerSubscriber);
  }
  return subscribeTo(result)(innerSubscriber) as Subscription;
}
```

通过这种设计，使得生成的 Subscriber 拥有控制下游流状态的能力。这种能力可以使得数据装箱和拆箱都放在同一个 Subscriber 中，同时这样做也把副作用集中在一个订阅器中处理，使得操作符在表现上像纯函数一样。

下面以及下一篇的内容中，会出现大量 subscribeToResult ，我们只需要知道，这个函数将订阅的数据或信息转发到了 OuterSubscriber 的相关接口中，它的功能不再赘述。

最后，我们还是要回归到 operators 的源码分析上。因为整体规律和设计已经了解完毕，那么分析每一个 operator 的时候，也能通过这些规律来理解某一部分的 operators 为什么要这样设计。

在这里，我们继续沿着上一篇的内容，先分析 Join Creation Operators。

## race

所谓 race，意味着所有的流都在进行一场赛跑，跑赢的流可以留下并继续发送数据，没跑赢的只能取消订阅。

```typescript
const first = interval(1000).pipe(take(1), mapTo("first"));
const second = interval(2000).pipe(take(1), mapTo("second"));

const race$ = race(first, second);

race$.subscribe((v) => console.log(v));

// 打印结果
// first
```

race 通过 fromArray 的方式，将输入的 Observable 交由内部订阅器来处理。

```typescript
export function race<T>(...observables: ObservableInput<any>[]): Observable<T> {
  return fromArray(observables).lift(new RaceOperator<T>());
}
```

### RaceSubscriber

RaceSubscriber 保存了这么几个状态。

```typescript
private hasFirst: boolean = false;
private observables: Observable<any>[] = [];
private subscriptions: Subscription[] = [];
```

订阅后上游流输出 Observable 会由 observables 缓存起来，而后在上游流输出完成时，对他们进行订阅，并保存订阅对象。

```typescript
protected _complete() {
  const observables = this.observables;
  const len = observables.length;

  if (len === 0) {
    this.destination.complete();
  } else {
    for (let i = 0; i < len && !this.hasFirst; i++) {
      let observable = observables[i];
      let subscription = subscribeToResult(this, observable, observable as any, i);

      if (this.subscriptions) {
        this.subscriptions.push(subscription);
      }
      this.add(subscription);
    }
    this.observables = null;
  }
}
```

### notify

在 notifyNext 中，RaceSubscriber 可以获取下游流的订阅数据。并对 hasFirst 进行判断。如果该数据是第一个到达，更新 hasFirst 状态，并将其余下游流的订阅取消，这样做的目的是为了只让这个下游流的数据发送给终结订阅。

```typescript
notifyNext(
  outerValue: T, innerValue: T,
  outerIndex: number, innerIndex: number,
  innerSub: InnerSubscriber<T, T>
): void {
  if (!this.hasFirst) {
    // 更新状态
    this.hasFirst = true;

    //
    for (let i = 0; i < this.subscriptions.length; i++) {
      if (i !== outerIndex) {
        let subscription = this.subscriptions[i];

        subscription.unsubscribe();
        this.remove(subscription);
      }
    }

    this.subscriptions = null;
  }

  this.destination.next(innerValue);
}
```

## zip

zip 是这样的一种操作符，它以下游流中数据量最少的流为基准，按照先后顺序与其余的下游流结合成新的流。

```typescript
let age$ = of<number>(27, 25, 29, 30, 35, 40);
let name$ = of<string>("Foo", "Bar", "Beer");
let isDev$ = of<boolean>(true, true);

zip(age$, name$, isDev$)
  .pipe(map(([age, name, isDev]) => ({ age, name, isDev })))
  .subscribe((x) => console.log(x));

// outputs
// { age: 27, name: 'Foo', isDev: true }
// { age: 25, name: 'Bar', isDev: true }
```

zip 也一样，通过 fromArray 的方式，将输入内容交由内部订阅器处理。

```typescript
export function zip<O extends ObservableInput<any>, R>(
  ...observables: O[]
): Observable<ObservedValueOf<O>[] | R> {
  // 通过 fromArray 将传入的参数以流的形式进入到订阅中
  return fromArray(observables, undefined).lift(new ZipOperator());
}
```

### ZipSubscriber

订阅开始，生成 ZipSubscriber，调用 \_next。根据输入流的类型，将其传入到不同的迭代器中，输入的流的数据类型包含了以下几种：

- 数组
- 生成器 或 迭代器
- Observable

```typescript
protected _next(value: any) {
  const iterators = this.iterators;
  if (isArray(value)) {
    iterators.push(new StaticArrayIterator(value));
  } else if (typeof value[Symbol_iterator] === 'function') {
    iterators.push(new StaticIterator(value[Symbol_iterator]()));
  } else {
    iterators.push(new ZipBufferIterator(this.destination, this, value));
  }
}
```

相较于 静态数据而言，Observable 才是我们关注的重点。在前面已经讲过 OuterSubscriber 的作用，我在这里不再赘述。 ZipBufferIterator 通过继承 OuterSubscriber，并实现了相应的操作，然后维护了这些 Observable 并进行订阅。

在 zip 中，上游流为 fromArray 生成的 Observable。当它完成时，会把 next 中存储的迭代器进行循环调用。在 next 的时候我们可以看到，会生成与 ObservableInput 相对应的内容 ，的内部如果实现了订阅功能，那么就订阅这些迭代器，否则，直接按照静态处理。

```typescript
protected _complete() {
  const iterators = this.iterators;
  const len = iterators.length;

  this.unsubscribe();

  if (len === 0) {
    this.destination.complete();
    return;
  }

  this.active = len;
  for (let i = 0; i < len; i++) {
    let iterator: ZipBufferIterator<any, any> = <any>iterators[i];
    if (iterator.stillUnsubscribed) {
      const destination = this.destination as Subscription;
      // 持有并管理该迭代器的订阅
      destination.add(iterator.subscribe(iterator, i));
    } else {
      // 不是 Observable
      this.active--;
    }
  }
}
```

ZipBufferIterator 继承了 OuterSubscriber ，那么它肯定也是通过内部维护一个 InnerSubscriber 来将下游流中的数据转发出去。

```typescript
class ZipBufferIterator<T, R> extends OuterSubscriber<T, R> implements LookAheadIterator<T> {
  ...
  subscribe(value: any, index: number) {
    const subscriber = new InnerSubscriber(this, index as any, undefined);
    return subscribeToResult<any, any>(this, this.observable, undefined, undefined, subscriber);
  }
  ...
}
```

### notify

ZipBufferIterator 其内部维护了 InnerSubscriber ，那么意味着数据会由发送到 notifyNext 中，这里使用了一个数组将数据缓存起来。

```typescript
notifyNext(outerValue: T, innerValue: any,
            outerIndex: number, innerIndex: number,
            innerSub: InnerSubscriber<T, R>): void {
  this.buffer.push(innerValue);
  this.parent.checkIterators();
}
```

而后，会调用 ZipSubscriber.checkIterators， 这个方法决定了终结订阅的数据来源，同时也给出了终结订阅完成所需要的条件。

```typescript
checkIterators() {
  const iterators = this.iterators;
  const len = iterators.length;
  const destination = this.destination;


  // 是不是所有的迭代器都存在数据。
  for (let i = 0; i < len; i++) {
    let iterator = iterators[i];
    if (typeof iterator.hasValue === 'function' && !iterator.hasValue()) {
      return;
    }
  }

  let shouldComplete = false;
  // 终结订阅最终拿到的数据
  const args: any[] = [];

  for (let i = 0; i < len; i++) {
    let iterator = iterators[i];
    let result = iterator.next();

    // 判断迭代器是否已经完成数据输出
    if (iterator.hasCompleted()) {
      shouldComplete = true;
    }

    // 如果结果已经到了末尾，意味着最短的数据已经输出完毕。
    // 有可能数据没到末尾，但是该迭代器已经结束。
    if (result.done) {
      destination.complete();
      return;
    }

        // 收集所有迭代器中的数据。
    args.push(result.value);
  }

  // 发送给终结订阅
  destination.next(args);

  //
  if (shouldComplete) {
    destination.complete();
  }
}
```

当某一个下游流完成的时候，缓冲区的存在与否会决定终结订阅的是否完成。

```typescript
notifyComplete() {
  if (this.buffer.length > 0) {
    this.isComplete = true;
    this.parent.notifyInactive();
  } else {
    this.destination.complete();
  }
}
```

如果缓冲区存在数据，那么还得去调用 ZipSubscriber.notifyInactive ，将信息返回给 ZipSubscriber。到了这一步，意味着某一个下游流已经完全发送完数据了，那么还得更新 active 的记录。如果 active 最终为 0 ，那么将通知终结订阅这个流已经完成了。

```typescript
notifyInactive() {
  this.active--;
  if (this.active === 0) {
    this.destination.complete();
  }
}
```

## CombineLatest

跟 zip 不一样，在 CombineLatest 中，每一个下游流的新数据都会和其余下游流的当前的数据相结合，从而形成新的数据并从新的流中转发出去。

```typescript
export function combineLatest<O extends ObservableInput<any>, R>(
  ...observables: O[]
): Observable<R> {
  return fromArray(observables).lift(
    new CombineLatestOperator<ObservedValueOf<O>, R>()
  );
}

export class CombineLatestOperator<T, R> implements Operator<T, R> {
  constructor() {}

  call(subscriber: Subscriber<R>, source: any): any {
    return source.subscribe(new CombineLatestSubscriber());
  }
}
```

起始状态跟 zip 一样，也是通过 fromArray 将 ObservableInput 作为上游流的数据输入到 CombineLatestSubscriber 中。把目光锁定这个 Subscriber，深入了解一下它的心路历程。

### CombineLatestSubscriber

当数据到来的时候，CombineLatestSubscriber 把下游流集体缓存到一个 observables 数组中。

```typescript
protected _next(observable: any) {
  this.values.push(NONE);
  this.observables.push(observable);
}
```

当下游流缓存完毕的时候，上游流也输出完毕，那么便会调用 complete。 在这里，complete 做的事情仅仅是将所有的下游流进行订阅，并记录这些流的订阅状态。

```typescript
protected _complete() {
  const observables = this.observables;
  const len = observables.length;
  if (len === 0) {
    this.destination.complete();
  } else {
    this.active = len;
    this.toRespond = len;
    for (let i = 0; i < len; i++) {
      const observable = observables[i];
      const innerSub = new InnerSubscriber(this, observable, i);
      this.add(subscribeToResult(this, observable, undefined, undefined, innerSub));
    }
  }
}
```

在订阅完毕所有的下游流后，它们的数据全都会流到 notify 中。

### notify

CombineLatestSubscriber 每接收到一个下游流的数据，都会触发 notifyNext。toRespond 记录的是剩余未收到数据的下游流的数量， 当所有下游流都有数据的时候，那么才会开始结合。

values 通过初始化的索引缓存了每一个下游流当前的数据，当任意一个下游流的数据到来后，都将会更新 values 中对应索引中的缓存数据。

```typescript
notifyNext(outerValue: T, innerValue: R,
            outerIndex: number, innerIndex: number,
            innerSub: InnerSubscriber<T, R>): void {
  const values = this.values;
  const oldVal = values[outerIndex];

  let toRespond = 0;
  if (this.toRespond) {
    // 如果这个数据为NONE，那么则代表当前的
    // 下游流是首次发送数据，则 toRespond
    // 要减一。
    if (oldVal === NONE) {
      this.toRespond -= 1;
    }
    toRespond = this.toRespond;
  }

  values[outerIndex] = innerValue;

  if (toRespond === 0) {
    this.destination.next(values.slice());
  }
}
```

以上便是 combineLastest 的核心设计。

至于 notifyComplete ，则是处理了当前正在运行的下游流和终结订阅的关系。当 active 减少到零的时候，意味着需要通知终结订阅所有数据已经输出完毕了。

```typescript
notifyComplete(unused: Subscriber<R>): void {
  this.active -= 1;
  if (this.active === 0) {
    this.destination.complete();
  }
}
```

## forkJoin

相较于 combineLatest ，forkJoin 是一种更为激进的实现。为什么说它激进，因为它判断合并的条件，从下游流有数据输出变成了下游流完成数据输出。它的实现很简单，只需要计算每个结束输出数据的下游流的数量 completed，通过比较 completed 和下游流总数，就能判断什么时候结束。需要注意的一点，如果所有流都输出了数据，那么 forkJoin 才能把数据发送。

```typescript
function forkJoinInternal(
  sources: ObservableInput<any>[],
  keys: string[] | null
): Observable<any> {
  return new Observable((subscriber) => {
    const len = sources.length;
    if (len === 0) {
      subscriber.complete();
      return;
    }

    const values = new Array(len);
    let completed = 0;
    let emitted = 0;
    // 循环订阅所有的下游流
    for (let i = 0; i < len; i++) {
      // 将输入转换成 Observable
      const source = from(sources[i]);
      let hasValue = false;

      subscriber.add(
        source.subscribe({
          next: (value) => {
            if (!hasValue) {
              hasValue = true;
              emitted++;
            }
            // 记录当前订阅的值
            values[i] = value;
          },
          error: (err) => subscriber.error(err),
          // 处理完成时所需要做的工作
          complete: () => {
            // 更新下游流订阅完成数
            completed++;

            // 判断是否所有的下游流订阅都已经完成
            if (completed === len || !hasValue) {
              if (emitted === len) {
                // 如果全部的下游流都发送了数据，
                // 那么终结订阅将收到所有的下游流
                // 的数据。
                subscriber.next(values);
              }
              subscriber.complete();
            }
          },
        })
      );
    }
  });
}
```

## merge & concat

merge 通过调用 mergeMap 来创建合并流，concat 也是通过 mergeMap 来创建相同的合并流。这一部分会在下一章讲到。它们两个唯一不同的点就是在于并发的数量上。merge 可以并发订阅多个下游流，而 concat 同一时间只能订阅一个下游流。

### merge 源码

```typescript
type Any = ObservableInput<any>;

export function merge<T, R>(
  ...observables: Array<ObservableInput<any> | number>
): Observable<R> {
  let concurrent = Number.POSITIVE_INFINITY;
  let last: any = observables[observables.length - 1];
  if (typeof last === "number") {
    concurrent = <number>observables.pop();
  }
  return mergeMap<Any, Any>((x) => x, concurrent)(fromArray<any>(observables));
}
```

### concat 源码

```typescript
export function concat1<O extends ObservableInput<any>, R>(
  ...observables: Array<O>
): Observable<R> {
  return mergeMap<O, O>((x) => x, 1)(of(...observables));
}
```

## partition

partion 是一种分割操作，通过传入一个判断函数，使得输出的流一分为二。它通过 filter 来实现，将两个不同的流分离。其中需要注意的是，第二个 filter 中，传入的是一个求反操作。

```typescript
export function partition<T>(
  predicate: (value: T, index: number) => boolean,
  thisArg?: any
): UnaryFunction<Observable<T>, [Observable<T>, Observable<T>]> {
  return (source: Observable<T>) =>
    [
      filter(predicate, thisArg)(source),

      // 此处传入的是一个 not，他把整个 predicate 封装。
      filter(not(predicate, thisArg) as any)(source),
    ] as [Observable<T>, Observable<T>];
}
```

> 作者：zcx <br>
> 原文：<https://mp.weixin.qq.com/s/1b141waT_tAxZR-PZC79kg>