---
title: OpensSSL 编译
date: 2018-09-16
tags:
  - Linux
categories:
  - 运维
---

查看版本

```shell
openssl version
```

下载源码包 https://www.openssl.org ，执行配置

```shell
./config
```

编译

```shell
make && make install
```

建立链接

```shell
sudo ln -s /usr/local/ssl/bin/openssl /usr/bin/openssl
sudo ln -s /usr/local/lib64/libssl.so.1.1 /usr/lib64/libssl.so.1.1
sudo ln -s /usr/local/lib64/libcrypto.so.1.1 /usr/lib64/libcrypto.so.1.1
```

重建缓存

```shell
sudo ldconfig
```
