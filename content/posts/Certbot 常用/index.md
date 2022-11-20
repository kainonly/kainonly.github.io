---
title: Certbot 常用
date: 2020-01-23
tags:
  - Linux
categories:
  - 运维
---

网站目录方式申请

```shell
certbot certonly --webroot -d www.kainonly.com -w /website/www.kainonly.com
```

泛域名证书申请

```shell
certbot certonly --preferred-challenges dns --manual  -d *.kainonly.com --server https://acme-v02.api.letsencrypt.org/directory
```

取消证书续订

```shell
certbot delete --cert-name www.kainonly.com
```
