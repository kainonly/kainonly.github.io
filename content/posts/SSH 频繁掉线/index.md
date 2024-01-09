---
title: SSH 频繁掉线
date: 2016-06-14
tags:
  - Linux
categories:
  - 运维
---

找到文件 <u>/etc/ssh/sshd_config</u> 进行修改

```
ClientAliveInterval 15
ClientAliveCountMax 45
```

然后重启 `sshd` 服务，重新打开客户端就不会频繁掉线了

```shell
systemctl restart sshd
```

```
ClientAliveInterval 是每隔多少秒，服务器端向客户端发送心跳，ClientAliveCountMax 是多少次心跳无响应之后，断开 Client 连接
```
