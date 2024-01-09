---
title: Docker Engine API 初始
date: 2020-05-07
tags:
  - Docker
categories:
  - 运维
---

Engine API 是 Docker Engine 提供的 HTTP API。它是 Docker 客户端用于与引擎通信的 API，因此 Docker 客户端可以做的所有事情都可以通过 API 来完成。

默认 Docker Engine API 只能通过 socket 访问，如果想通过端口访问则需要手动修改服务。
找到 <u>docker.service</u> 文件，通常在 <u>/lib/systemd/system/docker.service</u>，配置默认为

```ini
[Unit]
Description=Docker Application Container Engine
Documentation=https://docs.docker.com
After=network-online.target firewalld.service containerd.service
Wants=network-online.target
Requires=docker.socket containerd.service

[Service]
Type=notify
# the default is not to use systemd for cgroups because the delegate issues still
# exists and systemd currently does not support the cgroup feature set required
# for containers run by docker
ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
ExecReload=/bin/kill -s HUP $MAINPID
TimeoutSec=0
RestartSec=2
Restart=always

# Note that StartLimit* options were moved from "Service" to "Unit" in systemd 229.
# Both the old, and new location are accepted by systemd 229 and up, so using the old location
# to make them work for either version of systemd.
StartLimitBurst=3

# Note that StartLimitInterval was renamed to StartLimitIntervalSec in systemd 230.
# Both the old, and new name are accepted by systemd 230 and up, so using the old name to make
# this option work for either version of systemd.
StartLimitInterval=60s

# Having non-zero Limit*s causes performance problems due to accounting overhead
# in the kernel. We recommend using cgroups to do container-local accounting.
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity

# Comment TasksMax if your systemd version does not support it.
# Only systemd 226 and above support this option.
TasksMax=infinity

# set delegate yes so that systemd does not reset the cgroups of docker containers
Delegate=yes

# kill only the docker process, not all processes in the cgroup
KillMode=process
OOMScoreAdjust=-500

[Install]
WantedBy=multi-user.target
```

查询 `ExecStart` 项，为其增加参数 `-H tcp://0.0.0.0:2375`

```conf
- ExecStart=/usr/bin/dockerd -H fd:// --containerd=/run/containerd/containerd.sock
+ ExecStart=/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:2375 --containerd=/run/containerd/containerd.sock
```

重启服务

```shell
systemctl daemon-reload
systemctl restart docker
```

如果本机想通过公网访问管理，务必要配置上安全组与 TLS 限制，通常情况下限定于私有网络或企业虚拟网络中，以内网方式进行访问管理

Docker Engine API 详情，<https://docs.docker.com/engine/api/latest>
