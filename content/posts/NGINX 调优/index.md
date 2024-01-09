---
title: NGINX 调优
date: 2017-05-03
tags:
  - Nginx
categories:
  - 运维
---

修改 <u>/etc/sysctl.conf</u> Linux 内核参数，让 **nginx** 充分的发挥

### fs.file-max = 65535

表示单个进程最大可以打开的句柄数

追加修改 <u>/etc/security/limits.conf</u>

```
*　　soft　　nofile　　65535
*　　hard　　nofile　　65535
```

### net.ipv4.tcp_tw_reuse = 1

表示允许将 TIME_WAIT 状态的 socket 重新用于新的 TCP 链接，这对于服务器来说意义重大，因为总有大量 TIME_WAIT 状态的链接存在

### ner.ipv4.tcp_keepalive_time = 600

当 keepalive 启动时，TCP 发送 keepalive 消息的频度；默认是 2 小时，将其设置为 10 分钟，可以更快的清理无效链接

### net.ipv4.tcp_fin_timeout = 30

当服务器主动关闭链接时，socket 保持在 FIN_WAIT_2 状态的最大时间

### net.ipv4.tcp_max_tw_buckets = 5000

这个参数表示操作系统允许 TIME_WAIT 套接字数量的最大值，如果超过这个数字，TIME_WAIT 套接字将立刻被清除并打印警告信息。该参数默认为 180000，过多的 TIME_WAIT 套接字会使 Web 服务器变慢

### net.ipv4.ip_local_port_range = 1024 65000

定义 UDP 和 TCP 链接的本地端口的取值范围

### net.ipv4.tcp_rmem = 10240 87380 12582912

定义了 TCP 接受缓存的最小值、默认值、最大值

### net.ipv4.tcp_wmem = 10240 87380 12582912

定义 TCP 发送缓存的最小值、默认值、最大值

### net.core.netdev_max_backlog = 8096

当网卡接收数据包的速度大于内核处理速度时，会有一个列队保存这些数据包。这个参数表示该列队的最大值

### net.core.rmem_default = 6291456

表示内核套接字接受缓存区默认大小

### net.core.wmem_default = 6291456

表示内核套接字发送缓存区默认大小

### net.core.rmem_max = 12582912

表示内核套接字接受缓存区最大大小

### net.core.wmem_max = 12582912

表示内核套接字发送缓存区最大大小

### net.ipv4.tcp_syncookies = 1

用于解决 TCP 的 SYN 攻击

### net.ipv4.tcp_max_syn_backlog = 8192

这个参数表示 TCP 三次握手建立阶段接受 SYN 请求列队的最大长度，默认 1024，将其设置的大一些可以使出现 Nginx 繁忙来不及 accept 新连接的情况时，Linux 不至于丢失客户端发起的链接请求

### net.ipv4.tcp_tw_recycle = 1

这个参数用于设置启用 timewait 快速回收

### net.core.somaxconn = 262114

选项默认值是 128，这个参数用于调节系统同时发起的 TCP 连接数，在高并发的请求中，默认的值可能会导致链接超时或者重传，因此需要结合高并发请求数来调节此值

### net.ipv4.tcp_max_orphans = 262114

选项用于设定系统中最多有多少个 TCP 套接字不被关联到任何一个用户文件句柄上。如果超过这个数字，孤立链接将立即被复位并输出警告信息。
这个限制指示为了防止简单的 DOS 攻击，不用过分依靠这个限制甚至认为的减小这个值，更多的情况是增加这个值

隐藏版本号

```nginx
http {
+    server_tokens off;
}
```

隐藏 X-Powered-By

```nginx
expose_php = Off
```

禁止 **Scrapy** 等爬虫工具的抓取、禁止指定 UA 及 UA 为空的访问、禁止非 `GET` `HEAD` `POST` 方式的抓取

```nginx
server {
    # 禁止 Scrapy 等爬虫工具的抓取
    if ($http_user_agent ~* "Scrapy|Sogou web spider|Baiduspider") {
        return 403;
    }

    # 禁止指定 UA 及 UA 为空的访问
    if ($http_user_agent ~ "FeedDemon|JikeSpider|Indy Library|Alexa Toolbar|AskTbFXTV|AhrefsBot|CrawlDaddy|CoolpadWebkit|Java|Feedly|UniversalFeedParser|ApacheBench|Microsoft URL Control|Swiftbot|ZmEu|oBot|jaunty|Python-urllib|lightDeckReports Bot|YYSpider|DigExt|YisouSpider|HttpClient|MJ12bot|heritrix|EasouSpider|LinkpadBot|Ezooms|^$" ) {
        return 403;
    }

    # 禁止非 GET | HEAD | POST 方式的抓取
    if ($request_method !~ ^(GET|HEAD|POST)$) {
        return 403;
    }
}
```

站点设置增加头部

```nginx
server {
  add_header X-Frame-Options "SAMEORIGIN";
  add_header X-XSS-Protection "1; mode=block";
  add_header X-Content-Type-Options "nosniff";
}
```

- `X-Frame-Options "SAMEORIGIN"` 页面只能被本站页面嵌入到 iframe 或者 frame 中
- `X-XSS-Protection "1; mode=block"` 如果检测到攻击，浏览器不会像上面的选项一样将不安全的部分删除，而是直接阻止整个页面的加载
- `X-Content-Type-Options "nosniff"` 为所有文件提供 nosniff 标头，以减少来自用户内容的注入攻击的风险
