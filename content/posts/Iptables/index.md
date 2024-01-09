---
title: Iptables
date: 2016-06-16
tags:
  - Linux
categories:
  - 运维
---

常用命令列表

- `-A, --append` 新增规则(追加方式)到某个规则链(这里是 INPUT 规则链)中，该规则将会成为规则链中的最后一条规则；
- `-D, --delete` 从某个规则链中删除一条规则，可以输入完整规则，或直接指定规则编号加以删除；
- `-R, --replace` 取代现行规则，规则被取代后并不会改变顺序；
- `-I, --insert` 插入一条规则，原本该位置(这里是位置 1)上的规则将会往后移动一个顺位；
- `-L, --list` 列出某规则链中的所有规则；
- `-F, --flush` 删除某规则链(这里是 INPUT 规则链)中的所有规则；
- `-Z, --zero` 将封包计数器归零。封包计数器是用来计算同一封包出现次数，是过滤阻断式攻击不可或缺的工具；
- `-N, --new-chain` 定义新的规则链
- `-X, --delete-chain` 删除某个规则链
- `-P, --policy` 定义过滤政策。 也就是未符合过滤条件之封包，预设的处理方式
- `-E, --rename-chain` 修改某自订规则链的名称

插入规则，开放端口（例如 80 端）

```shell
iptables -I INPUT -p tcp --dport 80 -j ACCEPT
```

查询规则列表

```shell
iptables -L -n --line-number
```

通过号码删除

```shell
iptables -D INPUT 2
```
