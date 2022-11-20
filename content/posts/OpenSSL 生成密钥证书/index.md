---
title: OpenSSL 生成密钥证书
date: 2016-06-14
tags:
  - Linux
categories:
  - 运维
---

OpenSSL 是为网络通信提供安全及数据完整性的一种安全协议，囊括了主要的密码算法、常用的密钥和证书封装管理功能以及 SSL 协议，并提供了丰富的应用程序供测试或其它目的使用

## RSA 密钥

生成私钥

```shell
openssl genrsa -out rsa_private_key.pem 1024
```

把 RSA 私钥转换成 PKCS8 格式

```shell
openssl pkcs8 -topk8 -inform PEM -in rsa_private_key.pem -outform PEM –nocrypt
```

生成公钥

```shell
openssl rsa -in rsa_private_key.pem -pubout -out rsa_public_key.pem
```

## ECC 密钥

生成私密

```shell
openssl ecparam -genkey -name prime256v1 -out domain.key
```

生成指定证书

```shell
openssl req -new -sha256 -key domain.key -out domain_csr.txt
```

> 注意事项： ECC 算法加密强度有 3 个选项：prime256v1/secp384r1/secp521r1/prime256v1 目前已经足够安全，如无特殊需要请保持 ECC 算法 prime256v1 默认即可。 SHA256 目前已经足够安全，如无特殊需要请保持默认。

生成公钥

```shell
openssl ec -in domain.key -pubout -out pubkey.pem
```

## 私有证书

生成私钥

```shell
openssl genrsa > cert.key
```

生成 CA 证书

```shell
openssl req -new -x509 -key cert.key > cert.pem
```
