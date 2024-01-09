---
title: Lumen
date: 2016-07-01
tags:
  - PHP
categories:
  - 后端
---

## 增加 Cookie

安装

```shell
composer require illuminate/cookie
```

配置

```php
$app->singleton('cookie', function () use ($app) {
    return $app->loadComponent('session', 'Illuminate\Cookie\CookieServiceProvider', 'cookie');
});

$app->bind('Illuminate\Contracts\Cookie\QueueingFactory', 'cookie');
```
