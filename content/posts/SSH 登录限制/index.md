---
title: SSH 登录限制
date: 2016-06-14
tags:
  - Linux
categories:
  - 运维
---

只允许指定用户进行登录，修改 <u>/etc/ssh/sshd_config</u>，例如：允许 aliyun 和从 192.168.1.1 登录的 test 帐户通过 SSH 登录系统

```conf
AllowUsers aliyun test@192.168.1.1
```

只拒绝指定用户进行登录，修改 <u>/etc/ssh/sshd_config</u>，例如：拒绝 zhangsan、aliyun 帐户通过 SSH 登录系统

```conf
DenyUsers zhangsan aliyun
```

固定的 IP 进行禁止登录，修改 <u>/etc/hosts.allow</u>

```conf
# 允许 192.168.0.1 这个 IP 地址 ssh 登录
sshd:192.168.0.1:allow
# 允许 192.168.0.1/24 这段 IP 地址的用户登录
sshd:192.168.0.1/24:allow
```
