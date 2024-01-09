---
title: 解决 Electron 安装慢
date: 2017-09-08
tags:
  - NodeJs
categories:
  - 前端
---

使用 npm 安装 electron 中，即使 npm 已经替换了 `taobao` 源镜像依然很慢，因为安装中脚本会下载境外的特定版本的 `electron` 的 `prebuild` 版本

## Window

使用 Window 平台，可以设置系统变量，将 `ELECTRON_MIRROR` 设定为 `http://npm.taobao.org/mirrors/electron` ，然后重新开启终端执行安装，此时脚本就会通过国内源进行下载

## Linux

使用 Linux 平台，同样可以修改系统变量，可直接修改文件 <u>/etc/profile</u>，向下添加

```conf
export ELECTRON_MIRROR=http://npm.taobao.org/mirrors/electron
```

执行 source 生效环境变量

```shell
source /etc/profile
```

## MacOS

使用 MacOS 平台，找到用户下 `~/.bash_profile` 文件，向下添加

```conf
export ELECTRON_MIRROR="http://npm.taobao.org/mirrors/electron"
```

执行 source 生效环境变量

```shell
source ~/.bash_profile
```
