---
title: Apt 常见错误
date: 2018-05-03
tags:
  - Linux
categories:
  - 运维
---

```shell
Sub-process /usr/bin/dpkg returned an error code (1)
```

当发生这种情况时可重建 Apt 软件包配置文件列表
现将 info 目录更名为 `info_old` 保留

```shell
sudo mv /var/lib/dpkg/info /var/lib/dpkg/info_old
```

再新建一个新的 info 目录

```shell
sudo mkdir /var/lib/dpkg/info
```

更新源

```shell
sudo apt-get update
```

将新的配置文件列表覆盖至原来的

```shell
sudo mv /var/lib/dpkg/info/* /var/lib/dpkg/info_old
```

删除新创建的 info 目录

```shell
sudo rm -rf /var/lib/dpkg/info
```

将原来的 `info_old` 目录恢复原名 `info`

```shell
sudo mv /var/lib/dpkg/info_old /var/lib/dpkg/info
```
