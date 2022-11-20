---
title: "RxJS 源码解析(二): Muticasted Observable"
date: 2020-11-05
tags:
  - Angular
categories:
  - 前端
---

我们分析了 Oberservable 和 Subscription 的具体实现方法。这一篇，将会了解一系列不同的 Muticasted Observable（多播观察源），这些 Observable 在 RxJS 中主要是以 Subject 命名，它们有以下几种不同的实现：

- Subject
- AnonymousSubject
- BehaviorSubject
- ReplaySubject
- AsyncSubject

所谓 Muticasted Observable，就是这个 Observable 可以持续的发送数据给到订阅它的订阅者们。

## Subject

Subject 是最基础的 Muticasted Observable，订阅者对其进行订阅后，将会拿到 Subject 之后发送的数据。但是，如果订阅者在数据发送后再订阅，那么它将永远都拿不到这条数据。用一下例子简单说明一下：

```typescript
const subject = new Subject<number>();

// 订阅之前调用是不会打印
subject.next(1);

// 订阅数据
const subscription = subject.subscribe((value) => {
  console.log("订阅数据A：" + value);
});

// 订阅后调用会打印数据。
subject.next(2);

// 打印结果
// 订阅数据A：2
```

Subject 的实现通过将观察员们放入数组中，如果有事件即将到来，通知当前所有已经在位的观察员们。

```typescript
class Subject<T> extends Observable<T> {
  observers: Observer<T>[] = [];
  // 省略了一些内容

  next(value?: T) {
    if (!this.isStopped) {
      ...
      const { observers } = this;
      const len = observers.length;
      const copy = observers.slice();
      for (let i = 0; i < len; i++) {
        copy[i].next(value);
      }
    }
  }

  // error 类似于 next
  error(err: any) {
    ...
    this.hasError = true;
    this.thrownError = err;
    this.isStopped = true;
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].error(err);
    }
    this.observers.length = 0;
  }

  // complete 类似于 next
  complete() {
    ...
    this.isStopped = true;
    const { observers } = this;
    const len = observers.length;
    const copy = observers.slice();
    for (let i = 0; i < len; i++) {
      copy[i].complete();
    }
    this.observers.length = 0;
  }
}
```

通过重写了 \_subscribe ，将观察员在订阅时保存到 observers 数组中。

```typescript
_subscribe(subscriber: Subscriber<T>): Subscription {
   if (this.hasError) {
    subscriber.error(this.thrownError);
    return Subscription.EMPTY;
  } else if (this.isStopped) {
    subscriber.complete();
    return Subscription.EMPTY;
  } else {
    // 如果都没有问题，在这里将观察员保存到 observers 数组。
    this.observers.push(subscriber);
    // 提供一个指向于当前观察者的订阅对象。
    return new SubjectSubscription(this, subscriber)
  }
}
```

Subject 通过创建一个新的指向于它的 observable，完成和 Observable 之间的转换。

```typescript
asObservable(): Observable<T> {
  const observable = new Observable<T>();
  (<any>observable).source = this;
  return observable;
}
```

## AnonymousSubject

AnonymousSubject 是一个 Subject 的 wrapper，它拥有一个 名为 destination 的 Observer 成员。 Observer 提供了三个方法接口，分别是 next，error 和 complete。

```typescript
export interface Observer<T> {
  closed?: boolean;
  next: (value: T) => void;
  error: (err: any) => void;
  complete: () => void;
}
```

AnonymousSubject 通过重载 Subject 的 next，error，complete 将调用转发到 destination 。由于其重载这三个重要的方法，其本身并不具备 Subject 所提供的功能。AnonymousSubject 重载这些方法的主要作用是为了将调用转发到 destination ，也就是提供了一个

```typescript
export class AnonymousSubject<T> extends Subject<T> {
  constructor(protected destination?: Observer<T>, source?: Observable<T>) {
    super();
    this.source = source;
  }

  next(value: T) {
    const { destination } = this;
    if (destination && destination.next) {
      destination.next(value);
    }
  }

  error(err: any) {
    const { destination } = this;
    if (destination && destination.error) {
      this.destination.error(err);
    }
  }

  complete() {
    const { destination } = this;
    if (destination && destination.complete) {
      this.destination.complete();
    }
  }
}
```

它也重载 \_subscribe，那么也就不具备 Subject 的保存订阅者的功能了。

```typescript
_subscribe(subscriber: Subscriber<T>): Subscription {
  const { source } = this;
  if (source) {
    return this.source.subscribe(subscriber);
  } else {
    return Subscription.EMPTY;
  }
}
```

通过阅读源码使用到 AnonymousSubject 的地方，我认为 AnonymousSubject 主要的功能还是为 Subject 的 lift 方法提供一个封装，lift 需要返回的是一个符合当前类的同构对象。

```typescript
export class Subject<T> extends Observable<T> {
  lift<R>(operator: Operator<T, R>): Observable<R> {
    const subject = new AnonymousSubject(this, this);
    subject.operator = <any>operator;
    return <any>subject;
  }
}
```

如果直接重新构造一个 Subject 虽然符合同构，但是存储了过多的冗余数据，比如，订阅的时候就会重复把订阅者添加到 observers 中；如果直接使用 Observable ，那么又不符合同构，因为 Observable 并不具备 next，error 和 complete 等功能，那么这就是一种比较稳妥的做法，通过重载复写 Subject 的一些方法，使得其既具备同构，也不会重复保存冗余数据。

## BehaviorSubject

BehaviorSubject 为 Subject 提供了数据持久化（相对于 Subject 本身）功能，它本身存储了已经到来的数据，可以看看以下例子。

```typescript
const subject = new BehaviorSubject<number>(0);

// 初始化后直接订阅
const subscriptionA = subject.subscribe((value) => {
  console.log("订阅数据A：" + value);
});

// 订阅之前调用是不会打印
subject.next(1);

const subscriptionB = subject.subscribe((value) => {
  console.log("订阅数据B：" + value);
});

// 订阅后调用会打印数据。
subject.next(2);

// 打印结果
// 订阅数据A：0
// 订阅数据A：1
// 订阅数据B：1
// 订阅数据A：2
//
```

BehaviorSubject 拥有一个 \_value 成员，每次调用 next 发送数据的时候，BehaviorSubject 都会将数据保存到 \_value 中。

```typescript
export class BehaviorSubject<T> extends Subject<T> {
  constructor(private _value: T) {
    super();
  }

  get value(): T {
    return this.getValue();
  }

  getValue(): T {
    if (this.hasError) {
      throw this.thrownError;
    } else if (this.closed) {
      throw new ObjectUnsubscribedError();
    } else {
      return this._value;
    }
  }
}
```

调用 next 的时候，会把传入的 value 保存起来，并交由 Subject 的 next 来处理。

```typescript
next(value: T): void {
  super.next(this._value = value);
}
```

当 BehaviorSubject 被订阅的时候，也会把当前存储的数据发送给订阅者，通过重写 \_subscribe 实现这个功能。

```typescript
_subscribe(subscriber: Subscriber<T>): Subscription {
  const subscription = super._subscribe(subscriber);
  // 只要订阅器没有关闭，那么就将当前存储的数据发送给订阅者。
  if (subscription && !(<SubscriptionLike>subscription).closed) {
    subscriber.next(this._value);
  }
  return subscription;
}
```

## AsyncSubject

AsyncSubject 并没有提供相应的异步操作，而是把控制最终数据到来的权力交给调用者，订阅者只会接收到 AsyncSubject 最终的数据。正如官方例子所展示的的，当它单独调用 next 的时候，订阅者并不会接收到数据，而只有当它调用 complete 的时候，订阅者才会接收到最终到来的消息。以下例子可以说明 AsyncSubject 的运作方式。

```typescript
const subject = new AsyncSubject<number>();

const subscriptionA = subject.subscribe((value) => {
  console.log("订阅数据A：" + value);
});

// 此处不会触发订阅
subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

const subscriptionB = subject.subscribe((value) => {
  console.log("订阅数据B：" + value);
});

// 同样，这里不会触发订阅
subject.next(5);
// 但是完成方法会触发订阅
subject.complete();

// 打印结果
// 订阅数据A：5
// 订阅数据B：5
```

AsyncSubject 通过保留发送状态和完成状态，来达到以上目的。

```typescript
export class AsyncSubject<T> extends Subject<T> {
  private value: T = null;
  private hasNext: boolean = false;
  private hasCompleted: boolean = false;
}
```

AsyncSubject 的 next 不会调用 Subject 的 next，而是保存未完成状态下最新到来的数据。

```typescript
next(value: T): void {
  if (!this.hasCompleted) {
    this.value = value;
    this.hasNext = true;
  }
}
```

那么 Subject 的 next 会在 AsyncSubject 的 complete 方法中调用。

```typescript
complete(): void {
  this.hasCompleted = true;
  if (this.hasNext) {
    super.next(this.value);
  }
  super.complete();
}
```

## ReplaySubject

ReplaySubject 的作用是在给定的时间内，发送所有的已经收到的缓冲区数据，当时间过期后，将销毁之前已经收到的数据，重新收集即将到来的数据。所以在构造的时候，需要给定两个值，一个是缓冲区的大小（bufferSize），一个是给定缓冲区存活的窗口时间（windowTime），需要注意的是 ReplaySubject 所使用的缓冲区的策略是 FIFO。

下面举出两个例子，可以先感受一下 ReplaySubject 的行为。第一个如下：

```typescript
const subject = new ReplaySubject<string>(3);

const subscriptionA = subject.subscribe((value) => {
  console.log("订阅数据A：" + value);
});

subject.next(1);
subject.next(2);
subject.next(3);
subject.next(4);

const subscriptionB = subject.subscribe((value) => {
  console.log("订阅数据B：" + value);
});

// 打印结果：
// 订阅数据A: 1
// 订阅数据A: 2
// 订阅数据A: 3
// 订阅数据A: 4
// 订阅数据B：2
// 订阅数据B：3
// 订阅数据B：4
```

下面是第二个例子，这个 ReplaySubject 带有一个窗口时间。

```typescript
const subject = new ReplaySubject<string>(10, 1000);

const subscriptionA = subject.subscribe((value) => {
  console.log("订阅数据A：" + value);
});

subject.next("number");
subject.next("string");
subject.next("object");
subject.next("boolean");

setTimeout(() => {
  subject.next("undefined");
  const subscriptionB = subject.subscribe((value) => {
    console.log("订阅数据B：" + value);
  });
}, 2000);

// 打印结果
// 订阅数据A：number
// 订阅数据A：string
// 订阅数据A：object
// 订阅数据A：boolean
// 订阅数据A：undefined
// 订阅数据B：undefined
```

其实 ReplaySubject 跟 BehaviorSubject 很类似，但是不同的点在于，ReplaySubject 多了缓冲区和窗口时间，也算是扩展了 BehaviorSubject 的使用场景。

在源码中，还有第三个参数，那就是调度器（scheduler），一般来说，使用默认调度器已经可以覆盖大部分需求，关于调度器的部分会在之后讲到。

```typescript
export class ReplaySubject<T> extends Subject<T> {
  private _events: (ReplayEvent<T> | T)[] = [];
  private _bufferSize: number;
  private _windowTime: number;
  private _infiniteTimeWindow: boolean = false;

  constructor(
    bufferSize: number = Number.POSITIVE_INFINITY,
    windowTime: number = Number.POSITIVE_INFINITY,
    private scheduler?: SchedulerLike
  ) {
    super();
    this._bufferSize = bufferSize < 1 ? 1 : bufferSize;
    this._windowTime = windowTime < 1 ? 1 : windowTime;

    if (windowTime === Number.POSITIVE_INFINITY) {
      this._infiniteTimeWindow = true;
      this.next = this.nextInfiniteTimeWindow;
    } else {
      this.next = this.nextTimeWindow;
    }
  }
}
```

上面的源码中，ReplaySubject 在构造时会根据不同的窗口时间来设置 next 具体的运行内容，主要以下两种方式。

- nextInfiniteTimeWindow
- nextTimeWindow

### nextInfiniteTimeWindow

如果窗口时间是无限的，那么就意味着缓冲区数据的约束条件只会是将来的数据。

```typescript
private nextInfiniteTimeWindow(value: T): void {
  const _events = this._events;
  _events.push(value);
  // 根据数据长度和缓冲区大小，决定哪些数据留在缓冲区。
  if (_events.length > this._bufferSize) {
    _events.shift();
  }

  super.next(value);
}
```

### nextTimeWindow

如果窗口时间是有限的，那么缓冲区的约束条件就由两条组成：窗口时间和将来的数据。这时，缓冲区数据就由 ReplayEvent 组成。ReplayEvent 保存了到来的数据的内容和其当前的时间戳。

```typescript
class ReplayEvent<T> {
  constructor(public readonly time: number, public readonly value: T) {}
}
```

那么通过 `_trimBufferThenGetEvents` 对缓冲区数据进行生死判断后，再把完整的数据交由 Subject 的 next 发送出去。

```typescript
private nextTimeWindow(value: T): void {
  this._events.push(new ReplayEvent(this._getNow(), value));
  this._trimBufferThenGetEvents();

  super.next(value);
}
```

`_trimBufferThenGetEvents` 这个方法是根据不同的 event 对象中的时间戳与当前的时间戳进行判断，同时根据缓冲区的大小，从而得到这个对象中的数据是否能够保留的凭证。

```typescript
private _trimBufferThenGetEvents(): ReplayEvent<T>[] {
  const now = this._getNow();
  const _bufferSize = this._bufferSize;
  const _windowTime = this._windowTime;
  const _events = <ReplayEvent<T>[]>this._events;

  const eventsCount = _events.length;
  let spliceCount = 0;

  // 由于缓冲区的是 FIFO，所以时间的排
  // 序一定是从小到大那么，只需要找到分
  // 割点，就能决定缓冲数据的最小数据长
  // 度。
  while (spliceCount < eventsCount) {
    if ((now - _events[spliceCount].time) < _windowTime) {
      break;
    }
    spliceCount++;
  }

  // 缓冲区长度对切割的优先级会更高，
  // 所以如果超出了缓冲区长度，那么切
  // 割点要由更大的一方决定。
  if (eventsCount > _bufferSize) {
    spliceCount = Math.max(spliceCount, eventsCount - _bufferSize);
  }

  if (spliceCount > 0) {
    _events.splice(0, spliceCount);
  }

  return _events;
}
```

### 订阅过程

ReplaySubject 的订阅过程比较特殊，因为订阅的时候需要发送缓冲区数据，而且在不同时间进行订阅也会使得缓冲区中的数据变化，所以订阅是需要考虑的问题会比较多。那么，抓住 `_infiniteTimeWindow` 这个变量来看代码会变得很容易。

```typescript
// 以下源码省略了调度器相关的代码
_subscribe(subscriber: Subscriber<T>): Subscription {
  const _infiniteTimeWindow = this._infiniteTimeWindow;
  // 窗口时间是无限的则不用考虑
  // 窗口时间是有限的则更新缓冲区
  const _events = _infiniteTimeWindow ? this._events : this._trimBufferThenGetEvents();
  const len = _events.length;

  // 创建 subscription
  let subscription: Subscription;
  if (this.isStopped || this.hasError) {
    subscription = Subscription.EMPTY;
  } else {
    this.observers.push(subscriber);
    subscription = new SubjectSubscription(this, subscriber);
  }

  // 分类讨论不同的约束条件
  if (_infiniteTimeWindow) {
    // 窗口时间不是无限的，缓冲区存储直接就是数据
    for (let i = 0; i < len && !subscriber.closed; i++) {
      subscriber.next(<T>_events[i]);
    }
  } else {
    // 窗口时间不是无限的，缓冲区存储的是 ReplayEvent
    for (let i = 0; i < len && !subscriber.closed; i++) {
      subscriber.next((<ReplayEvent<T>>_events[i]).value);
    }
  }

  if (this.hasError) {
    subscriber.error(this.thrownError);
  } else if (this.isStopped) {
    subscriber.complete();
  }

  return subscription;
}
```

> 作者：zcx <br>
> 原文：<https://mp.weixin.qq.com/s/i14brW_Ok8JYGoBIcfhs5Q>