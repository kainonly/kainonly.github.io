---
title: 使用 APT 安装新版本 PHP
date: 2020-12-22
tags:
  - PHP
categories:
  - 后端
---

用于 Debian 的最新 PHP 版本可在 SURY PHP PPA 存储库中找到。我们将添加存储库作为先决条件，然后在 Debian 10 / Debian 9 上安装 PHP 8.0。

## 新增 SURY PHP 源

```shell
sudo apt -y install lsb-release apt-transport-https ca-certificates
sudo wget -O /etc/apt/trusted.gpg.d/php.gpg https://packages.sury.org/php/apt.gpg
echo "deb https://packages.sury.org/php/ $(lsb_release -sc) main" | sudo tee /etc/apt/sources.list.d/php.list
```

## 更新 APT 源

```shell
sudo apt update
```

## 安装 PHP

```shell
sudo apt -y install php8.0-cli
```

## 安装扩展与支持

```shell
sudo apt-get install php8.0-{fpm,bcmath,bz2,intl,gd,mbstring,mysql,zip}
```
