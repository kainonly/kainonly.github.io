---
title: SSH 免密码登录
date: 2016-06-14
tags:
  - Linux
categories:
  - 运维
---

使用 ssh-keygen 生成密钥对

```shell
ssh-keygen -t rsa
```

生成之后会在用户的根目录生成一个 <u>/[home/user|root]/.ssh</u> 的文件夹

- **id_rsa** 生成的私钥文件
- **id_rsa.pub** 生成的公钥文件

将公钥公钥重命名为 `authorized_keys`, 设置权限

```shell
chmod 700 -R .ssh
chmod 600 .ssh/authorized_keys
```
