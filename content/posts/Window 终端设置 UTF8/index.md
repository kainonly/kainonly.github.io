---
title: Window 终端设置 UTF8
date: 2018-05-14
tags:
  - Windows
categories:
  - 笔记
---

CMD 设置

- 首先，win+R --> regedit 打开注册表
- 在路径 <u>计算机\HKEY_CURRENT_USER\Console\%SystemRoot%\_system32_cmd.exe</u> 中找到 _CodePage_
- 数据数值修改为 `0000fde9`

PowerShell 设置

创建一个 PowerShell 配置文件，打开 PowerShell 执行

```powershell
New-Item $PROFILE -ItemType File -Force
```

修改创建的配置文件 <u>Microsoft.PowerShell_profile.ps1</u>，加入内容

```powershell
[System.Console]::OutputEncoding=[System.Text.Encoding]::GetEncoding(65001)
```

```
无法加载文件 X:\Users...\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1，因为在此系
。有关详细信息，请参阅 https:/go.microsoft.com/fwlink/?LinkID=135170 中的 about_Execution_Policies。
```

修改 PowerShell 的执行策略 **Execution Policy**，执行：

```powershell
Set-ExecutionPolicy Unrestricted
```
