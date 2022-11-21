---
bookToC: false
weight: 20
title: 配置（待更新）
---

## 页面配置

![](页面.png)

## 动态配置

| **名称**                  | **默认** | **密文** | **说明**                                                                                                                                                |
| ------------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| session_ttl               | 3600     |          | 会话周期（秒）。用户在 **1 小时 **内没有操作，将结束会话。                                                                                              |
| login_ttl                 | 900      |          | 登录锁定时间（秒）。锁定 **15 分钟**。                                                                                                                  |
| login_failures            | 5        |          | 用户最大登录失败次数。有限时间（锁定时间）内连续登录失败** 5 次**，锁定帐号。                                                                           |
| ip_login_failures         | 10       |          | IP 最大登录失败次数。同 IP 连续 **10** 次登录失败后，锁定 IP（周期为锁定时间）。                                                                        |
| ip_whitelist              | []       |          | IP 白名单。白名单 IP 允许超出最大登录失败次数。                                                                                                         |
| ip_blacklist              | []       |          | IP 黑名单。黑名单 IP 将禁止访问。                                                                                                                       |
| pwd_strategy              | 1        |          | 密码强度。0：无限制；1：需要大小写字母；2：需要大小写字母、数字；3：需要大小写字母、数字、特殊字符。                                                    |
| pwd_ttl                   | 365      |          | 密码有效期（天）。密码过期后强制要求修改密码，0：永久有效                                                                                               |
| cloud                     | -        |          | 云平台。支持**tencent**：腾讯云；                                                                                                                       |
| tencent_secret_id         | -        |          | 腾讯云 API 密钥 Id，建议用子账号分配需要的权限                                                                                                          |
| tencent_secret_key        | -        | 是       | 腾讯云 API 密钥 Key                                                                                                                                     |
| tencent_cos_bucket        | -        |          | 腾讯云 COS 对象存储 Bucket（存储桶名称）                                                                                                                |
| tencent_cos_region        | -        |          | 腾讯云 COS 对象存储所属地域，例如：ap-guangzhou                                                                                                         |
| tencent_cos_expired       | -        |          | 腾讯云 COS 对象存储预签名有效期，单位：秒                                                                                                               |
| tencent_cos_limit         | -        |          | 腾讯云 COS 对象存储上传大小限制，单位：KB                                                                                                               |
| office                    | -        |          | 企业平台。支持**feishu**：飞书；                                                                                                                        |
| feishu_app_id             | -        |          | 飞书应用 ID                                                                                                                                             |
| feishu_app_secret         | -        | 是       | 飞书应用密钥                                                                                                                                            |
| feishu_encrypt_key        | -        | 是       | 飞书事件订阅安全校验数据密钥                                                                                                                            |
| feishu_verification_token | -        | 是       | 飞书事件订阅验证令牌                                                                                                                                    |
| redirect_url              | -        |          | 第三方免登授权码跳转地址                                                                                                                                |
| email_host                | -        |          | 公共电子邮件服务 SMTP 地址                                                                                                                              |
| email_port                | -        |          | SMTP 端口号（SSL）                                                                                                                                      |
| email_username            | -        |          | 公共邮箱用户，例如：support@example.com                                                                                                                 |
| email_password            | -        | 是       | 公共邮箱用户密码                                                                                                                                        |
| openapi_url               | -        |          | 开放服务地址                                                                                                                                            |
| openapi_key               | -        |          | 开放服务应用认证 Key，API 网关应用认证方式 [https://cloud.tencent.com/document/product/628/55088](https://cloud.tencent.com/document/product/628/55088) |
| openapi_secret            | -        | 是       | 开放服务应用认证密钥                                                                                                                                    |
| ${model}\_event           | -        |          | 指定模型（model）开启事务补偿                                                                                                                           |
| ${model}\_projection      | -        |          | 指定模型（model）设置投影                                                                                                                               |
