---
title: 使用 backport 更新 Debian
date: 2021-03-14
tags:
  - Linux
categories:
  - 运维
---

Backport 的含义是”向后移植”，就是将软件新版本的某些功能移植到旧版本上来，这就称为 backport。

Debian 向来以稳定性著称，所以就存在一个问题，官方源分发的软件版本比软件本身的版本总是要慢不少，所以就有了 backports 源。 backports 主要从 testing 源，部分安全更新从 unstable 源重新编译包，使这些包不依赖于新版本的库就可以在 debian 的 stable 发行版上面运行。所以 backports 是 stable 和 testing 的一个折衷。

## 设置 Backport 源

修改文件 <u>/etc/apt/sources.list</u>，向其加入源（这里以 buster 为例）

```conf
deb https://mirrors.cloud.tencent.com/debian buster-backports main contrib non-free
```

更新源

```shell
apt update
```

## 升级 Linux Kernel

首先来到 Debian Backports 网站查询当前版本是否已经提供 Backports 支持，访问 [Debian Package List](https://packages.debian.org/en/buster-backports) 选择 buster-backports 查看可用的软件包列表，页面找到 Kernels 分类并进入对应的页面，并使用浏览器搜索 linux-image 来查看可用的内核版本。

如何找到适合自己的设备呢？

- 64 位普通设备，如你的笔记本或工作站: linux-image-amd64
- 64 位基于虚拟化的设备，如 AWS、Azure、普通 VPS: linux-image-cloud-amd64
- 树莓派: linux-image-rpi

找到适合自己设备的包名并且确定版本是自己需要的版本后，然后执行以下命令进行安装：

```shell
sudo apt install -t buster-backports linux-image-amd64 linux-headers-amd64
```

安装成功后重启即默认使用最新版本内核，可以使用 `uname -r` 确认新的内核版本
