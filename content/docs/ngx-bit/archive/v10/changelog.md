---
title: 更新记录
---

## 10.2.0

### New Features

更新异步验证器，允许定制

- handle `Observable<boolean>` 返回验证结果
- field `string` 自定义返回
- dueTime `number` 防抖动延时，默认 `500` ms

```typescript
// 原来的方式
asyncValidator(req: Observable<any>, field = 'duplicated'): Observable<any>

// 更新的方式
asyncValidator(handle: Observable<boolean>, field = 'duplicated', dueTime = 500): Observable<any>
```

## 10.1.1

### New Features

增加初始化完成 `ready` 订阅，解决在获取本地存储后合并 search 时的异步处理

## 10.1.0

### New Features

- 增加环境配置字段

```typesript
export interface BitConfig {
  url: {
    api: string,
    static: string,
    icon?: string
  };
  api: {
    namespace: string,
    upload: string,
    withCredentials: boolean
  };
++  curd: {
++    get: string,
++    lists: string,
++    originLists: string,
++    add: string,
++    edit: string,
++    status: string,
++    delete: string
++  };
  col: {
    [key: string]: any
  };
  locale: {
    default: string,
    mapping: Map<number, string>
    bind: Map<string, any>
  };
  i18n: {
    default: string,
    contain: string[],
    switch: I18nOption[]
  };
  page: number;
}
```

它将决定请求服务中默认的 path，因此需要在环境文件中定义配置

```typescript
const bit = factoryBitConfig({
    ...
  curd: {
    get: '/get',
    lists: '/lists',
    originLists: '/originLists',
    add: '/add',
    edit: '/edit',
    status: '/edit',
    delete: '/delete'
  },
    ...
});
```

- `BitHttpService` 中加入 `order` 排序字段，改良默认 `path` 设置
- 增加排序字段 `order` 设置、提供 `toQuery()` 函数返回 `[]SearchOption`
