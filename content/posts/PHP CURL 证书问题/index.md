---
title: PHP CURL 证书问题
date: 2017-01-24
tags:
  - PHP
categories:
  - 后端
---

如出现该错误, 未正确配置 CA 证书

```shell
curl: (60) SSL certificate : unable to get local issuer certificate
```

下载证书 <u>http://curl.haxx.se/ca/cacert.pem</u>, 配置 `php.ini`

```ini
curl.cainfo = "/usr/local/php/cacert.pem"
```
