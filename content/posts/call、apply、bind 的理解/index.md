---
title: call、apply、bind 的理解
date: 2017-06-05
tags:
  - JavaScript
categories:
  - 前端
---

## call()

语法：

```javascript
fun.call(thisArg[, arg1[, arg2[, ...]]])
```

thisArg：fun 函数运行时指定的 this 值，可能的值为：

- 不传，或者传 null，undefined， this 指向 **window 对象**
- 传递另一个函数的函数名 fun2，this 指向**函数 fun2 的引用**
- 值为原始值(数字，字符串，布尔值),this 会指向该原始值的自动包装对象，如 String、Number、Boolean
- 传递一个对象，函数中的 this 指向这个对象

例如：

```javascript
function a() {
  console.log(this);
}

function b() {}

a.call(b);
```

经常会看到这种使用情况：

```javascript
function list() {
  return Array.prototype.slice.call(arguments);
}

list(1, 2, 3);
```

为什么能实现这样的功能将 arguments 转成数组？首先 call 了之后，this 指向了所传进去的 arguments。我们可以假设 slice 方法的内部实现是这样子的：创建一个新数组，然后 for 循环遍历 this，将 this\[i]一个个地赋值给新数组，最后返回该新数组。因此也就可以理解能实现这样的功能了。

## apply()

语法：

```javascript
fun.apply(thisArg[, argsArray])
```

例如：

```javascript
var numbers = [5, 6, 2, 3, 7];
var max = Math.max.apply(null, numbers);

console.log(max); // 7
```

平时 Math.max 只能这样子用：`Math.max(5,6,2,3,7)`;

利用 apply 的第二个参数是数组的特性，从而能够简便地从数组中找到最大值。

## bind()

语法：

```javascript
fun.bind(thisArg[, arg1[, arg2[, ...]]]);
```

bind()方法会创建一个新函数，称为绑定函数。

bind 是 ES5 新增的一个方法，不会执行对应的函数（call 或 apply 会自动执行对应的函数），而是返回对绑定函数的引用。

当调用这个绑定函数时，thisArg 参数作为 this，第二个以及以后的参数加上绑定函数运行时本身的参数按照顺序作为原函数的参数来调用原函数。

简单地说，bind 会产生一个新的函数，这个函数可以有预设的参数。

```javascript
function list() {
  return Array.prototype.slice.call(arguments);
}

var leadingThirtysevenList = list.bind(undefined, 37);
var list = leadingThirtysevenList(1, 2, 3);
console.log(list);
```

把类数组换成真正的数组，bind 能够更简单地使用：

```javascript
var slice = Array.prototype.slice;
slice.apply(arguments);
```

```javascript
var unboundSlice = Array.prototype.slice;
var slice = Function.prototype.apply.bind(unboundSlice);
slice(arguments);
```

## 区别

- 相同之处：
  - 改变函数体内 this 的指向。
- 不同之处：
  - call、apply 的区别：接受参数的方式不一样。
  - bind：不立即执行。而 apply、call 立即执行。

> 作者：凹凸实验室 <br>
> 原文：<https://juejin.cn/post/6844903444235419656>
