---
title: 快速组建 Nats 集群
date: 2021-06-15
tags:
  - Nats
categories:
  - 运维
---

NATS 是个开源、轻量级、高性能的云原生消息系统，实现了具有高度伸缩性的、优雅的发布-订阅（pub/sub）分布式模型。天生具备的高性能，使其成为构建现代、可靠、易伸缩的云原生分布式系统的理想基础。
模拟 3 节点集群，创建 <u>docker-compose.yml</u>

```yml
version: "3"
services:
  nats1:
    image: nats:alpine
    restart: always
    command: "-c /etc/node.conf"
    volumes:
      - ./etc/node-1.conf:/etc/node.conf
    ports:
      - 4222:4222
  nats2:
    image: nats:alpine
    restart: always
    command: "-c /etc/node.conf"
    volumes:
      - ./etc/node-2.conf:/etc/node.conf
    ports:
      - 4223:4222
  nats3:
    image: nats:alpine
    restart: always
    command: "-c /etc/node.conf"
    volumes:
      - ./etc/node-3.conf:/etc/node.conf
    ports:
      - 4224:4222
```

其中节点配置分别为

```ini
# node-1.conf
port: 4222

cluster {
  listen: "0.0.0.0:6222"

  routes = [
    nats://nats2:6222
    nats://nats3:6222
  ]
}

# node-2.conf
port: 4222

cluster {
  listen: "0.0.0.0:6222"

  routes = [
    nats://nats1:6222
    nats://nats3:6222
  ]
}

# node-3.conf
port: 4222

cluster {
  listen: "0.0.0.0:6222"

  routes = [
    nats://nats1:6222
    nats://nats2:6222
  ]
}
```

编排服务

```shell
docker-compose up
```

最后使用 `nats-bench` 测试

```shell
nats-bench -s nats://localhost:4222,nats://localhost:4223,nats://localhost:4224 -np 1 -ns 1 -n 100000 -ms 16 foo
```
