---
title: Alpine 国内源
date: 2018-08-20
tags:
  - Linux
categories:
  - 运维
---

阿里云镜像

```shell
sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
```

华为镜像

```shell
sed -i "s@http://dl-cdn.alpinelinux.org/@https://mirrors.huaweicloud.com/@g" /etc/apk/repositories
```

科大镜像

```shell
sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
```
