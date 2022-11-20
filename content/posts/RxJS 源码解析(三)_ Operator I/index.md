---
title: "RxJS 源码解析(三): Operator I"
date: 2020-11-06
tags:
  - Angular
categories:
  - 前端
---

在 RxJS 中，Creation Operator 主要分为以下两类：

- 执行一般创建操作的 Normal Creation Operator。
- 执行复杂的创建操作的 Join Creation Operator。

在 pipe 中使用的 operator ，我称之为 Pipe Operator ，它主要分为以下几类：

- 用于数据映射的 Transformation Operators
- 过滤用的 Filtering Operators
- 将当前的 Observable 多播化的 Multicasting Operators
- 处理错误的 Error Handling Operators
- 工具操作函数 Utility Operators
- Conditional and Boolean Operators
- Mathematical and Aggregate Operators

限于篇幅本篇将先介绍 Normal Creation Operator ，它的主要作用是帮助开发者快速创建 Observable。

## of , empty & throwError

of 、empty 、throwError ，首先讲这三个 operator 的重要原因是，它提供了一系列基础的操作：next、complete、以及 error。

```typescript
const observableA = of(1);
const observableB = empty();
const observableC = throwError(Error('test'));

observableA.subscribe({
    next: (v) => console.log('A: ' + v),
    complete: () => console.log('A: complete');
    error: (e) => console.log('A: error is ' + e);
});

observableB.subscribe({
    next: (v) => console.log('B: ' + v),
    complete: () => console.log('B: complete');
    error: (e) => console.log('B: error is ' + e);
});


observableC.subscribe({
    next: (v) => console.log('C: ' + v),
    complete: () => console.log('C: complete'),
    error: (e) => console.log(`C: error is (${e}).`),
});


// 打印结果
// A: 1
// A: complete
// B: complete
// C: error is Error: test
```

### of source code

它的构建方式如下，其中，调度器是最后一个参数。

```typescript
export function of<T>(...args: Array<T | SchedulerLike>): Observable<T> {
  let scheduler = args[args.length - 1] as SchedulerLike;
  if (isScheduler(scheduler)) {
    args.pop();
    return scheduleArray(args as T[], scheduler);
  } else {
    return fromArray(args as T[]);
  }
}
```

of 由两个函数 fromArray 和 scheduleArray。fromArray 是一个简单循环的函数，它将数据循环发送给 Observable 的订阅者。

```typescript
export function fromArray<T>(input: ArrayLike<T>) {
  return new Observable<T>((subscriber: Subscriber<T>) => {
    // 循环获取数据
    for (let i = 0, len = array.length; i < len && !subscriber.closed; i++) {
      subscriber.next(array[i]);
    }
    subscriber.complete();
  });
}
```

### empty source code

这部分的代码很简单，scheduler 部分可以忽略。实际上就是在 Observable 中调用 subscriber.complete()。

```typescript
export function empty(scheduler?: SchedulerLike) {
  if (scheduler) {
    return new Observable<never>((subscriber) =>
      scheduler.schedule(() => subscriber.complete())
    );
  } else {
    return new Observable<never>((subscriber) => subscriber.complete());
  }
}
```

### throwError source code

throwError 跟 empty 的实现是一致的，只不过 complete 换成了 error 。

```typescript
export function throwError(
  error: any,
  scheduler?: SchedulerLike
): Observable<never> {
  if (!scheduler) {
    return new Observable((subscriber) => subscriber.error(error));
  } else {
    return new Observable((subscriber) =>
      scheduler.schedule(dispatch, 0, { error, subscriber })
    );
  }
}

// 以下是 调度器中想要执行的状态。
interface DispatchArg {
  error: any;
  subscriber: Subscriber<any>;
}
// 最终执行的是 subcriber 的 error 方法。
function dispatch({ error, subscriber }: DispatchArg) {
  subscriber.error(error);
}
```

## iif & defer

iif 和 defer 的表现是一致的。

- defer 的主要作用是延后了具体 Observable 的生成，是一个 Lazy Observable Factory。
- iif 则是缩小了 defer 的表达范围，主要作用是增强了 Rx 的命令式的语义。

```typescript
let test = false;
const observableA = iif(() => test, of("1"), of("2"));
const observableB = defer(function () {
  return test ? of("1") : of("2");
});
```

### iif Source Code

看到 iif 的源码的那一刻我震惊了，什么叫大道至简（战术后仰）。

```typescript
export function iif<T = never, F = never>(
  condition: () => boolean,
  trueResult: SubscribableOrPromise<T> = EMPTY,
  falseResult: SubscribableOrPromise<F> = EMPTY
): Observable<T | F> {
  // 直接调用了 defer
  return defer(() => (condition() ? trueResult : falseResult));
}
```

### defer Source Code

defer 原理上比较简单：在构造 Observable 的时候，在传入的订阅函数中返回一个 Subscription。那么在这个传入的订阅函数中，defer 的过程分为以下三步：

- 调用工厂，获取输入数据。
- 调用 from 将数据转换成一个 observable
- 返回这个 observable 的订阅。

```typescript
export function defer<R extends ObservableInput<any> | void>(
  observableFactory: () => R
): Observable<ObservedValueOf<R>> {
  return new Observable<ObservedValueOf<R>>((subscriber) => {
    let input: R | void;
    try {
      // 调用工厂函数，获取输入的数据。
      input = observableFactory();
    } catch (err) {
      subscriber.error(err);
      return undefined;
    }
    // 通过 from 将 input 转换为 observable。
    const source = input
      ? from(input as ObservableInput<ObservedValueOf<R>>)
      : empty();

    // 返回一个订阅器到外部。
    return source.subscribe(subscriber);
  });
}
```

其中的 ObservedValueOf 是这样定义的，使用了 ts 的 infer 来推导出 ObservableInput<T> 中 T 的具体类型。

```typescript
export type ObservedValueOf<OV> = OV extends ObservableInput<infer T>
  ? T
  : never;
```

## from

from 提供了一种映射的功能，可以将传入的数据映射成 Observables 。它可以接受以下参数：

- 原生数组 和 Iterable<T>
- dom 迭代器
- Promise<T>
- Observable<T>

稍微的修剪了一下，源码如下：

```typescript
export function from<T>(input: ObservableInput<T>): Observable<T> {
  return new Observable<T>(subscribeTo(input));
}
```

它直接创建一个新的 Observable，并且调用了 subscribeTo ，根据输入类型，对输入进行不同的处理。

- 如果输入是 Observable，调用 subscribeToObservable。
- 如果输入是原生数组，调用 subscribeToArray。
- 如果输入是 Promise，调用 subscribeToPromise。
- 如果输入是生成器，调用 subscribeToIterable

### subscribeToArray

如果输入是原生数组或者是实现了数组功能的数据结构，那么直接调用 subscriber.next 把所有数据依次发送给订阅者。

```typescript
export const subscribeToArray =
  <T>(array: ArrayLike<T>) =>
  (subscriber: Subscriber<T>) => {
    for (let i = 0, len = array.length; i < len && !subscriber.closed; i++) {
      subscriber.next(array[i]);
    }
    subscriber.complete();
  };
```

### subscribeToObservable

如果输入是 Obervable，那么要通过一个特定的 Symbol 取出 Observable，然后再订阅它。

（基于 Symbol 的特性，当前很多项目都会使用一个固定的 Symbol 对特定数据取值，来验证这个数据是不是符合类型）。

```typescript
export const subscribeToObservable =
  <T>(obj: any) =>
  (subscriber: Subscriber<T>) => {
    const obs = obj[Symbol_observable]();
    if (typeof obs.subscribe !== "function") {
      throw new TypeError(
        "Provided object does not correctly implement Symbol.observable"
      );
    } else {
      return obs.subscribe(subscriber);
    }
  };
```

### subscribeToPromise

如果输入是一个 Promise，那么通过 then 获取到 Promise 的内容，并将内容发送给订阅者。

```typescript
export const subscribeToPromise =
  <T>(promise: PromiseLike<T>) =>
  (subscriber: Subscriber<T>) => {
    promise.then(
      (value) => {
        if (!subscriber.closed) {
          subscriber.next(value);
          subscriber.complete();
        }
      },
      (err: any) => subscriber.error(err)
    );
    return subscriber;
  };
```

### subscribeToIterable

生成器跟数组的方式类似，也是通过循环的方式将数据发送给订阅者。

```typescript
export const subscribeToIterable =
  <T>(iterable: Iterable<T>) =>
  (subscriber: Subscriber<T>) => {
    const iterator = (iterable as any)[Symbol_iterator]();

    do {
      let item: IteratorResult<T>;
      try {
        item = iterator.next();
      } catch (err) {
        subscriber.error(err);
        return subscriber;
      }
      if (item.done) {
        subscriber.complete();
        break;
      }
      subscriber.next(item.value);
      if (subscriber.closed) {
        break;
      }
    } while (true);

    return subscriber;
  };
```

## generate

generate 可以让你用一种类似 for 循环的方式获得数据流。不过，我目前还没有遇到过非常需要这种方式生成流的方式，如果你遇到这种情况，欢迎交流。一般来说，我习惯于这样调用它

```typescript
const observable = generate({
  initialState: 1,
  condition: (x) => x < 5,
  iterate: (x) => x + 1,
});

observable.subscribe((value) => {
  console.log(value);
});

// 打印结果
// 1
// 2
// 3
// 4
```

原来的源码包含了较多的参数判断，把内部逻辑梳理一下，实际上就是分为三个大步骤：

- 判断结束条件， 如果为假代表已经结束，则应该完成订阅，否则进行下一步。
- 发送数据订阅给到订阅者。
- 调用迭代方法，生成下一组数据，重复第一步。

```typescript
export function generate<S>(options: GenerateOptions<S>): Observable<S> {
  const initialState = options.initialState;
  const condition = options.condition;
  const iterate = options.iterate;

  // 返回 Observable
  return new Observable<S>((subscriber) => {
    let state = initialState;
    try {
      while (true) {
        // 判断结束条件
        if (condition && !condition(state)) {
          subscriber.complete();
          break;
        }
        // 发送数据给订阅者
        subscriber.next(state);

        // 调用迭代，获取下一组数据
        state = iterate(state);

        if (subscriber.closed) {
          break;
        }
      }
    } catch (err) {
      subscriber.error(err);
    }

    return undefined;
  });
}
```

其中 GenerateOptions 包含了三个成员，initialState，condition 以及 iterate 。

```typescript
export interface GenerateOptions<S> {
  // 初始状态
  initialState: S;

  // 结束条件
  condition?: (x: S) => boolean;

  // 迭代方式
  iterate: (x: S) => S;
}
```

## range

range 可以创建一个给定范围的数字流。这个主要就是提供了一个简单的语义化函数，主要就是通过循环给订阅者喂数据。

```typescript
export function range(start: number = 0, count?: number): Observable<number> {
  return new Observable<number>((subscriber) => {
    if (count === undefined) {
      count = start;
      start = 0;
    }

    for (let index = 0; index < count; ++index) {
      subscriber.next(start + index);
      if (subscriber.closed) {
        break;
      }
    }

    return undefined;
  });
}
```

## fromEvent & fromEventPattern

### fromEvent

fromEvent 是的 Observable 可以封装一系列的系统事件。既可以接受 NodeJS EventEmitter，也可以接受 DOM EventTarget， JQuery-like event target, NodeList 或者 HTMLCollection 等浏览器对象。

```typescript
const clicksA = fromEvent(document, "click");
const clicksB = fromEvent($(document), "click");

clicksA.subscribe((x) => console.log("A: ", x));
clicksB.subscribe((x) => console.log("B: ", x));

// 每当点击一下页面，都会打印出 event 。
```

它的实现很简单，根据 target 的对象类型调用其对应的事件监听函数，然后通过 subscriber 调用 next 获取到订阅的输出。为了方便阅读，我稍微的改了一下，让 fromEvent 只支持 DOM EventTarget。

```typescript
export interface HasEventTargetAddRemove<E> {
  addEventListener(
    type: string,
    listener: ((evt: E) => void) | null,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener?: ((evt: E) => void) | null,
    options?: EventListenerOptions | boolean
  ): void;
}

// 一个只支持 DOM EventTarget 的 fromEvent
export function fromEvent<T>(
  target: HasEventTargetAddRemove<T>,
  eventName: string,
  options?: EventListenerOptions
): Observable<T> {
  return new Observable<T>((subscriber) => {
    // 处理结果
    const handler = (...e: T[]) => subscriber.next(e.length === 1 ? e[0] : e);

    // 调用 addEventListener，并让其在 handler 中处理。
    target.addEventListener(eventName, handler, options);

    // 取消订阅的时候，直接调用 removeEventListener 对 dom 取消订阅。
    // 返回的是一个函数，这个函数负责了取消订阅的时，所做的内容。
    return () => {
      target.removeEventListener(eventName, handler, options);
    };
  });
}
```

上面的代码可以分解成这三个步骤：

- 在闭包中创建一个 handler 函数，handler 函数最终会调用 subscriber.next。
- 为 target 添加指定事件监听。
- 为 subscriber 添加一个销毁 target 事件监听的逻辑。

对于其他的事件监听，不再赘述，流程完全是一样。

### fromEventPattern

fromEventPattern 则是对 fromEvent 的泛化。

```typescript
function addClickHandler(handler) {
  document.addEventListener("click", handler);
}

function removeClickHandler(handler) {
  document.removeEventListener("click", handler);
}

const clicks = fromEventPattern(addClickHandler, removeClickHandler);
clicks.subscribe((x) => console.log(x));

// 点击的时候，就会输出点击事件。
```

它的源码的与 fromEvent 类似。

```typescript
export type NodeEventHandler = (...args: any[]) => void;

export function fromEventPattern<T>(
  addHandler: (handler: NodeEventHandler) => any,
  removeHandler?: (handler: NodeEventHandler, signal?: any) => void
): Observable<T | T[]> {
  return new Observable<T | T[]>((subscriber) => {
    const handler = (...e: T[]) => subscriber.next(e.length === 1 ? e[0] : e);

    // 有一点不同的地方在于，获取了返回值 addHandler 的返回值
    let retValue: any;
    try {
      retValue = addHandler(handler);
    } catch (err) {
      subscriber.error(err);
      return undefined;
    }

    if (!isFunction(removeHandler)) {
      return undefined;
    }

    // 然后在这里传入 removeHandler 中
    return () => removeHandler(handler, retValue);
  });
}
```

## bindCallback， bindNodeCallback

它们都是一种特殊的 Operator ，思路应该是源于 Function.bind ，提供一种转换操作，将带有回调的函数转换成 Observable Factory。

```typescript
function setTimeoutWithCallback(callback: () => void) {
  setTimeout(() => {
    callback();
  }, 2000);
}

const obfactory = bindCallback(setTimeoutWithCallback);

const ob1 = obfactory();
const ob2 = obfactory();
const now = Date.now();

ob1.subscribe(() => {
  console.log("ob1" + (Date.now() - now));
});

setTimeout(() => {
  ob1.subscribe(() => {
    console.log("ob1 later: " + (Date.now() - now));
  });

  ob2.subscribe(() => {
    console.log("ob2: " + (Date.now() - now));
  });
}, 3000);

// 打印结果：
// ob1: 2001
// ob1 later: 3004
// ob2: 5008
```

以下是 bindNodeCallback 的例子。

```typescript
/* 
    file: ~/desktop/test.json

    { "name": "Hello World" }
 */

import * as fs from "fs";

const readerFactory = bindNodeCallback(fs.readFile);

const reader$ = readerFactory("./src/person.json");

reader$.subscribe({
  next: (value) => console.log(value.toString()),
  error: (err) => console.log(err),
  complete: () => console.log("complete"),
});

// 如果没有错误，打印结果如下：
// { name: 'Hello World' }
// complete

// 如果有错误，打印结果如下：
// [Error: ENOENT: no such file or directory, open './src/person.json'] {
//     errno: -2,
//     code: 'ENOENT',
//     syscall: 'open',
//     path: './src/person'
// }
```

bindCallback 和 bindNodeCallback 的源码非常类似。

```typescript
export function bindCallback<T>(
  callbackFunc: Function
): (...args: any[]) => Observable<T> {
  return function (this: any, ...args: any[]): Observable<T> {
    const context = this;
    //
    let subject: AsyncSubject<T>;

    return new Observable<T>((subscriber) => {
      if (!subject) {
        subject = new AsyncSubject<T>();
        const handler = (...innerArgs: any[]) => {
          subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
          subject.complete();
        };

        try {
          callbackFunc.apply(context, [...args, handler]);
        } catch (err) {
          subject.error(err);
        }
      }
      return subject.subscribe(subscriber);
    });
  };
}
```

bindCallback 和 bindNodeCallback 的源码唯一不同的地方就是在于 handler 这个函数处理的内容不同，bindNodeCallback 传入的函数的回调，第一个参数为是错误信息。

```typescript
const handler = (...innerArgs: any[]) => {
  const err = innerArgs.shift();
  // 如果第一个参数存在，说明有问题。
  if (err) {
    subject.error(err);
    return;
  }
  subject.next(innerArgs.length <= 1 ? innerArgs[0] : innerArgs);
  subject.complete();
};
```

源码中比较有趣的地方在于，创建的时候，返回的工厂函数包含了一个 AsyncSubject。这个 AsyncSubject 保存了已经到来数据，可以看看例子中，ob1 被订阅了 2 次，第二次订阅后实际上是立刻就能拿到返回值；而 ob2 仍要执行一次 setTimeoutWithCallback。这种设计与这个 bind 的语义相吻合。

## interval & timer

上面的 operators 中，我已经把 scheduler 相关的内容进行了裁剪，基本上与 scheduler 无关。而 interval 和 timer 都必须通过 scheduler 来相应的定时操作，所以这部分放到了最后。它们是用于创建定时数据源的 operators 。

- interval： 传入的参数表示每隔指定毫秒发送一条数据。
- timer：传入的第一个参数是指第一条发送数据的时间间隔，第二个参数是指后续数据发送的间隔。

```typescript
const observableA = interval(1000).pipe(take(2));

const observableB = timer(500, 1000).pipe(take(3));

console.log("hello");

observableA.subscribe((value) => {
  console.log("A: " + value);
});

observableB.subscribe((value) => {
  console.log("B: " + value);
});

// 打印结果
// hello
// B: 0
// A: 0
// B: 1
// A: 1
// B: 2
```

interval 和 timer 都使用了一个默认的异步调度器，这个异步调度器主要是通过 setInterval 来实现相应的功能，实际上 Rx 把异步调度器通过 interval 和 timer 转化成 Observable 的形式提供到给用户。

### timer Source Code

timer 的实现如下图所示。它首先创建了一个 Observable ，然后在订阅函数中，返回调度器的订阅。在这里， scheduler 的 schedule 函数返回了一个 Subscription。

```typescript
export function timer(
  dueTime: number | Date = 0,
  period: number,
  scheduler: SchedulerLike = async
): Observable<number> {
  return new Observable((subscriber) => {
    let due = 0;
    // 判断是不是 Date 类型
    if (dueTime instanceof Date) {
      due = +dueTime - scheduler.now();
    }
    // 判断是不是 number 类型
    if (isNumeric(dueTime)) {
      due = dueTime as number;
    }

    // 此处调用跟 interval 类似。
    return scheduler.schedule(dispatch, due, {
      index: 0,
      period,
      subscriber,
    });
  });
}
```

dispatch 实际上是一个递归函数，这个函数绑定了 SchedulerAction ，通过传入订阅者，使得 Action 内部的 setInterval 能够一直调用 subscriber.next。

```typescript
interface TimerState {
  index: number;
  period: number;
  subscriber: Subscriber<number>;
}

function dispatch(this: SchedulerAction<TimerState>, state: TimerState) {
  const { index, period, subscriber } = state;
  subscriber.next(index);

  if (subscriber.closed) {
    return;
  } else if (period === -1) {
    return subscriber.complete();
  }

  state.index = index + 1;
  this.schedule(state, period);
}
```

### interval Source Code

以下是 interval 的源码。

```typescript
export function interval(period = 0): Observable<number> {
  if (!isNumeric(period) || period < 0) {
    period = 0;
  }

  const scheduler = async;

  return new Observable<number>((subscriber) => {
    // 订阅器接收 scheduler 的订阅结果。
    subscriber.add(
      scheduler.schedule(dispatch, period, { subscriber, counter: 0, period })
    );
    return subscriber;
  });
}
```

仔细的分析上面的代码，我发现 interval 的实现实际上就是 timer 的一个约束版本，它可以改写成这样

```typescript
export function interval(
  period = 0,
  scheduler: SchedulerLike = async
): Observable<number> {
  if (!isNumeric(period) || period < 0) {
    period = 0;
  }

  return timer(period, period, sch);
}
```

> 作者：zcx <br>
> 原文：<https://mp.weixin.qq.com/s/vIXe_cywMTv03njLLtvQNQ>