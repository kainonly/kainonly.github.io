---
title: Linux IP 管理
date: 2016-06-16
tags:
  - Linux
categories:
  - 运维
---

删除 IP

```shell
ip addr del 192.168.56.101/24 dev bond0 label bond0:1
ip addr del 192.168.56.100/24 dev bond0
```

新增 IP

```shell
ip addr add 192.168.56.100/24 brd 192.168.56.255 dev bond0
ip addr add 192.168.56.101/24 brd 192.168.56.255 dev bond0 label bond0:1
```
