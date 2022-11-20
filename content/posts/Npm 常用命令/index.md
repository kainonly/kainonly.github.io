---
title: Npm 常用命令
date: 2016-10-20
tags:
  - NodeJs
categories:
  - 前端
---

NPM 的全称是 Node Package Manager，是随同 NodeJS 一起安装的包管理和分发工具，它很方便让 JavaScript 开发者下载、安装、上传以及管理已经安装的包。

## npm init

用于设置新的或现有的 npm 软件包

```shell
npm init [--force|-f|--yes|-y|--scope]
npm init <@scope> (same as `npm exec <@scope>/create`)
npm init [<@scope>/]<name> (same as `npm exec [<@scope>/]create-<name>`)
npm init [-w <dir>] [args...]
```

## npm install

此命令将安装软件包及其依赖的任何软件包

```shell
npm install (with no args, in package dir)
npm install [<@scope>/]<name>
npm install [<@scope>/]<name>@<tag>
npm install [<@scope>/]<name>@<version>
npm install [<@scope>/]<name>@<version range>
npm install <alias>@npm:<name>
npm install <git-host>:<git-user>/<repo-name>
npm install <git repo url>
npm install <tarball file>
npm install <tarball url>
npm install <folder>

aliases: npm i, npm add
common options: [-P|--save-prod|-D|--save-dev|-O|--save-optional|--save-peer] [-E|--save-exact] [-B|--save-bundle] [--no-save] [--dry-run]
```

- `-g` or `--global` 全局安装
- `-S` or `--save` 本地运行时安装
- `-P` or `--save-prod` 生产运行时安装
- `-D` or `--save-dev` 开发运行时安装

## npm uninstall

这将卸载软件包，从而完全删除代表该软件包安装的所有 npm

```shell
npm uninstall [<@scope>/]<pkg>[@<version>]... [-S|--save|--no-save]

aliases: remove, rm, r, un, unlink
```

## npm update

该命令会将所有列出的软件包更新到最新版本（由标记 config 指定），同时注意使用 semver

```shell
npm update [-g] [<pkg>...]

aliases: up, upgrade
```

## npm rebuild

此命令在匹配的文件夹上运行 npm build 命令

```shell
npm rebuild [[<@scope>/]<name>[@<version>] ...]

alias: rb
```

## npm audit

audit 命令将对项目中配置的依赖项的描述提交给默认源，并要求提供已知漏洞的报告。

```shell
npm audit [--json] [--production] [--audit-level=(low|moderate|high|critical)]
npm audit fix [--force|--package-lock-only|--dry-run|--production|--only=(dev|prod)]

common options: [--production] [--only=(dev|prod)]
```

## npm cache

用于添加，列出或清理 npm 缓存文件夹

```shell
npm cache add <tarball file>...
npm cache add <folder>...
npm cache add <tarball url>...
npm cache add <name>@<version>...

npm cache clean
aliases: npm cache clear, npm cache rm

npm cache verify
```

## npm config

npm config 命令可用于更新和编辑用户和全局 npmrc 文件的内容

```shell
npm config set <key>=<value> [<key>=<value> ...]
npm config get [<key> [<key> ...]]
npm config delete <key> [<key> ...]
npm config list [--json]
npm config edit
npm set <key>=<value> [<key>=<value> ...]
npm get [<key> [<key> ...]]

alias: c
```

## npm adduser

在指定的源中创建或验证名为 `<username>` 的用户，然后将凭据保存到 .npmrc 文件中

```shell
npm adduser [--registry=url] [--scope=@orgname] [--auth-type=legacy]

aliases: login, add-user
```

## npm publish

将程序包发布到源，以便可以按名称安装

```shell
npm publish [<tarball>|<folder>] [--tag <tag>] [--access <public|restricted>] [--otp otpcode] [--dry-run]

Publishes '.' if no argument supplied
Sets tag 'latest' if no --tag specified
```

- 组织发布公共包必须 `--access=public`，设置 `package.json` 的 `private` 无效

## npm deprecate

此命令将更新软件包的 npm 源项，向所有尝试安装该软件包的人提供弃用警告。

```shell
npm deprecate <pkg>[@<version range>] <message>
```

## npm unpublish

这将从源中删除软件包版本，删除其条目并删除压缩包。

```shell
npm unpublish [<@scope>/]<pkg>@<version>
```

即使取消发布程序包版本，该特定名称和版本组合也永远无法重用。 为了再次发布该程序包，您必须使用新的版本号。 如果取消发布整个程序包，则可能要等到 24 小时后才能发布该程序包的任何新版本。
