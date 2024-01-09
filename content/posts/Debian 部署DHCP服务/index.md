---
title: Debian 部署 DHCP 服务
date: 2020-02-06
tags:
  - Linux
categories:
  - 运维
---

DHCP（动态主机配置协议）是一个局域网的网络协议。指的是由服务器控制一段 IP 地址范围，客户机登录服务器时就可以自动获得服务器分配的 IP 地址和子网掩码。

## 安装

执行下面的命令进行安装

```shell
apt install isc-dhcp-server -y
```

创建自启，并开启服务

```shell
systemctl enable isc-dhcp-server
systemctl start isc-dhcp-server
```

## 配置

查看配置文件

```shell
cat /etc/default/isc-dhcp-server
```

- **INTERFACESv4** 需要监听的 IPV4 设备
- **INTERFACESv6** 需要监听的 IPV6 设备

假设网卡为 `tap_vpn`，则将其修改为

```shell
# Defaults for isc-dhcp-server (sourced by /etc/init.d/isc-dhcp-server)

# Path to dhcpd's config file (default: /etc/dhcp/dhcpd.conf).
#DHCPDv4_CONF=/etc/dhcp/dhcpd.conf
#DHCPDv6_CONF=/etc/dhcp/dhcpd6.conf

# Path to dhcpd's PID file (default: /var/run/dhcpd.pid).
#DHCPDv4_PID=/var/run/dhcpd.pid
#DHCPDv6_PID=/var/run/dhcpd6.pid

# Additional options to start dhcpd with.
#	Don't use options -cf or -pf here; use DHCPD_CONF/ DHCPD_PID instead
#OPTIONS=""

# On what interfaces should the DHCP server (dhcpd) serve DHCP requests?
#	Separate multiple interfaces with spaces, e.g. "eth0 eth1".
INTERFACESv4="tap_vpn"
INTERFACESv6=""
```

然后进一步配置 DHCP 配置，修改 `/etc/dhcp/dhcpd.conf`

```shell
# 假设网络为 10.3.0.0/16
# DHCP自动分配 10.3.1.100 ~ 10.3.1.254

subnet 10.3.0.0 netmask 255.255.0.0 {
  range 10.3.1.100 10.3.1.254;
  option subnet-mask 255.255.0.0;
  default-lease-time 3600;
  max-lease-time 7200;
}
```

重启服务

```shell
systemctl restart isc-dhcp-server
```
