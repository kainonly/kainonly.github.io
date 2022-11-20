---
title: 登录时启动 ssh-agent
date: 2021-11-29
tags:
  - Linux
categories:
  - 运维
---

将此添加到您的中 ~/.bashrc

```bash
if [ ! -S /run/ssh-agent.socket ]; then
    eval "$(ssh-agent -s -a /run/ssh-agent.socket)"
    ssh-add ~/.ssh/id_rsa
fi 

export SSH_AUTH_SOCK=/run/ssh-agent.socket
```
