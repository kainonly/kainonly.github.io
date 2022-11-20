---
title: PHP Session 分布
date: 2018-04-05
tags:
  - PHP
categories:
  - 后端
---

在以前我们很多项目都是集中式的开发（即 LAMP、LNMP 一体式解决方案），并且整个授权完全基于 Session 的居多。

而这样的项目有时又需要分布高可用的改良，因此需要接解决多台服务器的 Session 共享问题
对于 PHP 让 Session 存储在 redis 是一个很不错的方案，首选需要为 PHP 安装 Redis 扩展 http://pecl.php.net/package/redis

- `>=PHP7` 选 `^5.0.0`
- `PHP 5` 选 `4.3.0`

使用 docker 则在 Dockerfile 中加入

```shell
pecl install redis \
    && docker-php-ext-enable redis \
```

扩展安装完毕后我们为其配置 `php.ini`

```ini
[Session]
session.save_handler = redis
session.save_path = "tcp://localhost:6379?database=10&auth=abcd"
```

详情 https://github.com/phpredis/phpredis/blob/develop/README.markdown#php-session-handler

{{<hint info>}}

如果 redis 口令中包含 `#` 号，则会提示 `NOAUTH Authentication required` 的错误，是因为 `php.ini` 误当成注释了。

解决方式：将 `#` 进行 URL 编码，替换成 `%23`

{{</hint>}}
