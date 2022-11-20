---
title: Netplan 配置示例
date: 2020-04-15
tags:
  - Linux
categories:
  - 运维
---

以下是常见方案的示例 Netplan 配置的集合。

如果您看不到某个场景或有一个场景可以做出贡献，可反馈至 [Netplan configuration examples](https://netplan.io/examples/) - [Report a bug with this site](https://github.com/canonical-web-and-design/netplan.io/issues/new)

## 配置

配置 netplan ,可以到 <u>/etc/netplan</u> 目录下找到扩展名 `.yaml` 配置文件（例如：<u>/etc/netplan/config.yaml</u> ）进行修改，然后执行 `sudo netplan apply` 解析配置并运用至应用系统中。在 <u>/etc/netplan/</u> 下写入磁盘的配置将在两次重启之间保持不变。

## 使用 DHCP 和 静态地址

假设名为 `enp3s0` 的接口通过 DHCP 获得地址，可创建具有以下内容的 YAML 文件：

```yml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp3s0:
      dhcp4: true
```

如果设置静态 IP 地址，请使用地址键，该键获取（IPv4 或 IPv6），地址以及子网前缀长度（例如 /24）的列表。 也可以提供网关和 DNS 信息：

```yml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp3s0:
      addresses:
        - 10.10.10.2/24
      gateway4: 10.10.10.1
      nameservers:
        search: [mydomain, otherdomain]
        addresses: [10.10.10.1, 1.1.1.1]
```

## 连接多个接口使用 DHCP

现在，许多系统都包含多个网络接口。 服务器通常将需要连接到多个网络，并且可能要求到 Internet 的流量通过特定的接口，尽管它们都提供了有效的网关。

通过为通过 DHCP 检索的路由指定度量标准，可以实现 DHCP 所需的精确路由，这将确保某些路由优先于其他路由。 在此示例中， `enred` 优先于 `engreen` ，因为它具有较低的路由指标：

```yml
network:
  version: 2
  ethernets:
    enred:
      dhcp4: yes
      dhcp4-overrides:
        route-metric: 100
    engreen:
      dhcp4: yes
      dhcp4-overrides:
        route-metric: 200
```

## 连接至开发无线网络

Netplan 轻松支持连接到开放的无线网络（该网络不受密码保护），只需要定义访问点即可：

```yml
network:
  version: 2
  wifis:
    wl0:
      access-points:
        opennetwork: {}
      dhcp4: yes
```

## 连接至 WPA 个人无线网络

无线设备使用 `wifi` 键，并与有线以太网设备共享相同的配置选项。 还应指定无线接入点的名称和密码：

```yml
network:
  version: 2
  renderer: networkd
  wifis:
    wlp2s0b1:
      dhcp4: no
      dhcp6: no
      addresses: [192.168.0.21/24]
      gateway4: 192.168.0.1
      nameservers:
        addresses: [192.168.0.1, 8.8.8.8]
      access-points:
        "network_ssid_name":
          password: "**********"
```

## 连接到 WPA 企业无线网络

找到使用 WPA 或 WPA2 Enterprise 保护的无线网络也是很常见的，这需要附加的身份验证参数。

例如，如果使用 WPA-EAP 和 TTLS 保护网络安全：

```yml
network:
  version: 2
  wifis:
    wl0:
      access-points:
        workplace:
          auth:
            key-management: eap
            method: ttls
            anonymous-identity: "@internal.example.com"
            identity: "joe@internal.example.com"
            password: "v3ryS3kr1t"
      dhcp4: yes
```

或者，如果使用 WPA-EAP 和 TLS 保护网络安全：

```yml
network:
  version: 2
  wifis:
    wl0:
      access-points:
        university:
          auth:
            key-management: eap
            method: tls
            anonymous-identity: "@cust.example.com"
            identity: "cert-joe@cust.example.com"
            ca-certificate: /etc/ssl/cust-cacrt.pem
            client-certificate: /etc/ssl/cust-crt.pem
            client-key: /etc/ssl/cust-key.pem
            client-key-password: "d3cryptPr1v4t3K3y"
      dhcp4: yes
```

支持许多不同的加密模式。 [请参阅 Netplan 参考页](https://netplan.io/reference)。

## 在单个接口上使用多个地址

地址键可以获取要分配给接口的地址列表：

```yml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp3s0:
      addresses:
        - 10.100.1.38/24
        - 10.100.1.39/24
      gateway4: 10.100.1.1
```

不支持接口别名（例如 eth0：0）。

<a name="0677896c"></a>

## 通过多个网关使用多个地址

与上面的示例类似，具有多个地址的接口可以是配置有多个网关。

```yml
network:
    version: 2
    renderer: networkd
    ethernets:
        enp3s0:
         addresses:
             - 9.0.0.9/24
             - 10.0.0.10/24
             - 11.0.0.11/24
         #gateway4:  # unset, since we configure routes below
         routes:
             - to: 0.0.0.0/0
                 via: 9.0.0.1
                 metric: 100
             - to: 0.0.0.0/0
                 via: 10.0.0.1
                 metric: 100
             - to: 0.0.0.0/0
                 via: 11.0.0.1
                 metric: 100
```

鉴于有多个地址，每个地址都有自己的网关，我们在此不指定 gateway4，而是使用子网的网关地址将各个路由配置为 0.0.0.0/0（任何地方）。 应该调整指标值，以便按预期进行路由。

DHCP 可用于接收接口的 IP 地址之一。 在这种情况下，该地址的默认路由将自动配置为度量值 100。作为路由下条目的简写形式，可以将 gateway4 设置为其中一个子网的网关地址。 在这种情况下，可以从路由中省略该子网的路由。 其指标将设置为 100。

## 使用网络管理器作为渲染器

Netplan 同时支持网络和网络管理器作为后端。 您可以使用渲染器键指定应使用哪个网络后端来配置特定设备。 您还可以通过仅指定渲染器密钥将网络的所有配置委派给网络管理器本身：

```yml
network:
  version: 2
  renderer: NetworkManager
```

## 配置接口绑定

通过使用物理接口列表和绑定模式声明绑定接口来配置绑定。 以下是使用 DHCP 获取地址的主动备份绑定的示例：

```yml
network:
  version: 2
  renderer: networkd
  bonds:
    bond0:
      dhcp4: yes
      interfaces:
        - enp3s0
        - enp4s0
      parameters:
        mode: active-backup
        primary: enp3s0
```

下面是一个充当具有各种绑定接口和不同类型的路由器的系统的示例。 请注意 `optional: true` 键声明，该声明允许进行引导而无需等待这些接口完全激活。

```yml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp1s0:
      dhcp4: no
    enp2s0:
      dhcp4: no
    enp3s0:
      dhcp4: no
      optional: true
    enp4s0:
      dhcp4: no
      optional: true
    enp5s0:
      dhcp4: no
      optional: true
    enp6s0:
      dhcp4: no
      optional: true
  bonds:
    bond-lan:
      interfaces: [enp2s0, enp3s0]
      addresses: [192.168.93.2/24]
      parameters:
        mode: 802.3ad
        mii-monitor-interval: 1
    bond-wan:
      interfaces: [enp1s0, enp4s0]
      addresses: [192.168.1.252/24]
      gateway4: 192.168.1.1
      nameservers:
        search: [local]
        addresses: [8.8.8.8, 8.8.4.4]
      parameters:
        mode: active-backup
        mii-monitor-interval: 1
        gratuitious-arp: 5
    bond-conntrack:
      interfaces: [enp5s0, enp6s0]
      addresses: [192.168.254.2/24]
      parameters:
        mode: balance-rr
        mii-monitor-interval: 1
```

## 配置网桥

要创建一个由使用 DHCP 的单个设备组成的非常简单的网桥，请输入：

```yml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp3s0:
      dhcp4: no
  bridges:
    br0:
      dhcp4: yes
      interfaces:
        - enp3s0
```

一个更复杂的示例，要使 libvirtd 使用带有标记 vlan 的特定网桥，同时继续提供未标记的接口，将涉及：

```yml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s25:
      dhcp4: true
  bridges:
    br0:
      addresses: [10.3.99.25/24]
      interfaces: [vlan15]
  vlans:
    vlan15:
      accept-ra: no
      id: 15
      link: enp0s25
```

然后，通过将以下内容添加到 <u>/etc/libvirtd/emu/networks/</u> 下的新 XML 文件中，将 libvirtd 配置为使用此桥。 `<bridge>` 标记以及 `<name>` 中的网桥名称需要与使用 netplan 配置的网桥设备的名称匹配：

```xml
<network>
    <name>br0</name>
    <bridge name='br0'/>
    <forward mode="bridge"/>
</network>
```

## 将 VLAN 附加到网络接口

要使用重命名的接口配置多个 VLAN，请执行以下操作：

```yml
network:
  version: 2
  renderer: networkd
  ethernets:
    mainif:
      match:
        macaddress: "de:ad:be:ef:ca:fe"
      set-name: mainif
      addresses: ["10.3.0.5/23"]
      gateway4: 10.3.0.1
      nameservers:
        addresses: ["8.8.8.8", "8.8.4.4"]
        search: [example.com]
  vlans:
    vlan15:
      id: 15
      link: mainif
      addresses: ["10.3.99.5/24"]
    vlan10:
      id: 10
      link: mainif
      addresses: ["10.3.98.5/24"]
      nameservers:
        addresses: ["127.0.0.1"]
        search: [domain1.example.com, domain2.example.com]
```

## 到达直接连接的网关

这允许使用 `on-link` 关键字设置默认路由或任何路由，其中网关是直接连接到网络的 IP 地址，即使该地址与接口上配置的子网不匹配也是如此。

```yml
network:
    version: 2
    renderer: networkd
    ethernets:
        addresses: [ "10.10.10.1/24" ]
        routes:
            - to: 0.0.0.0/0
                via: 9.9.9.9
                on-link: true
```

对于 IPv6，配置将非常相似，但显着的不同是附加的范围：将主机路由链接到所需的路由器地址：

```yml
network:
    version: 2
    renderer: networkd
    ethernets:
        addresses: [ "2001:cafe:face:beef::dead:dead/64" ]
        routes:
            - to: "2001:cafe:face::1/128"
                scope: link
            - to: "::/0"
                via: "2001:cafe:face::1"
                on-link: true
```

## 配置源路由

可以将路由表添加到特定接口，以允许在两个网络之间进行路由：

在下面的示例中，ens3 在 192.168.3.0/24 网络上，ens5 在 192.168.5.0/24 网络上。 这使任一网络上的客户端都可以连接到另一网络，并使响应来自正确的接口。

此外，默认路由仍分配给 ens5，允许任何其他流量通过。

```yml
network:
    version: 2
    renderer: networkd
    ethernets:
        ens3:
            addresses:
             - 192.168.3.30/24
            dhcp4: no
            routes:
             - to: 192.168.3.0/24
                 via: 192.168.3.1
                 table: 101
            routing-policy:
             - from: 192.168.3.0/24
                 table: 101
        ens5:
            addresses:
             - 192.168.5.24/24
            dhcp4: no
            gateway4: 192.168.5.1
            routes:
             - to: 192.168.5.0/24
                 via: 192.168.5.1
                 table: 102
            routing-policy:
            - from: 192.168.5.0/24
                table: 102
```

## 配置回送接口

Networkd 不允许创建新的回送设备，但是用户可以将新地址添加到标准回送接口 lo 中，以使其在计算机上以及自定义路由中被视为有效地址：

```yml
network:
  version: 2
  renderer: networkd
  ethernets:
    lo:
      match:
        name: lo
      addresses: [7.7.7.7/32]
```

## 与 Windows DHCP 服务器集成

对于 Windows Server 使用 dhcp-identifier 键提供 DHCP 的网络，可以实现互操作性：

```yml
network:
  version: 2
  ethernets:
    enp3s0:
      dhcp4: yes
      dhcp-identifier: mac
```

## 连接 IP 隧道

隧道允许管理员配置两个连接特殊隧道接口并执行所需路由的端点，从而在 Internet 上扩展网络。 Netplan 支持 SIT，GRE，IP-in-IP（ipip，ipip6，ip6ip6），IP6GRE，VTI 和 VTI6 隧道。

隧道的常见用法是在仅支持 IPv4 的网络上启用 IPv6 连接。 下面的示例显示了如何配置这样的隧道。

这里的 1.1.1.1 是客户自己的 IP 地址； 2.2.2.2 是远程服务器的 IPv4 地址，`2001:dead:beef::2/64` 是隧道定义的客户端的 IPv6 地址，`2001:dead:beef::1` 是远程服务器的 IPv6 地址 。

最后，`2001:cafe:face::1/64` 是路由的 IPv6 前缀内的客户端地址：

```yml
network:
  version: 2
  ethernets:
    eth0:
      addresses:
        - 1.1.1.1/24
        - "2001:cafe:face::1/64"
      gateway4: 1.1.1.254
  tunnels:
    he-ipv6:
      mode: sit
      remote: 2.2.2.2
      local: 1.1.1.1
      addresses:
        - "2001:dead:beef::2/64"
      gateway6: "2001:dead:beef::1"
```

## 配置 SR-IOV 虚拟功能

对于 SR-IOV 网卡，可以为每个已配置的物理功能动态分配虚拟功能接口。 在 netplan 中，通过具有指向父 PF 的 link：属性来定义 VF。

```yml
network:
  version: 2
  ethernets:
    eno1:
      mtu: 9000
    enp1s16f1:
      link: eno1
      addresses: ["10.15.98.25/24"]
    vf1:
      match:
        name: enp1s16f[2-3]
      link: eno1
      addresses: ["10.15.99.25/24"]
```
