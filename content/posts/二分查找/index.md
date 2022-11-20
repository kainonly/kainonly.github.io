---
title: 二分查找
date: 2021-09-12
tags:
  - 算法 & 数据结构
categories:
  - 笔记
---

二分查找使用了分治法的思想，是将 n 个元素分成大致相等的两部分，取 **中间值** 与 **目标值** 做比较：

- 如果{{<katex>}}x=data[n/2]{{</katex>}}, 则找到 x 算法中止
- 如果{{<katex>}}x<data[n/2]{{</katex>}}, 则只需要在数组 data 的左半部分继续搜索 x
- 如果{{<katex>}}x>data[n/2]{{</katex>}}, 则只需要在数组 data 的右半部分继续搜索 x

## 时间复杂度

即是循环的次数，总共有 n 个元素，渐渐跟下去就是{{<katex>}}n,n/2,n/4...n/2^k{{</katex>}}，其中 k 就是循环的次数
由于取整后{{<katex>}}n/2^k>=1{{</katex>}}，即令{{<katex>}}n/2^k=1{{</katex>}}，可得{{<katex>}}k=\log_2n{{</katex>}}（以 2 为底，n 的对数）
所以时间复杂度可以表示{{<katex>}}O(n)=O(\log_2n){{</katex>}}或者{{<katex>}}O(n)=O(\log n){{</katex>}}

## 思路

通常出现以下特征时，它可能需要使用二分查找：

- 查找的数组有序或者部分有序
- 要求时间复杂度低于{{<katex>}}O(n)=O(\log_2n){{</katex>}}或者{{<katex>}}O(n)=O(\log n){{</katex>}}

二分查找有很多种变体，使用时需要注意查找条件，判断条件和左右边界的更新方式，三者配合不好就很容易出现死循环或者遗漏区域，以下有几种常见的方式：

- 标准的二分查找
- 二分查找左边界
- 二分查找右边界
- 二分查找左右边界
- 二分查找极值点

### 标准的二分查找

首先，标准二分查找的适用场景是：**数组元素有序且不重复**
我们以 “搜索一个数，如果存在，返回其索引，否则返回 -1” 为例

```go
func search(nums []int, target int) int {
	left := 0
	right := len(nums) - 1
	for left <= right {
		mid := left + (right-left)/2
		if nums[mid] == target {
			return mid
		}
		if nums[mid] > target {
			right = mid - 1
		} else {
			left = mid + 1
		}
	}
	return -1
}
```
