---
title: MySQL 创建存储过程与函数
date: 2017-03-10
tags:
  - MySQL
categories:
  - 数据库
---

## 存储过程

```sql
CREATE
    [DEFINER = user]
    PROCEDURE sp_name ([proc_parameter[,...]])
    [characteristic ...] routine_body
```

- `proc_parameter` \[ IN | OUT | INOUT ] _参数名_ _参数类型_
- `routine_body` 函数体

示例

```sql
CREATE PROCEDURE citycount (IN country CHAR(3), OUT cities INT)
BEGIN
    SELECT COUNT(*) INTO cities FROM world.city
    WHERE CountryCode = country;
END
```

## 函数

```sql
CREATE
    [DEFINER = user]
    FUNCTION sp_name ([func_parameter[,...]])
    RETURNS type
    [characteristic ...] routine_body
```

- `func_parameter` _参数名_ _参数类型_
- `type` 返回值累心
- `routine_body` 函数体

示例

```sql
CREATE FUNCTION hello (s CHAR(20))
RETURNS CHAR(50) DETERMINISTIC
RETURN CONCAT('Hello, ',s,'!');
```

## Characteristic

```sql
characteristic: {
    COMMENT 'string'
  | LANGUAGE SQL
  | [NOT] DETERMINISTIC
  | { CONTAINS SQL | NO SQL | READS SQL DATA | MODIFIES SQL DATA }
  | SQL SECURITY { DEFINER | INVOKER }
}
```
