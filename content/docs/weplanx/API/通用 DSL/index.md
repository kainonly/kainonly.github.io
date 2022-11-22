---
weight: 20
title: 通用 DSL
---

# 通用 DSL

基于 MongoDB 与 Nats KV 驱动可预期以及面向资源的接口引擎，为低代码前端提供支持，满足对数据多种情况的新增、修改、查询、删除。

通用场景下后端无需定制处理，可对指定资源限定返回结果；同时采用分布消息补偿，对数据变更后进行消息队列发送。

## 新增资源

```
POST /:collection
```

**请求 Request**

- Path
  - <必须> **collection** `string` 集合名称，必须是小写字母与下划线
- Body
  - <必须> **data** `object` 资源数据
  - **format** `object` _Body.data_ 格式转换

**响应 Response**

{{<hint info>}}

返回成功 - 201 Created

- Body
  - **InsertedID** `string` 新增资源 ID

{{</hint>}}

{{<hint danger>}}

返回失败 - 400 Bad Request

- Body
  - **message** `string` 错误消息

{{</hint>}}

{{<tabs `create`>}}
{{<tab `简单示例`>}}

```http
POST /dev_departments HTTP/1.1
Host: xapi.kainonly.com:8443
Content-Type: application/json
Content-Length: 82

{
    "data": {
        "name": "客服组",
        "description": "客服总部门"
    }
}

# 返回

HTTP/1.1 201 Created
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 41
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 06:05:14 GMT
Server: hertz

{
  "InsertedID": "62db8f9b33c11192c28c61a2"
}
```

{{</tab>}}
{{<tab `格式转换示例`>}}

```http
POST /dev_users HTTP/1.1
Host: xapi.kainonly.com:8443
Content-Type: application/json
Content-Length: 151

{
    "data": {
        "username": "weplanx",
        "password": "pass@VAN1234"
    },
    "format": {
        "password": "password"
    }
}

# 返回

HTTP/1.1 201 Created
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 41
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 06:23:25 GMT
Server: hertz

{
  "InsertedID": "62db93de33c11192c28c61a3"
}
```

{{</tab>}}

{{</tabs>}}

## 批量新增资源

```
POST /:collection/bulk-create
```

**请求 Request**

- Path
  - <必须> **collection** `string` 集合名称，必须是小写字母与下划线
- Body
  - <必须> **data** `object[]` 批量资源数据
  - **format** `object` _Body.data[*]_ 格式转换

**响应 Response**

{{<hint info>}}
返回成功 - 201 Created

- Body
  - **InsertedIDs** `string[]` 新增资源 ID 数组

{{</hint>}}

{{<hint danger>}}

返回失败 - 400 Bad Request

- Body

  - **message** `string` 错误消息

{{</hint>}}

{{<tabs `bulk-create`>}}
{{<tab `简单示例`>}}

```http
POST /dev_departments/bulk-create HTTP/1.1
Host: xapi.kainonly.com:8443
Content-Type: application/json
Content-Length: 362

{
    "data": [
        {
            "name": "客服 A 组",
            "parent": "62db8f9b33c11192c28c61a2"
        },
        {
            "name": "客服 B 组",
            "parent": "62db8f9b33c11192c28c61a2"
        },
        {
            "name": "协调组",
            "parent": null
        }
    ],
    "format": {
        "parent": "oid"
    }
}

# 返回

HTTP/1.1 201 Created
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 98
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 06:32:12 GMT
Server: hertz

{
  "InsertedIDs": [
    "62db95ec33c11192c28c61a6",
    "62db95ec33c11192c28c61a7",
    "62db95ec33c11192c28c61a8"
  ]
}
```

{{</tab>}}

{{</tabs>}}

## 获取资源总数

```
GET /:collection/_size
```

**请求 Request**

- Path
  - <必须> **collection** `string` 集合名称，必须是小写字母与下划线
- Query
  - **filter** `object` 筛选条件
  - **format** `object` _Query.filter_ 格式转换

**响应 Response**

{{<hint info>}}

返回成功 - 204 No Content

- Header
  - **x-total** `string(int64)` ，资源总数

{{</hint>}}

{{<hint danger>}}

返回失败 - 400 Bad Request

- Body
  - **message** `string` 错误消息

{{</hint>}}

{{<tabs `size`>}}
{{<tab `简单示例`>}}

```http
GET /dev_table/_size HTTP/1.1
Host: xapi.kainonly.com:8443

# 返回

HTTP/1.1 204 No Content
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Date: Sat, 23 Jul 2022 06:56:46 GMT
Server: hertz
X-Total: 5000
```

{{</tab>}}
{{<tab `筛选示例`>}}

```http
GET /dev_table/_size?filter={"no":{"$in":["CY12008750579FE7390A801K60S7","AZ14FFGW32000766490389800984"]}} HTTP/1.1
Host: xapi.kainonly.com:8443

# 返回

HTTP/1.1 204 No Content
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Date: Sat, 23 Jul 2022 07:00:38 GMT
Server: hertz
X-Total: 2
```

{{</tab>}}
{{<tab `格式转换示例`>}}

```http
GET /dev_table/_size?filter={"_id":{"$in":["62a455a4d2952c7033643763"]}}&format={"_id.$in":"oids"} HTTP/1.1
Host: xapi.kainonly.com:8443

# 返回

HTTP/1.1 204 No Content
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Date: Sat, 23 Jul 2022 07:02:51 GMT
Server: hertz
X-Total: 1
```

{{</tab>}}
{{</tabs>}}

## 获取匹配资源

```
GET /:collection
```

**请求 Request**

- Path
  - <必须> **collection** `string` 集合名称，必须是小写字母与下划线
- Header
  - **x-pagesize** `string(number)` 分页大小，默认 `100` 自定义必须在 `1~1000` 之间
  - **x-page** `string(number)` 分页页码
- Query
  - **filter** `object` 筛选条件
  - **format** `object` _Query.filter_ 格式转换
  - **sort** `string[]` 排序规则，格式为 `<field>:<1|-1>`
  - **keys** `string[]` 投影规则

**响应 Response**

{{<hint info>}}

返回成功 - 200 OK

- Header
  - **X-Total** `string(number)` 资源总数
- Body `object[]` 资源数据

{{</hint>}}
{{<hint danger>}}

返回失败 - 400 Bad Request

- Body
  - **message** `string`，错误消息

{{</hint>}}

{{<tabs `find`>}}

{{<tab `简单示例`>}}

```http
GET /dev_table HTTP/1.1
Host: xapi.kainonly.com:8443

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 54126
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 07:09:03 GMT
Server: hertz
X-Total: 5000

[ ... { "_id": "...", ... } 100 raw ... ]
```

{{</tab>}}
{{<tab `分页示例`>}}

```http
GET /dev_table HTTP/1.1
Host: xapi.kainonly.com:8443
x-page: 2
x-pagesize: 5

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 2716
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 07:19:53 GMT
Server: hertz
X-Total: 5000

[ ... { "_id": "...", ... } 5 raw ... ]
```

{{</tab>}}

{{<tab `筛选示例`>}}

```http
GET /dev_table?filter={"no":{"$in":["CH3105725N28374415016","TR035076242618008689084428"]}} HTTP/1.1
Host: xapi.kainonly.com:8443
```

{{</tab>}}

{{<tab `格式转换示例`>}}

```http
GET /dev_departments?filter={"parent":"62db8e2133c11192c28c61a1"}&format={"parent":"oid"} HTTP/1.1
Host: xapi.kainonly.com:8443
```

{{</tab>}}
{{<tab `投影示例`>}}

```http
GET /dev_table?keys=no&keys=account HTTP/1.1
Host: xapi.kainonly.com:8443
```

{{</tab>}}
{{<tab `排序示例`>}}

```http
GET /dev_table?sort=no:1&sort=account:1 HTTP/1.1
Host: xapi.kainonly.com:8443
```

{{</tab>}}

{{</tabs>}}

## 获取单个资源

```
GET /:collection/_one
```

**请求 Request**

- Path
- <必须> **collection** `string` 集合名称，必须是小写字母与下划线
- Query
  - <必须> **filter** `object` 筛选条件
  - **format** `object` _Query.filter_ 格式转换
  - **keys** `string[]` 投影规则

**响应 Response**

{{<hint info>}}

返回成功 - 200 OK

- Body `object`，资源数据

{{</hint>}}

{{<hint danger>}}

返回失败 - 400 Bad Request

- Body
  - **message** `string` 错误消息

{{</hint>}}

{{<tabs `find-one`>}}

{{<tab `简单示例`>}}

```http
GET /dev_table/_one?filter={"no":"AZ14FFGW32000766490389800984"} HTTP/1.1
Host: xapi.kainonly.com:8443

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 515
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 07:41:43 GMT
Server: hertz

{"name":"Generic Bronze Chips","description":"Carbonite web goalkeeper gloves are ergonomically designed to give easy fit","email":"Hallie.Hammes@hotmail.com","phone":"986636789","price":251.28,"valid":["2022-05-15T03:23:58.222+08:00","2022-06-11T23:19:59.856+08:00"],"_id":"62a455a4d2952c7033643764","account":"32210732","customer":"Mr. Roxanne Gutmann","address":"240 Louvenia Groves","create_time":"2022-02-13T10:27:56.083+08:00","update_time":"2022-02-13T10:27:56.083+08:00","no":"AZ14FFGW32000766490389800984"}
```

{{</tab>}}
{{<tab `格式转换示例`>}}

```http
GET /dev_departments/_one?filter={"parent":"62db8e2133c11192c28c61a1"}&format={"parent":"oid"} HTTP/1.1
Host: xapi.kainonly.com:8443

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 184
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 07:44:00 GMT
Server: hertz

{"_id":"62db95ec33c11192c28c61a7","name":"客服 B 组","parent":"62db8e2133c11192c28c61a1","create_time":"2022-07-23T14:32:12.502+08:00","update_time":"2022-07-23T14:32:12.502+08:00"}
```

{{</tab>}}
{{<tab `投影示例`>}}

```http
GET /dev_table/_one?filter={"no":"AZ14FFGW32000766490389800984"}&keys=no HTTP/1.1
Host: xapi.kainonly.com:8443

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 70
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 07:45:31 GMT
Server: hertz

{"_id":"62a455a4d2952c7033643764","no":"AZ14FFGW32000766490389800984"}
```

{{</tab>}}

{{</tabs>}}

## 获取指定 ID 的资源

```
GET /:collection/:id
```

**请求 Request**

- Path
  - <必须> **collection** `string` 集合名称，必须是小写字母与下划线
  - <必须> **id** `string` 资源 ID，必须为 hex(ObjectId)
- Query
  - keys `string[]` 投影规则

**响应 Response**

{{<hint info>}}

返回成功 - 200 OK

- 响应 Body `object[]` 资源数据

{{</hint>}}

{{<hint danger>}}

返回失败 - 400 Bad Request

- Body
  - **message** `string` 错误消息

{{</hint>}}

{{<tabs `find-by-id`>}}

{{<tab `简单示例`>}}

```http
GET /dev_table/62a455a4d2952c7033643763 HTTP/1.1
Host: xapi.kainonly.com:8443

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 548
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:00:01 GMT
Server: hertz

{"create_time":"2022-03-08T17:12:28.607+08:00","_id":"62a455a4d2952c7033643763","no":"CY12008750579FE7390A801K60S7","name":"Fantastic Plastic Towels","price":980.94,"valid":["2021-09-04T00:23:26.91+08:00","2022-06-12T09:28:07.644+08:00"],"address":"3358 Lang Common","update_time":"2022-03-08T17:12:28.607+08:00","description":"Ergonomic executive chair upholstered in bonded black leather and PVC padded seat and back for all-day comfort and support","account":"94213614","customer":"Faye Hermann","email":"Sven20@hotmail.com","phone":"172828438"}
```

{{</tab>}}
{{<tab `投影示例`>}}

```http
GET /dev_table/62a455a4d2952c7033643763?keys=no HTTP/1.1
Host: xapi.kainonly.com:8443

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 70
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:00:28 GMT
Server: hertz

{"_id":"62a455a4d2952c7033643763","no":"CY12008750579FE7390A801K60S7"}
```

{{</tab>}}

{{</tabs>}}

## 局部更新匹配资源

```
PATCH /:collection
```

**请求 Request**

- Path
  - <必须> **collection** `string` 集合名称，必须是小写字母与下划线
- Query
  - <必须> **filter** `object` 筛选条件
  - **format** `object` _Query.filter_ 格式转换
- Body
  - <必须> **data** `object` 更新操作
  - **format** `object` _Body.data_ 格式转换

**响应 Response**

{{<hint info>}}

返回成功 - 200 OK

- Body
  - **MatchedCount** `number` 匹配数量
  - **ModifiedCount** `number` 修改数量
  - **UpsertedCount** `number` 插入更新数量
  - **UpsertedID** `string` 插入更新的 ID

{{</hint>}}

{{<hint danger>}}

返回失败 - 400 Bad Request

- Body
  - **message** `string` 错误消息

{{</hint>}}

{{<tabs `update`>}}

{{<tab `简单示例`>}}

```http
PATCH /dev_departments?filter={"_id":{"$in":["62db95ec33c11192c28c61a6","62db95ec33c11192c28c61a7"]}}&format={"_id.$in":"oids"} HTTP/1.1
Host: xapi.kainonly.com:8443
Content-Type: application/json
Content-Length: 84

{
    "data": {
        "$set": {
            "status": true
        }
    }
}

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 72
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:12:09 GMT
Server: hertz

{"MatchedCount":2,"ModifiedCount":2,"UpsertedCount":0,"UpsertedID":null}
```

{{</tab>}}
{{<tab `格式转换示例`>}}

```http
PATCH /dev_departments?filter={"_id":{"$in":["62db95ec33c11192c28c61a6","62db95ec33c11192c28c61a7"]}}&format={"_id.$in":"oids"} HTTP/1.1
Host: xapi.kainonly.com:8443
Content-Type: application/json
Content-Length: 161

{
    "data": {
        "$set": {
            "parent": "62db95ec33c11192c28c61a8"
        }
    },
    "format": {
        "$set.parent": "oid"
    }
}

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 72
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:24:24 GMT
Server: hertz

{"MatchedCount":2,"ModifiedCount":2,"UpsertedCount":0,"UpsertedID":null}
```

{{</tab>}}

{{</tabs>}}

## 局部更新指定 ID 的资源

```
PATCH /:collection/:id
```

**请求 Request**

- Path
  - <必须> **collection** `string` 集合名称，必须是小写字母与下划线
  - <必须> **id** `string` 资源 ID，必须为 hex(ObjectId)
- Body
  - <必须> **data** `object` 更新操作
  - **format** `object` _Body.data_ 格式转换

**响应 Response**

{{<hint info>}}

返回成功 - 200 OK

- Body
  - **MatchedCount** `number` 匹配数量
  - **ModifiedCount** `number` 修改数量
  - **UpsertedCount** `number` 插入更新数量
  - **UpsertedID** `string` 插入更新的 ID

{{</hint>}}

{{<hint danger>}}

返回失败 - 400 Bad Request

- Body
  - **message** `string` 错误消息

{{</hint>}}

{{<tabs `update-by-id`>}}

{{<tab `简单示例`>}}

```http
PATCH /dev_users/62db93de33c11192c28c61a3 HTTP/1.1
Host: xapi.kainonly.com:8443
Content-Type: application/json
Content-Length: 239

{
    "data": {
        "$set": {
            "roles": [
                "62890dfd9491cd1f5a0a7082",
                "62a9dfb2e4354d6b89337122"
            ]
        }
    },
    "format": {
        "$set.roles": "oids"
    }
}

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 72
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:33:42 GMT
Server: hertz

{"MatchedCount":1,"ModifiedCount":1,"UpsertedCount":0,"UpsertedID":null}
```

{{</tab>}}

{{</tabs>}}

## 替换指定 ID 的资源

```
PUT /:collection/:id
```

**请求 Request**

- Path
  - <必须> **collection** `string` 集合名称，必须是小写字母与下划线
  - <必须> **id** `string` 资源 ID，必须为 hex(ObjectId)
- Body
  - <必须> **data** `object` 资源数据
  - **format** `object` _Body.data_ 格式转换

**响应 Response**

{{<hint info>}}

返回成功 - 200 OK

- Body
  - **MatchedCount** `number` 匹配数量
  - **ModifiedCount** `number` 修改数量
  - **UpsertedCount** `number` 插入更新数量
  - **UpsertedID** `string` 插入更新的 ID

{{</hint>}}

{{<hint danger>}}

返回失败 - 400 Bad Request

- Body
  - **message** `string` 错误消息

{{</hint>}}

{{<tabs `replace`>}}

{{<tab `简单示例`>}}

```http
PUT /dev_users/62db93de33c11192c28c61a3 HTTP/1.1
Host: xapi.kainonly.com:8443
Content-Type: application/json
Content-Length: 484

{
    "data": {
        "username": "kain",
        "password": "pass@VAN1234",
        "department": "62db95ec33c11192c28c61a8",
        "roles": [
            "62890dfd9491cd1f5a0a7082"
        ],
        "other": {
            "x": {
                "time": "Sat, 23 Jul 2022 08:44:09 GMT"
            }
        }
    },
    "format": {
        "password": "password",
        "department": "oid",
        "roles": "oids",
        "other.x.time": "date"
    }
}

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 72
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:46:45 GMT
Server: hertz

{"MatchedCount":1,"ModifiedCount":1,"UpsertedCount":0,"UpsertedID":null}
```

{{</tab>}}

{{</tabs>}}

## 删除指定 ID 的资源

```
DELETE /:collection/:id
```

**请求 Request**

- Path
  - <必须> **collection** `string` 集合名称，必须是小写字母与下划线
  - <必须> **id** `string` 资源 ID，必须为 hex(ObjectId)

**响应 Response**

{{<hint info>}}

返回成功 - 200 OK

- Body
  - **DeletedCount** 删除数量

{{</hint>}}

{{<hint danger>}}

返回失败 - 400 Bad Request

- Body
  - **message** `string` 错误消息

{{</hint>}}

{{<tabs `delete`>}}

{{<tab `简单示例`>}}

```http
DELETE /dev_users/62db93de33c11192c28c61a3 HTTP/1.1
Host: xapi.kainonly.com:8443

# 返回

HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 18
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:49:29 GMT
Server: hertz

{"DeletedCount":1}
```

{{</tab>}}

{{</tabs>}}

## 批量删除匹配资源

```
POST /:collection/bulk-delete
```

**请求 Request**

- Path
  - <必须> **collection** `string` 集合名称，必须是小写字母与下划线
- Body
  - <必须> **data** `object` 筛选条件
  - **format** `object` _Body.data_ 格式转换

**响应 Response**

{{<hint info>}}

返回成功 - 200 OK

- Body
  - **DeletedCount** 删除数量

{{</hint>}}

{{<hint danger>}}

返回失败 - 400 Bad Request

- Body
  - **message** `string` 错误消息

{{</hint>}}

{{<tabs `bulk-delete`>}}

{{<tab `简单示例`>}}

```http
POST /dev_departments/bulk-delete HTTP/1.1
Host: xapi.kainonly.com:8443
Content-Type: application/json
Content-Length: 323

{
    "data": {
        "_id": {
            "$in": [
                "62db8e2133c11192c28c61a1",
                "62db95ec33c11192c28c61a6",
                "62db95ec33c11192c28c61a7",
                "62db95ec33c11192c28c61a8"
            ]
        }
    },
    "format": {
        "_id.$in": "oids"
    }
}

# 返回
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 18
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:54:02 GMT
Server: hertz

{"DeletedCount":4}
```

{{</tab>}}

{{</tabs>}}

## 排序资源

```
POST /:collection/sort
```

**请求 Request**

- Path
  - <必须> **collection** `string` 集合名称，必须是小写字母与下划线
- Body
  - <必须> **data** `string[]` 资源 ID 数组，更新顺序即数组索引

**响应 Response**

{{<hint info>}}

返回成功 - 204 No Content

{{</hint>}}

{{<hint danger>}}

返回失败 - 400 Bad Request

- Body
  - **message** `string` 错误消息

{{</hint>}}

{{<tabs `sort`>}}

{{<tab `简单示例`>}}

```http
POST /dev_departments/sort HTTP/1.1
Host: xapi.kainonly.com:8443
Content-Type: application/json
Content-Length: 136

{
    "data": [
        "62dbb7895faab23b932eb94c",
        "62dbb7895faab23b932eb94b",
        "62dbb7895faab23b932eb94a"
    ]
}
```

{{</tab>}}

{{</tabs>}}


