---
title: PostgreSQL 优化
date: 2021-09-13
tags:
  - PostgreSQL
categories:
  - 数据库
---

## 参数

### max_connections

允许客户端连接的最大数目

### fsync

强制把数据同步更新到磁盘

### shared_buffers

决定有多少内存可以被 PostgreSQL 用于缓存数据（推荐内存的 1/4，不超过内存的 1/2)

### work_mem

使内部排序和一些复杂的查询都在这个 buffer 中完成，不够要适可而止，每个连接都要用这么大的

### effective_cache_size

优化器假设一个查询可以用的最大内存，和 shared_buffers 无关（推荐内存的 1/2)

### maintenance_work_mem

这里定义的内存只是被 VACUUM 等耗费资源较多的命令调用时使用

### wal_buffer

日志缓存区的大小

### checkpoint_segments

设置 wal log 的最大数量数（一个 log 的大小为 16M）

### checkpoint_completion_target

表示 checkpoint 的完成时间要在两个 checkpoint 间隔时间的 N% 内完成

### commit_delay

事务提交后，日志写到 wal log 上到 wal_buffer 写入到磁盘的时间间隔。需要配合 commit_sibling

### commit_siblings

设置触发 commit_delay 的并发事务数，根据并发事务多少来配置

## 优化

- 配置参数优化推荐使用 <u>https://pgtune.leopard.in.ua/</u> 估算
- 开源版自建推荐采用 <u>https://www.percona.com/software/postgresql-distribution</u>

## 扩展

开启 UUID

```sql
create extension "uuid-ossp";
```
