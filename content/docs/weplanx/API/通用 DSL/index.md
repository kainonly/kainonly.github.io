---
weight: 20
title: 通用 DSL
---

# 通用 DSL

基于 MongoDB 、Redis 与 Nats 驱动可预期以及面向资源的接口引擎，为低代码前端提供支持，满足对数据多种情况的新增、修改、查询、删除。通用场景下后端无需定制处理，可对指定资源限定返回结果；同时采用分布事务补偿，对数据变更后进行消息队列发送。

## 新增资源

```
POST /dsl/:model
```

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
- _请求 Body_
  - 必须*data *`_object_`_，资源数据_
  - _format _`_object_`_，Body.data 格式转换_

**响应 Response**

:::info
\_返回成功\_201 Created

- _响应 Body_
  - _InsertedID _`_string_`_，新增资源 ID_
    :::
    > \_返回失败\_400 Bad Request
    >
    > - _响应 Body_
    >   - _message _`_string_`_，错误消息_

```http
POST /dsl/dev_departments HTTP/1.1
Host: xapi.kainonly.com:8443
Content-Type: application/json
Content-Length: 82

{
    "data": {
        "name": "客服组",
        "description": "客服总部门"
    }
}
```

```http
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

```http
POST /dsl/dev_users HTTP/1.1
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
```

```http
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

## 批量新增资源

:::tips
POST /dsl/:model/bulk-create
:::

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
- _请求 Body_
  - 必须*data *`_object[]_`_，批量资源数据_
  - _format _`_object_`_，Body.data[*] 格式转换_

**响应 Response**

:::info
\_返回成功\_201 Created

- _响应 Body_
  - _InsertedIDs_`_string[]_`_，新增资源 ID 数组_
    :::
    > \_返回失败\_400 Bad Request
    >
    > - _响应 Body_
    >   - _message _`_string_`_，错误消息_

```http
POST /dsl/dev_departments/bulk-create HTTP/1.1
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
```

```http
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

## 获取资源总数

:::tips
GET /dsl/:model/\_size
:::

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
- _请求 Query_
  - _filter _`_object_`_，筛选条件_
  - _format _`_object_`_，Query.filter 格式转换_

**响应 Response**

:::info
\_返回成功\_204 No Content

- _响应 Header_
  - _x-total_`_string(number)_`_，资源总数_
    :::
    > \_返回失败\_400 Bad Request
    >
    > - _响应 Body_
    >   - _message _`_string_`_，错误消息_

```http
GET /dsl/dev_table/_size HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
HTTP/1.1 204 No Content
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Date: Sat, 23 Jul 2022 06:56:46 GMT
Server: hertz
X-Total: 5000
```

```http
GET /dsl/dev_table/_size?filter={"no":{"$in":["CY12008750579FE7390A801K60S7","AZ14FFGW32000766490389800984"]}} HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
HTTP/1.1 204 No Content
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Date: Sat, 23 Jul 2022 07:00:38 GMT
Server: hertz
X-Total: 2
```

```http
GET /dsl/dev_table/_size?filter={"_id":{"$in":["62a455a4d2952c7033643763"]}}&format={"_id.$in":"oids"} HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
HTTP/1.1 204 No Content
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Date: Sat, 23 Jul 2022 07:02:51 GMT
Server: hertz
X-Total: 1
```

## 获取匹配资源

:::tips
GET /dsl/:model
:::

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
- _请求 Header_
  - _x-pagesize _`_string(number)_`_，分页大小（默认 _`_100_`_ 自定义必须在_`_1~1000_`_之间 ）_
  - _x-page _`_string(number)_`_，分页页码_
- _请求 Query_
  - _filter _`_object_`_，筛选条件_
  - _format _`_object_`_，Query.filter 格式转换_
  - _sort _`_object_`_，排序规则_
  - _keys _`_object_`_，投影规则_

**响应 Response**

:::info
\_返回成功\_200 OK

- _响应 Header_
  - _x-total _`_string(number)_`_，资源总数_
- _响应 Body _`_object[]_`_，资源数据_
  :::
  > \_返回失败\_400 Bad Request
  >
  > - _响应 Body_
  >   - _message _`_string_`_，错误消息_

```http
GET /dsl/dev_table HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 54126
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 07:09:03 GMT
Server: hertz
X-Total: 5000

[ ... { "_id": "...", ... } 100 raw ... ]
```

```http
GET /dsl/dev_table HTTP/1.1
Host: xapi.kainonly.com:8443
x-page: 2
x-pagesize: 5
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 2716
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 07:19:53 GMT
Server: hertz
X-Total: 5000

[ ... { "_id": "...", ... } 5 raw ... ]
```

```http
GET /dsl/dev_table?filter={"no":{"$in":["CH3105725N28374415016","TR035076242618008689084428"]}} HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
GET /dsl/dev_departments?filter={"parent":"62db8e2133c11192c28c61a1"}&format={"parent":"oid"} HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
GET /dsl/dev_table?keys={"name":1} HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
GET /dsl/dev_table?sort={"no":1} HTTP/1.1
Host: xapi.kainonly.com:8443
```

## 获取单个资源

:::tips
GET /dsl/:model/\_one
:::

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
- _请求 Query_
  - 必须*filter *`_object_`_，筛选条件_
  - _format _`_object_`_，Query.filter 格式转换_
  - _keys _`_object_`_，投影规则_

**响应 Response**

:::info
\_返回成功\_200 OK

- _响应 Body _`_object_`_，资源数据_
  :::
  > \_返回失败\_400 Bad Request
  >
  > - _响应 Body_
  >   - _message _`_string_`_，错误消息_

```http
GET /dsl/dev_table/_one?filter={"no":"AZ14FFGW32000766490389800984"} HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 515
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 07:41:43 GMT
Server: hertz

{"name":"Generic Bronze Chips","description":"Carbonite web goalkeeper gloves are ergonomically designed to give easy fit","email":"Hallie.Hammes@hotmail.com","phone":"986636789","price":251.28,"valid":["2022-05-15T03:23:58.222+08:00","2022-06-11T23:19:59.856+08:00"],"_id":"62a455a4d2952c7033643764","account":"32210732","customer":"Mr. Roxanne Gutmann","address":"240 Louvenia Groves","create_time":"2022-02-13T10:27:56.083+08:00","update_time":"2022-02-13T10:27:56.083+08:00","no":"AZ14FFGW32000766490389800984"}
```

```http
GET /dsl/dev_departments/_one?filter={"parent":"62db8e2133c11192c28c61a1"}&format={"parent":"oid"} HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 184
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 07:44:00 GMT
Server: hertz

{"_id":"62db95ec33c11192c28c61a7","name":"客服 B 组","parent":"62db8e2133c11192c28c61a1","create_time":"2022-07-23T14:32:12.502+08:00","update_time":"2022-07-23T14:32:12.502+08:00"}
```

```http
GET /dsl/dev_table/_one?filter={"no":"AZ14FFGW32000766490389800984"}&keys={"no":1} HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 70
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 07:45:31 GMT
Server: hertz

{"_id":"62a455a4d2952c7033643764","no":"AZ14FFGW32000766490389800984"}
```

## 获取指定 ID 的资源

:::tips
GET /dsl/:model/:id
:::

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
  - 必须*id *`_string_`_，资源 ID，必须为 hex(ObjectId)_
- _请求 Query_
  - _keys _`_object_`_，投影规则_

**响应 Response**

:::info
\_返回成功\_200 OK

- _响应 Body _`_object[]_`_，资源数据_
  :::
  > \_返回失败\_400 Bad Request
  >
  > - _响应 Body_
  >   - _message _`_string_`_，错误消息_

```http
GET /dsl/dev_table/62a455a4d2952c7033643763 HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 548
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:00:01 GMT
Server: hertz

{"create_time":"2022-03-08T17:12:28.607+08:00","_id":"62a455a4d2952c7033643763","no":"CY12008750579FE7390A801K60S7","name":"Fantastic Plastic Towels","price":980.94,"valid":["2021-09-04T00:23:26.91+08:00","2022-06-12T09:28:07.644+08:00"],"address":"3358 Lang Common","update_time":"2022-03-08T17:12:28.607+08:00","description":"Ergonomic executive chair upholstered in bonded black leather and PVC padded seat and back for all-day comfort and support","account":"94213614","customer":"Faye Hermann","email":"Sven20@hotmail.com","phone":"172828438"}
```

```http
GET /dsl/dev_table/62a455a4d2952c7033643763?keys={"no":1} HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 70
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:00:28 GMT
Server: hertz

{"_id":"62a455a4d2952c7033643763","no":"CY12008750579FE7390A801K60S7"}
```

## 局部更新匹配资源

:::tips
PATCH /dsl/:model
:::

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
- _请求 Query_
  - 必须*filter *`_object_`_，筛选条件_
  - _format _`_object_`_，Query.filter 格式转换_
- _请求 Body_
  - 必须*data *`_object_`_，更新操作_
  - _format _`_object_`_，Body.data 格式转换_

**响应 Response**

:::info
\_返回成功\_200 OK

- _响应 Body _
  - _MatchedCount_`_number_`_，匹配数量_
  - _ModifiedCount _`_number_`_，修改数量_
  - _UpsertedCount _`_number_`_，插入更新数量_
  - _UpsertedID _`_string_`_，插入更新的 ID_
    :::
    > \_返回失败\_400 Bad Request
    >
    > - _响应 Body_
    >   - _message _`_string_`_，错误消息_

```http
PATCH /dsl/dev_departments?filter={"_id":{"$in":["62db95ec33c11192c28c61a6","62db95ec33c11192c28c61a7"]}}&format={"_id.$in":"oids"} HTTP/1.1
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
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 72
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:12:09 GMT
Server: hertz

{"MatchedCount":2,"ModifiedCount":2,"UpsertedCount":0,"UpsertedID":null}
```

```http
PATCH /dsl/dev_departments?filter={"_id":{"$in":["62db95ec33c11192c28c61a6","62db95ec33c11192c28c61a7"]}}&format={"_id.$in":"oids"} HTTP/1.1
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
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 72
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:24:24 GMT
Server: hertz

{"MatchedCount":2,"ModifiedCount":2,"UpsertedCount":0,"UpsertedID":null}
```

## 局部更新指定 ID 的资源

:::tips
PATCH /dsl/:model/:id
:::

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
  - 必须*id *`_string_`_，资源 ID，必须为 hex(ObjectId)_
- _请求 Body_
  - 必须*data *`_object_`_，更新操作_
  - _format _`_object_`_，Body.data 格式转换_

**响应 Response**

:::info
\_返回成功\_200 OK

- _响应 Body _
  - _MatchedCount_`_number_`_，匹配数量_
  - _ModifiedCount _`_number_`_，修改数量_
  - _UpsertedCount _`_number_`_，插入更新数量_
  - _UpsertedID _`_string_`_，插入更新的 ID_
    :::
    > \_返回失败\_400 Bad Request
    >
    > - _响应 Body_
    >   - _message _`_string_`_，错误消息_

```http
PATCH /dsl/dev_users/62db93de33c11192c28c61a3 HTTP/1.1
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
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 72
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:33:42 GMT
Server: hertz

{"MatchedCount":1,"ModifiedCount":1,"UpsertedCount":0,"UpsertedID":null}
```

## 替换指定 ID 的资源

:::tips
PUT /dsl/:model/:id
:::

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
  - 必须*id *`_string_`_，资源 ID，必须为 hex(ObjectId)_
- _请求 Body_
  - 必须*data *`_object_`_，资源数据_
  - _format _`_object_`_，Body.data 格式转换_

**响应 Response**

:::info
\_返回成功\_200 OK

- _响应 Body _
  - _MatchedCount_`_number_`_，匹配数量_
  - _ModifiedCount _`_number_`_，修改数量_
  - _UpsertedCount _`_number_`_，插入更新数量_
  - _UpsertedID _`_string_`_，插入更新的 ID_
    :::
    > \_返回失败\_400 Bad Request
    >
    > - _响应 Body_
    >   - _message _`_string_`_，错误消息_

```http
PUT /dsl/dev_users/62db93de33c11192c28c61a3 HTTP/1.1
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
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 72
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:46:45 GMT
Server: hertz

{"MatchedCount":1,"ModifiedCount":1,"UpsertedCount":0,"UpsertedID":null}
```

## 删除指定 ID 的资源

:::tips
DELETE /dsl/:model/:id
:::

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
  - 必须*id *`_string_`_，资源 ID，必须为 hex(ObjectId)_

**响应 Response**

:::info
\_返回成功\_200 OK

- _响应 Body _
  - _DeletedCount，删除数量_
    :::
    > \_返回失败\_400 Bad Request
    >
    > - _响应 Body_
    >   - _message _`_string_`_，错误消息_

```http
DELETE /dsl/dev_users/62db93de33c11192c28c61a3 HTTP/1.1
Host: xapi.kainonly.com:8443
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 18
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:49:29 GMT
Server: hertz

{"DeletedCount":1}
```

## 批量删除匹配资源

:::tips
POST /dsl/:model/bulk-delete
:::

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
- _请求 Body_
  - 必须*data *`_object_`_，筛选条件_
  - _format _`_object_`_，Body.data 格式转换_

**响应 Response**

:::info
\_返回成功\_200 OK

- _响应 Body _
  - _DeletedCount，删除数量_
    :::
    > \_返回失败\_400 Bad Request
    >
    > - _响应 Body_
    >   - _message _`_string_`_，错误消息_

```http
POST /dsl/dev_departments/bulk-delete HTTP/1.1
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
```

```http
HTTP/1.1 200 OK
Alt-Svc: h3=":8443"; ma=2592000,h3-29=":8443"; ma=2592000
Content-Length: 18
Content-Type: application/json; charset=utf-8
Date: Sat, 23 Jul 2022 08:54:02 GMT
Server: hertz

{"DeletedCount":4}
```

## 排序资源

:::tips
POST /dsl/:model/sort
:::

**请求 Request**

- _请求 Path_
  - 必须*model *`_string_`_，模型名称，必须是小写字母与下划线_
- _请求 Body_
  - 必须*data *`_string[]_`_，资源 ID 数组，更新顺序即数组索引_

**响应 Response**

:::info
\_返回成功\_204 No Content
:::

> \_返回失败\_400 Bad Request
>
> - _响应 Body_
>   - _message _`_string_`_，错误消息_

```http
POST /dsl/dev_departments/sort HTTP/1.1
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
