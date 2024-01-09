---
title: PHP 缓存优化
date: 2017-01-23
tags:
  - PHP
categories:
  - 后端
---

OPcache 是 PHP 中的 Zend 扩展，可以大大提升 PHP 的性能。 OPcache 通过将 PHP 脚本预编译的字节码存储到共享内存中来提升 PHP 的性能， 存储预编译字节码的好处就是 省去了每次加载和解析 PHP 脚本的开销。

## 原理

`Opcode` 是一种 PHP 文件被 Zend 引擎编译后的中间语言，就像 Java 的 `ByteCode`，或 .NET 的 `MSL`，Zend 引擎在执行代码时会经过如下 4 个步骤：

1. Scanning，re2c 进行词法分析和语法分析，将 PHP 代码转换为语言片段（Tokens）
2. Parsing，将 Tokens 转换成简单而有意义的表达式
3. Compilation，将表达式编译成 Opcodes
4. Execution，顺次执行 Opcodes，每次一条，从而实现 PHP 脚本的功能

如果你在 php.ini 中开启了 Opcache，那么每次请求来临时，Zend 引擎就不需要重复执行前面 3 步，从而大幅提升运行的性能

## 配置

### opcache.enable

启用操作码缓存，默认为 `1` 开启

### opcache.memory_consumption

OPcache 的共享内存大小，以兆字节为单位。默认 `64`，可适当调大。

### opcache.interned_strings_buffer

用来存储预留字符串的内存大小，以兆字节为单位。默认值为 `8`，建议根据服务器内存大小，设置一个大于 `64` 的值即可

通过**字符串驻留**（string interning）的技术来改善性能。例如，如果你在代码中使用了 1000 次字符串 foobar，Zend 引擎在第一次使用这个字符串时会分配一个不可变的内存区域来存储这个字符串，之后的 999 次都会直接引用这个内存区域，而不需要重复创建。

此参数将**字符串驻留**这个特性提升一个层次，默认情况下这个不可变的内存区域只会存在于单个 php-fpm 的进程中，如果设置了这个选项，那么这个内存区域将会在所有 php-fpm 进程中共享。在比较大的应用中，这可以非常有效地节约内存，提高应用的性能。

### opcache.max_accelerated_files

OPcache 哈希表中可存储的脚本文件数量上限。真实的取值是在质数集合 { 223, 463, 983, 1979, 3907, 7963, 16229, 32531, 65407, 130987 } 中找到的第一个大于等于设置值的质数。设置值取值范围最小值是 200，最大值在 PHP 5.5.6 之前是 `100000`，PHP 5.5.6 及之后是 `1000000`。

### opcache.validate_timestamps

如果启用，那么 OPcache 会每隔 `opcache.revalidate_freq` 设定的秒数 检查脚本是否更新。如果禁用此选项，你必须使用 `opcache_reset()` 或者 `opcache_invalidate()` 函数来手动重置 OPcache，也可以 通过重启 Web 服务器来使文件系统更改生效。

每次检测都是一次 stat 系统调用，众所周知，系统调用会消耗一些 CPU 时间，并且 stat 系统调用会进行磁盘 I/O，更加浪费性能。不仅如此，假设你对服务器中的 PHP 文件进行了一次大量的更新，更新的过程中部分旧的文件会因为未过期而依然生效，和部分已生效的新文件混合在一起产生作用，必然会产生不确定因素，带来很多麻烦，所以建议将此参数的值设置为 `0`。

### opcache.file_update_protection

如果文件的最后修改时间距现在不足此项配置指令所设定的秒数，那么这个文件不会进入到缓存中。这是为了防止尚未完全修改完毕的文件进入到缓存。如果你的应用中不存在部分修改文件的情况，把此项设置为 0 可以提高性能。

### opcache.huge_code_pages

启用或者禁用将 PHP 代码（文本段）拷贝到 HUGE PAGES 中。 此项配置指令可以提高性能，但是需要在 OS 层面进行对应的配置。此参数值为 `1` 开启功能，默认值为 `0`。

众所周知，Linux 系统默认内存是以 4KB 进行分页的，而虚拟地址和内存地址是需要转换的，转换过程需要进行查表，CPU 为了加速查表会内建 TLB（Translation Lookaside Buffer），而 TLB 的大小是有限的，分页越小，表里的条目也就越多，TLB 的 Cache Miss 也就越高。

所以我们如果启用大内存页，就能间接降低 TLB 的 Cache Miss，而 Opcache 也能使用 Hugepage 来缓存 Opcodes，从而达到性能优化的目的。

需要注意的是此参数需要系统开启 Hugepage 功能，使用如下命令可以查看当前系统 Hugepage 的信息：

```shell
cat /proc/meminfo | grep Huge
```

运行该命令会输入类似如下结果，可以看到 `HugePages_Total` 等参数的值为 `0`，也就是未开启 HugePages 功能。

```shell
AnonHugePages:    495616 kB
ShmemHugePages:        0 kB
HugePages_Total:       0
HugePages_Free:        0
HugePages_Rsvd:        0
HugePages_Surp:        0
Hugepagesize:       2048 kB
Hugetlb:               0 kB
```

修改 <u>sysctl.conf</u> 文件加入，其中 `128` 代表 HugePages 的大小（具体按情况而定），单位是 MB：

```conf
vm.nr_hugepages = 128
```

生效配置

```shell
sysctl -p
```
