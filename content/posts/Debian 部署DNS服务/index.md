---
title: Debian 部署 DNS 服务
date: 2020-02-06
tags:
  - Linux
categories:
  - 运维
---

BIND (Berkeley Internet Name Domain) 是一个开源的 DNS 服务器软件，因其稳定性和高品质而广泛用于 Unix/Linux。

它最初由加州大学伯克利分校开发，后来在 1994 年将其开发转移到 Internet Systems Consortium, Inc (ISC)。

## 安装

运行以下命令从默认存储库在 Debian 10 Buster 上安装 BIND 9。 BIND 9 是当前版本，BIND 10 是一个死项目。

```shell
apt update
apt install bind9 bind9utils bind9-doc bind9-host dnsutils
```

产看版本信息

```shell
named -v

// BIND 9.10.3-P4-Debian <id:ebd72b3>
```

创建自启，并开启服务

```shell
systemctl enable bind9
systemctl start bind9
```

BIND 服务器将作为安装期间创建的绑定用户运行，并侦听 TCP 和 UDP 端口 53，如运行以下命令所示：

```shell
tcp        0      0 10.1.0.1:53             0.0.0.0:*               LISTEN      594/named
tcp        0      0 127.0.0.1:953           0.0.0.0:*               LISTEN      594/named
tcp6       0      0 :::53                   :::*                    LISTEN      594/named
udp        0      0 10.1.0.1:53             0.0.0.0:*                           594/named
udp6       0      0 :::53                   :::*                                594/named
```

通常 DNS 查询发送到 UDP 端口 53。TCP 端口 53 用于响应大小大于 512 字节。

BIND 守护进程被称为 named。 （守护进程是一个在后台运行的软件。）命名二进制文件由 bind9 包安装，还有另一个重要的二进制文件：rndc，远程名称守护进程控制器，由 bind9utils 包安装。

rndc 二进制文件用于重新加载/停止和控制 BIND 守护程序的其他方面。 通信通过 TCP 端口 953 完成。

例如，我们可以检查 BIND 名称服务器的状态。

```shell
rndc status
```

## 配置

<u>/etc/bind/</u> 是包含 BIND 配置的目录。

- **named.conf：**主配置文件，包括其他三个文件的配置。
- **db.127：**本地主机 IPv4 反向映射区域文件。
- **db.local：**本地主机转发 IPv4 和 IPv6 映射区域文件。
- **db.empty：**空区域文件

主 BIND 配置文件 `/etc/bind/named.conf` 从其他 3 个文件中获取设置。

- <u>/etc/bind/named.conf.options</u>
- <u>/etc/bind/named.conf.local</u>
- <u>/etc/bind/named.conf.default-zones</u>

要启用递归服务，请编辑第一个文件。

```shell
nano /etc/bind/named.conf.options
```

在选项子句中，添加以下几行。 将 `allow-recursion` 语句中的 IP 地址替换为您自己的本地网络地址。

```ini
options {
	directory "/var/cache/bind";

	recursion yes;
	listen-on port 53 { 10.1.0.1; };
	allow-recursion { 10.1.3.0/24; };

	// If there is a firewall between you and nameservers you want
	// to talk to, you may need to fix the firewall to allow multiple
	// ports to talk.  See http://www.kb.cert.org/vuls/id/800113

	// If your ISP provided one or more IP addresses for stable
	// nameservers, you probably want to use them as forwarders.
	// Uncomment the following block, and insert the addresses replacing
	// the all-0's placeholder.

	// forwarders {
	//
	// };

	//========================================================================
	// If BIND logs error messages about the root key being expired,
	// you will need to update your keys.  See https://www.isc.org/bind-keys
	//========================================================================
	dnssec-validation auto;
	listen-on-v6 { any; };
};
```

增加解析配置，可以修改 <u>/etc/bind/named.conf.local</u>

```conf
zone "developer.com" {
    type master;
    file "/etc/bind/zones/db.developer.com.local";
};
```

然后修改域名解析 <u>/etc/bind/zones/db.developer.com.local</u>

```conf
$TTL 604800
@       IN      SOA     ns1.developer.com. admin.developer.com. (
        3               ; Serial
        604800          ; Refresh
        86400           ; Retry
        2419200         ; Expire
        604800 )        ; Negative Cache TTL
;
@               IN            NS           ns1.developer.com.
ns1             IN            A            10.1.0.1
ping            IN            A            10.1.3.1
```

最后重启服务

```shell
systemctl restart bind9
```
