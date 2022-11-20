---
title: 我不知道的 JS 之 delete 操作符
date: 2020-07-03
tags:
  - JavaScript
categories:
  - 前端
---

> MDN：delete 操作符用于删除对象的某个属性；如果没有指向这个属性的引用，那它最终会被释放。 这个简单的解释不禁引发了以下几个疑问：

## delete 和内存释放有什么关系？

从 MDN 的这个介绍我们可以知道，delete 操作符一般是用于对象的，它是用来删除对象上的属性的；而你使用了 delete 操作符之后，并不是立刻就会释放这个属性的引用，它只是把这个属性和这个对象解除绑定，比如我们通过下面的代码就可以知道这点：

```javascript
var obj = {
  a: 1,
  b: { c: 1 },
};
var new_obj = obj.b;
delete obj.a;
delete obj.b;
console.log(obj); // {}
console.log(new_obj); // {c: 1}
```

通过上面的代码我们知道，没有其他变量指向 obj 的 a 属性的引用（而且它是一个原始值），而 new\_obj 指向了 obj 的 b 属性的引用，当我们删除了 obj 的 a 属性和 b 属性之后，obj 就变成了一个空对象，而 obj 本来 b 属性的引用此时还存在，因此它不会回收掉；从这个例子就可以看出：delete 操作符和释放内存无关，它只是断开了对象和属性的引用关系。只有当没有其他变量指向你删除的属性的引用时，这个属性所处的内存区块才会被下一次垃圾回收时释放。

## delete 只能用在对象属性上吗？如果我用在值上会怎么样？

delete 操作符的语法是：

```javascript
delete expression;
```

也就是说 delete 操作符会把它的操作数当成一个表达式，进而去删除这个表达式计算的结果。所以，“delete x”归根到底，是在删除一个表达式的、引用类型的结果（Result），而不是在删除 x 表达式，或者这个删除表达式的值（Value）。 所以，现在这里的 x，其实不是值（Value）类型的数据，而是一个表达式运算的结果（Result）。而在进一步的删除操作之前，JavaScript 需要检测这个 Result 的类型：

- 如果它是值，则按照传统的 JavaScript 的约定返回 true；
- 如果它是一个引用，那么对该引用进行分析，以决定如何操作。 这个检测过程说明，ECMAScript 约定：任何表达式计算的结果（Result）要么是一个值，要么是一个引用。并且需要留意的是，在这个描述中，所谓对象，其实也是值。准确地说，是“非引用类型”。例如：delete {}也会被当成值来处理。 再删除这些所谓的值的时候，遵循这样一个原则：delete 运算发现它的操作数是“值 / 非引用类型”，就直接返回了 true。其实什么也没有发生。 这里其实有一个例外，而这个例外我们后面再解释是为什么；就是 delete undefined 返回的结果是 false，这与我们之前提出的原则相矛盾。这里就引出了下一个问题：delete 不能删除什么？

## delete 不能移除什么？

这个问题 MDN 上有详细解答，并且指出几种 delet 不能删除的值，这里我们稍微做一下总结归纳，其实就一点：delete 不能移除不可设置的(Non-configurable)属性。

- MDN 上提到 delete 不能移除用 var 声明的变量，这是因为 var 声明的变量我们知道是直接挂在在全局对象下作为全局对象的属性的，当它被挂载时会被置为不可设置的(Non-configurable)属性

```javascript
var a = 1;
b = 2; // 直接使用未声明的变量在非严格模式下不会报错，并且也会被挂载到全局对象下
console.log(Object.getOwnPropertyDescriptor(window, "a"));
// {value: 1, writable: true, enumerable: true, configurable: false}
console.log(Object.getOwnPropertyDescriptor(window, "b"));
// {value: 2, writable: true, enumerable: true, configurable: true}
delete a; // false
delete b; // true
```

- MDN 上还提到 let 和 const 声明的变量也不能被删除，这个我没有想到可以演示的代码，但是猜测 let 和 const 声明的变量会挂载到它所在的作用域下，并且也是不可设置的(Non-configurable)属性（PS：如果想到示例再补充示例代码）

## 为什么 delete undefined 返回 false

这里引用大神的回答：

> 早期的 JavaScript 中，undefined 是一个特殊值，是在运行期中通过 void 运算，或者不返回值的函数，又或者一个声明了但未赋值的变量，等等类似这样的情况来“计算得到”的。
> 
> 所以在 JavaScript 的早期版本中，你没有办法直接判断“undefined 是 undefined”，例如无法写出 x === undefined 这样的代码，而你只能写类似 typeof(x) ==='undefined'这样的代码。 
> 
> 后来（其实也没有太久），规范就约定把 undefined 作为可以缺省访问的名字，类似于 null。但是这个时候就带来了一个矛盾，因为这个 undefined 很重要，早期的绝大多数框架或引擎都把它作为一个“全局名字”给声明了。
> 
> 也就是说，ECMAScript 现在既没有办法将它规范成一个 keyword，也没有办法处理成保留字等等，它看起来像 null，但又没有办法在规范层面强制它。 
> 
> 所以……ECMAScript 就搞了一个“奇招”：我们把 undefined 声明成全局的属性，怎么样？！ 嗯嗯，很好。
> 
> 所以你看，现在的引擎上面 undefined 看起来长得跟 null 值差不多，而且在 ECMAScript 规范中它们都还是平级的（是原始值），而且它们的作用也很接近，最后他们都还是从最初的 JavaScript 1.x 中就存在的概念，但是 undefined/null 两者却在实现上完全不同：undefined 是一个全局属性，而 null 是一个关键字。 
> 
> 由于 undefined 是全局属性，所以 delete undefined 其实就是 delete global.undefined，是删除引用，而不是删除值。而这个属性是只读的，所以就返回 false 了。

讲道理这段历史还挺有意思的，这点可以通过以下代码来印证：

```javascript
console.log(void 0 === undefined); // true
delete void 0; // true
delete undefined; // false
delete null; // true
console.log(Object.getOwnPropertyDescriptor(window, "undefined"));
// {value: undefined, writable: false, enumerable: false, configurable: false}
console.log(Object.getOwnPropertyDescriptor(window, "null"));
// undefined
```

delete 总结：

- delete 只会在移除对象属性失败的情况下返回 false，而这种情况只会发生在这个属性是一个不可设置的(Non-configurable)属性，
- delete 通常会在这个操作什么也不干的情况下（虽然第一条它也是什么都没干）返回 true，或者在成功移除对象属性时返回 true
- delete 操作只会在自身的属性上起作用，如果对象的原型链上有一个与待删除属性同名的属性，那么删除属性之后，对象会使用原型链上的那个属性

> 作者：卢伟 <br>
> 原文：<https://zhuanlan.zhihu.com/p/149975274>
