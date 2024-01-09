---
title: Redis 故障
date: 2016-10-20
tags:
  - Redis
categories:
  - 数据库
---

错误信息

```shell
If you get this error Can't save in background: fork: Cannot allocate memory
it means that your current database is bigger than memory you have.
```

解决方式是开启 `vm.overcommit_memory`

```shell
sysctl vm.overcommit_memory=1
```
