---
title: WebDav 快速使用
date: 2021-09-25
tags:
  - Linux
categories:
  - 运维
---

WebDAV ，全称是 Web-based Distributed Authoring and Versioning，维基百科上对它的解释是这样的：基于 Web
的分布式编写和版本控制（WebDAV）是超文本传输协议（HTTP）的扩展，有利于用户间协同编辑和管理存储在万维网服务器文档。

## 使用原因

类似技术，我们常见的是文件传输协议(FTP)，他在 RFC 959 中定义，于 1985 年 10
月发布，被设计成为一个跨平台的、简单且易于实现的协议。但时至今日，却已江河日下，因为存在一些历史问题，大致以一下几点：

- 密码安全策略不完善
- 与防火墙工作不协调
- 无法对操作进行细化处理
- 效率不高，速度较慢

与 FTP 相比，WebDAV 具有以下优点：

- 通过一个 TCP 连接，可以更轻松地将其配置为绕过防火墙，NAT 和代理。 在 FTP 中，数据通道可能会导致正确的 NAT 设置出现问题。
- 同样，由于一个 TCP 连接可以持久，因此在传输许多小文件时，WebDAV 将比 FTP 快一点-无需为每个文件建立数据连接。
- GZIP 压缩是 HTTP 的标准，但不是 FTP 的标准（是的，FTP 中提供了 MODE Z，但未在任何标准中定义）。
- HTTP 有很多未在 FTP 中定义的身份验证方法。 例如。 NTLM 和 Kerberos 身份验证在 HTTP 和 FTP 中很常见，除非您同时编写 FTP
  的客户端和服务器端，否则很难获得对它们的适当支持。
- WebDAV 支持部分传输，在 FTP 中无法部分上传（即，您不能覆盖文件中间的块）。

因此 WebDAV 是一个替代 FTP 不错的方案

## 安装

目前 Apache 和 Nginx 均支持 WebDAV，可作为 WebDAV 文件共享服务器软件，但这里推荐使用 https://github.com/hacdias/webdav，基于
Go 语言实现，不仅跨平台，还支持 ARM 架构，可在㠌入式设备中部署 WebDAV 服务器。

首先下载对应的执行程序 **webdav** ，然后创建配置文件 <u>webdav.yml</u>

```yml
# 地址
address: 0.0.0.0
# 端口
port: 991
# 用户验证
auth: true
# 开启TLS
tls: false
# 证书与密钥
cert: cert.pem
key: key.pem
# 访问前缀
prefix: /

# 用户默认配置，自动合并
# 作用路径
scope: .
# 是否允许修改
modify: true
# 规则
rules: [ ]

# 跨域设置
cors:
  enabled: true
  credentials: true
  allowed_headers:
    - Depth
  allowed_hosts:
    - http://localhost:8080
  allowed_methods:
    - GET
  exposed_headers:
    - Content-Length
    - Content-Range

# 用户定义
users:
  - username: admin
    password: admin
    scope: /a/different/path
  - username: encrypted
    password: "{bcrypt}$2y$10$zEP6oofmXFeHaeMfBNLnP.DO8m.H.Mwhd24/TOX2MWLxAExXi4qgi"
  - username: "{env}ENV_USERNAME"
    password: "{env}ENV_PASSWORD"
  - username: basic
    password: basic
    modify: false
    rules:
      - regex: false
        allow: false
        path: /some/file
      - path: /public/access/
        modify: true
```

开始运行

```shell
webdav -c ./webdav.yml
```

## 守护

运行测试后可将其加入进程守护，首先准备：

迁入用户执行

```shell
cp webdav /usr/local/bin
chmod +x /usr/local/bin/webdav
```

规范配置路径

```shell
cp webdav.yml /opt/webdav
```

创建 <u>webdav.service</u> 在 <u>/etc/systemd/system</u> 目录中：

```ini
[Unit]
Description=WebDAV server
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/webdav --config /opt/webdav/webdav.yml
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启动服务，并加入自启

```shell
systemctl enable webdav
systemctl start webdav
```
