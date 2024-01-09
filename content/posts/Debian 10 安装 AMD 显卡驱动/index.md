---
title: Debian 10 安装 AMD 显卡驱动
date: 2020-02-04
tags:
  - Linux
categories:
  - 运维
---

启用 Non-Free 存储库

```conf
deb http://deb.debian.org/debian/ buster main non-free contrib
deb-src http://deb.debian.org/debian/ buster main non-free contrib

deb http://security.debian.org/debian-security buster/updates main contrib non-free
deb-src http://security.debian.org/debian-security buster/updates main contrib non-free
```

更新源

```shell
apt update
```

安装 AMD 驱动程序

```shell
apt install firmware-linux firmware-linux-nonfree libdrm-amdgpu1 xserver-xorg-video-amdgpu
```

安装 Vulkan

```shell
apt install mesa-vulkan-drivers libvulkan1 vulkan-tools vulkan-utils vulkan-validationlayers
```

安装 OpenCL

```shell
apt install mesa-opencl-icd
```
