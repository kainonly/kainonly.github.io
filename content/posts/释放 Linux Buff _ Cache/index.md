---
title: 释放 Linux Buff / Cache
date: 2016-12-06
tags:
  - Linux
categories:
  - 运维
---

首先要确认，<u>/proc/sys/vm/drop_caches</u> 的值为 0，手动执行 sync 命令

```shell
sync
```

执行释放

```shell
echo 3 > /proc/sys/vm/drop_caches
```
