---
title: FTP 配置之 Vsftpd
date: 2017-03-22
tags:
  - Linux
categories:
  - 运维
---

在 **CentOS** 下通过 `yum` 安装

```shell
yum -y install vsftpd
```

配置 <u>/etc/vsftpd/vsftpd.conf</u> ,将匿名用户登录关闭

```
anonymous_enable=NO
```

对 ftp 外用户做出限制

```
chroot_local_user=YES
```

如果用户被限定在了其主目录下，则该用户的主目录不能再具有写权限了

```
allow_writeable_chroot=YES
```

创建 FTP 用户

```shell
useradd -s /sbin/nologin -d /home/website kain
```

给 kain 添加密码

```shell
passwd kain
```

让防火墙允许 21 端口

```shell
/sbin/iptables -I INPUT -p tcp --dport 21 -j ACCEPT
```

重启 vsftpd

```shell
systemctl restart vsftpd
```
