---
title: 容易被忽略的 ES6 方法
date: 2021-07-28
tags:
  - ES6
categories:
  - 前端
---

熟练并广泛使用 ES6 语法，能够帮助我们在面对复杂应用时，仍可以写出稳健、规范、高效的代码，大大提升开发效率。

除了常用的 let、const、箭头函数和 Promise 对象外，es6 还有很多能够提升开发效率，但容易被忽视的语法：

## 返回数值的整数部分

最容易想到的是 `parseInt`、`Math.floor()`、`Math.ceil()`、`Math.round()`，`parseInt` 方法是先将内容转换成 Number 类型，再进行取整，这样对于数值类型的值的话会有额外的开销，而 `Math.floor()` 和 `Math.ceil()` 对于正数和负数的取整要看情况使用。

**es6 提供 `Math.trunc` 方法**

```javascript
const a = Math.trunc(-3.1);

// 输出b：-3
```

虽然 `Math.trunc` 内部也是使用 Number 方法将其先转为数值，但对比 `parseInt`，`Math.trunc` 在数字极大或者极小，自动采用科学计数法时不会出错：

```javascript
const a = parseInt(3.111e22);
const b = Math.trunc(3.111e22);
// 输出a：3
// 输出b：3.111e22
```

## 数组去重

最常用的方法就是双层循环判断：外层循环元素，内层循环对比，通过 splice 来删除重复的元素；或者就是外层 for 循环，利用语法自身键不可重复性（比如 indexOf）来实现。总之，不管怎样都需要一小段代码来实现，不是很简便。

**es6 提供 `Array.from(new Set(arr))`：**

```javascript
const a = [1, 2, 3, 3, 2];
const b = Array.from(new Set(a));
// 输出b：[1,2,3]
```

- `Array.from()` 从一个类似数组或可迭代对象中创建一个新的，浅拷贝的数组实例
- `new Set()` 允许你存储任何类型的唯一值

同时通过拓展运算符 `...` 可以实现多个数组的合并且去重：

```javascript
const a = [1, 2, 3];
const b = [2, 3, 4];
const c = Array.from(new Set([...a, ...b]));
// 输出c：[1,2,3,4]
```

## 判断数组中是否存在某一元素

常规方法是使用 `indexOf` ，通过对比元素的出现位置来判断是否存在

```javascript
const a = [1, 2, 3];
const b = a.indexOf(2);
// 输出b：1
```

**es6 提供 `Array.prototype.includes`：**

```javascript
const a = [1, 2, 3];
const b = a.includes(2);
// 输出b：true
```

同时，`includes` 还有第二个参数，表示搜索的起始位置，如果第二个参数为负数，则表示倒数的位置：

```javascript
const a = [1, 2, 3].includes(3, -1);
// 输出a：true
```

如果这时它大于数组长度（比如第二个参数为 `-4`，但数组长度为 `3`），则会重置为从 `0` 开始。

相比于 `indexOf`，`includes` 的语义化更强，由于其内部不是使用严格的相等运算符（`===`）进行判断，因此不会导致对 NaN 的误判：

```javascript
const a = [NaN].indexOf(NaN);
// 输出：-1
const b = [NaN].includes(NaN);
// 输出b：true
```

## 数组 find() 与 findIndex() 方法

如果要找出一个数组中第一个小于 0 的数或者索引，首先想到的可能是用循环遍历，将查到的值赋值给一个变量

**es6 提供 `find()`与 `findIndex()`方法：**

```javascript
const a = [1, -1, 2, 3];
const b = a.find((item) => {
  return item < 0;
});
// 输出b：-1
```

## 链判断运算符

在项目开发中，我们经常会遇到要取结构深层数据的情况，下面的一行代码就在所难免：

```javascript
const price = data.result.redPacket.price;
```

那么当某一个 key 不存在时，undefined.key 就会报错，通常我们会优化成下面的样子：

```javascript
const price =
  (data &&
    data.result &&
    data.result.redPacket &&
    data.result.redPacket.price) ||
  "default";
```

**es6 提供链判断运算符：**

```javascript
const price = data?.result?.redPacket?.price || "default";
```

这样即使某一个 key 不存在，也不会报错，只会返回 undefined

```javascript
a?.b; // 等同于 a == null ? undefined : a.b
a?.[x]; // 等同于 a == null ? undefined : a[x]
a?.b(); // 等同于 a == null ? undefined : a.b()
a?.(); // 等同于 a == null ? undefined : a()
```

<a name="Object.assign"></a>

## Object.assign

`Object.assign` 用于对象的合并，需要注意的是 `Object.assign` 是浅拷贝，而不是深拷贝，它也可以用于处理数组，但是会把数组当成对象来处理，即会把对应相同的 key 的值替换掉：

```javascript
const a = Object.assign([1, 2, 3], [4, 5]);
// 输出a：[4,5,3]
```

<a name="Symbol"></a>

## Symbol

ES6 引入了一种新的原始数据类型 `Symbol`，表示独一无二的值，不会与其他属性名产生冲突，即使两个声明完全一样，也是不相等的：

```javascript
const a = Symbol();
const b = Symbol();
a === b;
// 输出：false
```

开发中，为了区分一种业务逻辑下的不同场景，我们通常会定义几个唯一的常量来区分。比如要区分抽奖弹框在中优惠券、中京豆和中实物奖下的弹框样式，最常用的就是定义 type 分别为 `coupon`、`jbean`、`award`：

```javascript
const POPUP_COUPON = "coupon";
const POPUP_JBEAN = "jbean";
const POPUP_AWARD = "award";

switch (result.type) {
  case POPUP_COUPON:
    show(result);
    break;
  case POPUP_JBEAN:
    show(result);
    break;
  case POPUP_AWARD:
    show(result);
    break;
  default:
    break;
}
```

我们把上面定义的 3 个常量叫做“魔术字符串”（“魔法字符串”：指的是，在代码中多次出现、与代码形成强耦合的某一个具体的字符串或数值。——阮一峰），不利于后期代码的维护和修改。其实我们可以发现 POPUP_COUPON 具体是什么值并不重要，只要能够唯一区分就行，这个时候就可以考虑使用 Symbol：

```javascript
const POPUP_COUPON = Symbol();
const POPUP_JBEAN = Symbol();
const POPUP_AWARD = Symbol();
```

这样就没有额外需要维护的内容

## Proxy 和 Reflect

es6 新增的代理 `Proxy` 和反射 `Reflect` 在日常开发中用到的比较少，一般用于修改某些操作的默认行为，等同于在语言层面做出修改，所以属于一种“元编程”（meta programming），即对编程语言进行编程。

在 Vue3.0 中，响应式数据部分弃用了 `Object.defineProperty`，使用 `Proxy` 来代替它，主要是因为使用 `Object.defineProperty` 检测不到对象属性的添加和删除，同时当 data 中数据较多且层级很深的时候，会有性能问题，因为要遍历 data 中所有的数据，并将其设置成响应式：

```javascript
const obj = {
  name: "cxx",
  age: 18,
  a: {
    b: 1,
  },
};

class Observer {
  constructor(data) {
    for (let key of Object.keys(data)) {
      if (typeof data[key] === "Object") {
        data[key] = new Observer(data[key]);
      }
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          console.log("get 你访问了" + key);
          return data[key];
        },
        set(val) {
          console.log("set 你设置了" + key);
          console.log("新的" + key + "=" + val);
          if (val === data[key]) {
            return;
          }
          data[key] = val;
        },
      });
    }
  }
}

const app = new Observer(obj);

console.log("1----", app.a.b);
// get 你访问了a
// 1---- 1

app.age = 20;
// set 你设置了age
// 新的age=20

console.log("2----", app.age);
// get 你访问了age
// 2---- 20

app.newPropKey = "新属性";
console.log("3----", app.newPropKey);
// 3---- 新属性
```

可以看到，给对象添加新属性 `newPropKey` 时，内部并没有监听到，它只能监听到已经存在的属性，新增属性需要通过 `Vue.set` 手动再次添加

下面使用 `Proxy` 替代 `Object.defineProperty` 实现：

```javascript
const obj = {
  name: "cxx",
  age: 18,
  a: {
    b: 1,
  },
};

const p = new Proxy(obj, {
  get(target, propKey, receiver) {
    console.log("你访问了" + propKey);
    return Reflect.get(target, propKey, receiver);
  },
  set(target, propKey, val, receiver) {
    console.log("set 你设置了" + propKey);
    console.log("新的" + propKey + "=" + val);
    Reflect.set(target, propKey, val, receiver);
  },
});

console.log("1----", p.a.b);
// 你访问了a
// 1---- 1

p.age = 20;
// set 你设置了age
// 新的age=20

console.log("2----", p.age);
// 你访问了age
// 2---- 20

p.newPropKey = "新属性";
// set 你设置了newPropKey
// 新的newPropKey=新属性

console.log("3----", p.newPropKey);
// 你访问了newPropKey
// 3---- 新属性
```

可以看到，这个时候，新增的属性 `newPropKey` 并不需要重新添加响应式处理，就能很轻松地添加到对象上。因为 `Object.defineProperty` 只能劫持对象的属性，在监听数据时，新增的属性并不存在，自然不会有 `getter`, `setter`，视图也不会得到更新，而 `Proxy` 可以劫持整个对象，不需要做特殊处理

> 作者：Cxx <br>
> 原文：<https://jelly.jd.com/article/604f04069c61f9014c21ad81>
