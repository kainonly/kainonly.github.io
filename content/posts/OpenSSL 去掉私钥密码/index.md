---
title: OpenSSL 去掉私钥密码
date: 2016-06-14
tags:
  - Linux
categories:
  - 运维
---

执行

```shell
openssl rsa -in ~/.ssh/id_rsa -out ~/.ssh/id_rsa_new
```

备份旧私钥

```shell
mv ~/.ssh/id_rsa ~/.ssh/id_rsa.backup
```

使用新私钥

```shell
mv ~/.ssh/id_rsa_new ~/.ssh/id_rsa
```

设置权限

```shell
chmod 600 ~/.ssh/id_rsa
```
