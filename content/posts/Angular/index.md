---
title: Angular 记录
date: 2017-03-23
tags:
  - Angular
categories:
  - 前端
---

## 内存栈溢出

在 Angular 编译构建时突然出现

```shell
FATAL ERROR: CALL_AND_RETRY_LAST Allocation failed - process out of memory
```

主要原因可能是 angular 引用了较多的非 es6 module 库，在编译的时候造成包体积过大，因此对 CPU 和内存的需求比较大，出现了内存不足的情况。

目前的解决办法是提高 node 的内存上限，例如：增加 `max_old_space_size` 参数

```json
{
  "scripts": {
    "build": "node --max_old_space_size=8192 ./node_modules/@angular/cli/bin/ng build --prod --buildOptimizer"
  }
}
```

## 动态导入

在 Angular 编译构建库时出现

```shell
angular inlineDynamicImports
```

检查开发库中是否有懒加载，例如：`import()`

## 提示未找到 build-ng-packagr

在 Angular 编译构建库时出现

```shell
an unhandled exception occurred: Cannot find module '@angular-devkit/build-ng-packagr/package.json'
```

检查 `angular.json` 下 `builder` 是否正确

```json
// not "builder": "@angular-devkit/build-ng-packagr:build"
{
  "builder": "@angular-devkit/build-angular:ng-packagr"
}
```

如果正确依然遇到当前问题，那么需要移除项目内 `node_modules` 与 `package-lock.json`，同时需要更新全局的 `@angular/cli`

```shell
npm uninstall -g @angular/cli
npm install -g @angular/cli
```

到项目中

```shell
rm -rf node_modules package-lock.json
npm install
```

## 组件抽象定义类

在 Angular 中有时需要定义一个组件共用的抽象类，按照正常逻辑则是提示

```shell
Class is using Angular features but is not decorated
```

解决方法：在抽象类上增加空的指令装饰器 `@Directive()`

```typescript
/* tslint:disable:directive-class-suffix */

@Directive()
export abstract class BaseComponent {
  @Input() players: any;
}
```

参考文献：

- <https://github.com/angular/angular/issues/35367>
- <https://angular.cn/guide/ivy-compatibility-examples#undecorated-classes>
