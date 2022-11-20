---
title: Macos 开启 Docker 端口
date: 2018-06-27
tags:
  - Macos
categories:
  - 笔记
---

使用 socat 转发为 2375 端口

```shell
socat TCP-LISTEN:2375,reuseaddr,fork UNIX-CONNECT:/var/run/docker.sock
```
