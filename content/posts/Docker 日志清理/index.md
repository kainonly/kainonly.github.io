---
title: Docker 日志清理
date: 2018-12-27
tags:
  - Docker
categories:
  - 运维
---

我们使用默认 docker 配置来构建服务，有时主机会出现磁盘空间占满，那很可能是 docker 容器的日志所导致的，容器日志一般存放在 <u>/var/lib/docker/containers/container_id/</u> 下面， 以 `json.log` 结尾

查看容器日志大小

```shell
ls -lh $(find /var/lib/docker/containers/ -name *-json.log)
```

清理容器日志

```shell
truncate -s 0 /var/lib/docker/containers/*/*-json.log
```

为了不再出现日志磁盘占满，就需要从源头上限制日志大小，那么可以直接修改 `daemon.json` 全局来配置

```json
{
  + "log-driver": "json-file",
  + "log-opts": { "max-size": "500m", "max-file": "3" }
}
```

重启 docker 服务

```shell
systemctl daemon-reload
systemctl restart docker
```

如果使用 docker-compose 也可以专门为某个容器配置日志

```yml
emqx:
  image: emqx/emqx
  restart: always
  environment:
    EMQX_NAME: emqx
    EMQX_ALLOW_ANONYMOUS: "false"
    EMQX_LISTENER__TCP__EXTERNAL: 1883
    EMQX_LISTENER__WS__EXTERNAL: 8083
  logging:
    driver: json-file
    options:
      max-size: 1g
  ports:
    - 1883:1883
    - 8081:8081
```
