---
title: Kubernetes 异地组网
date: 2022-04-12
tags:
  - Kubernetes
categories:
  - 运维
---

正常情况下节点会在同一专有网络内，而当使用公网建立的 k8s 集群中跨主机 pod 可能无法互通，此时需要检查几个方面进行调整：

1. 使用 Flannel VXLAN 需要确保每个节点之间 `8472/udp` 可以互通
2. 设置 `--node-ip <ip>` 值对应该节点的**异地组网 IP** 和 **VPC 内网 IP**
3. 设置 `--node-external-ip <ip>` 值对应节点**公网 IP**
4. Debian11 默认使用 nftables 而不是 iptables ，**K3S** 网络功能需要使用 iptables，而不能使用 nftables

```shell
sudo iptables -F
sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
sudo reboot
```

5. 为节点增加注解 `flannel.alpha.coreos.com/public-ip-overwrite: <ip>` 值对应该节点的异地组网 IP，如果节点都具备公网 IP 设置公网 IP
6. 确保 `coredns` 能被每个节点正常访问
