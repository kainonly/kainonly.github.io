---
title: Nats JetStream 测试
date: 2021-12-20
tags:
  - Nats
categories:
  - 后端
---

### 环境条件：

- UCloud 公网
- Kubernetes 3 个 Pod 组成 Nats 集群，每个 Pod 分别编排至不同的 Node(2C4G)

### 测试 1

- 1 个发布者，发布每条 16B 共 1000000 条的信息
- 1 个订阅者，订阅生成的 1000000 条信息

```shell
$ nats bench bar --js --pub 1 --size 16 --msgs 1000000 -s nats://s1.kainonly.com:4222,nats://s2.kainonly.com:4222,nats://s3.kainonly.com:4222 --nkey ./weplanx.key
10:37:39 Starting JetStream benchmark [subject=bar, msgs=1,000,000, msgsize=16 B, pubs=1, subs=0, js=true, stream=benchstream, storage=memory, syncpub=false, pubbatch=100, jstimeout=30s, pull=false, consumerbatch=100, push=false, c
onsumername=natscli-bench, replicas=1, purge=false, pubsleep=0s, subsleep=0s]
10:37:40 Starting publisher, publishing 1,000,000 messages
Finished   3m11s [=======================================================================================================================================================================================================] 100%

Pub stats: 5,210 msgs/sec ~ 81.41 KB/sec
```

```shell
nats bench bar --js --sub 1 --msgs 1000000 -s nats://s1.kainonly.com:4222,nats://s2.kainonly.com:4222,nats://s3.kainonly.com:4222 --nkey ./weplanx.key
10:50:51 JetStream ephemeral ordered push consumer mode, subscribers will not acknowledge the consumption of messages
10:50:51 Starting JetStream benchmark [subject=bar, msgs=1,000,000, msgsize=128 B, pubs=0, subs=1, js=true, stream=benchstream, storage=memory, syncpub=false, pubbatch=100, jstimeout=30s, pull=false, consumerbatch=100, push=false,
consumername=natscli-bench, replicas=1, purge=false, pubsleep=0s, subsleep=0s]
10:50:53 Starting subscriber, expecting 1,000,000 messages
Finished      4s [=======================================================================================================================================================================================================] 100%

Sub stats: 214,594 msgs/sec ~ 26.20 MB/sec
```

### 测试 2

- 10 个发布者，发布每条 16B 共 100000 条的信息
- 10 个订阅者，订阅生成的 100000 条信息

```shell
$ nats bench bar --js --pub 10 --size 16 --msgs 100000 -s nats://s1.kainonly.com:4222,nats://s2.kainonly.com:4222,nats://s3.kainonly.com:4222 --nkey ./weplanx.key
10:53:12 Starting JetStream benchmark [subject=bar, msgs=100,000, msgsize=16 B, pubs=10, subs=0, js=true, stream=benchstream, storage=memory, syncpub=false, pubbatch=100, jstimeout=30s, pull=false, consumerbatch=100, push=false, co
nsumername=natscli-bench, replicas=1, purge=false, pubsleep=0s, subsleep=0s]
10:53:13 Starting publisher, publishing 10,000 messages
10:53:14 Starting publisher, publishing 10,000 messages
10:53:14 Starting publisher, publishing 10,000 messages
10:53:14 Starting publisher, publishing 10,000 messages
10:53:14 Starting publisher, publishing 10,000 messages
10:53:14 Starting publisher, publishing 10,000 messages
10:53:14 Starting publisher, publishing 10,000 messages
10:53:14 Starting publisher, publishing 10,000 messages
10:53:14 Starting publisher, publishing 10,000 messages
10:53:14 Starting publisher, publishing 10,000 messages
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      2s [=======================================================================================================================================================================================================] 100%
Finished      2s [=======================================================================================================================================================================================================] 100%

Pub stats: 33,406 msgs/sec ~ 521.97 KB/sec
 [1] 5,230 msgs/sec ~ 81.72 KB/sec (10000 msgs)
 [2] 5,368 msgs/sec ~ 83.88 KB/sec (10000 msgs)
 [3] 5,113 msgs/sec ~ 79.90 KB/sec (10000 msgs)
 [4] 5,739 msgs/sec ~ 89.69 KB/sec (10000 msgs)
 [5] 5,329 msgs/sec ~ 83.27 KB/sec (10000 msgs)
 [6] 6,174 msgs/sec ~ 96.47 KB/sec (10000 msgs)
 [7] 5,020 msgs/sec ~ 78.45 KB/sec (10000 msgs)
 [8] 5,370 msgs/sec ~ 83.91 KB/sec (10000 msgs)
 [9] 4,531 msgs/sec ~ 70.81 KB/sec (10000 msgs)
 [10] 4,677 msgs/sec ~ 73.09 KB/sec (10000 msgs)
 min 4,531 | avg 5,255 | max 6,174 | stddev 452 msgs
```

```shell
$ nats bench bar --js --sub 10 --msgs 100000 -s nats://s1.kainonly.com:4222,nats://s2.kainonly.com:4222,nats://s3.kainonly.com:4222 --nkey ./weplanx.key
10:56:13 JetStream ephemeral ordered push consumer mode, subscribers will not acknowledge the consumption of messages
10:56:13 Starting JetStream benchmark [subject=bar, msgs=100,000, msgsize=128 B, pubs=0, subs=10, js=true, stream=benchstream, storage=memory, syncpub=false, pubbatch=100, jstimeout=30s, pull=false, consumerbatch=100, push=false, c
onsumername=natscli-bench, replicas=1, purge=false, pubsleep=0s, subsleep=0s]
10:56:14 Starting subscriber, expecting 100,000 messages
10:56:14 Starting subscriber, expecting 100,000 messages
10:56:14 Starting subscriber, expecting 100,000 messages
10:56:14 Starting subscriber, expecting 100,000 messages
10:56:14 Starting subscriber, expecting 100,000 messages
10:56:14 Starting subscriber, expecting 100,000 messages
10:56:14 Starting subscriber, expecting 100,000 messages
10:56:14 Starting subscriber, expecting 100,000 messages
10:56:14 Starting subscriber, expecting 100,000 messages
10:56:14 Starting subscriber, expecting 100,000 messages
Finished      0s [=======================================================================================================================================================================================================] 100%
Finished      0s [=======================================================================================================================================================================================================] 100%
Finished      0s [=======================================================================================================================================================================================================] 100%
Finished      0s [=======================================================================================================================================================================================================] 100%
Finished      0s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%
Finished      1s [=======================================================================================================================================================================================================] 100%

Sub stats: 521,209 msgs/sec ~ 63.62 MB/sec
 [1] 152,235 msgs/sec ~ 18.58 MB/sec (100000 msgs)
 [2] 177,658 msgs/sec ~ 21.69 MB/sec (100000 msgs)
 [3] 115,554 msgs/sec ~ 14.11 MB/sec (100000 msgs)
 [4] 109,408 msgs/sec ~ 13.36 MB/sec (100000 msgs)
 [5] 113,720 msgs/sec ~ 13.88 MB/sec (100000 msgs)
 [6] 89,663 msgs/sec ~ 10.95 MB/sec (100000 msgs)
 [7] 91,490 msgs/sec ~ 11.17 MB/sec (100000 msgs)
 [8] 87,942 msgs/sec ~ 10.74 MB/sec (100000 msgs)
 [9] 92,954 msgs/sec ~ 11.35 MB/sec (100000 msgs)
 [10] 97,203 msgs/sec ~ 11.87 MB/sec (100000 msgs)
 min 87,942 | avg 112,782 | max 177,658 | stddev 28,330 msgs
```
