---
title: 滑动窗口
date: 2021-09-16
tags:
  - 算法 & 数据结构
categories:
  - 笔记
---

## 思路

对于示例一中的字符串，我们列举出这些结果，其中括号中表示选中的字符以及最长的字符串：

- 以{{<katex>}}\texttt{(a)bcabcbb}{{</katex>}}开始的最长字符串为{{<katex>}}\texttt{(abc)abcbb}{{</katex>}}；
- 以{{<katex>}}\texttt{a(b)cabcbb}{{</katex>}}开始的最长字符串为{{<katex>}}\texttt{a(bca)bcbb}{{</katex>}}；
- 以{{<katex>}}\texttt{ab(c)abcbb}{{</katex>}}开始的最长字符串为{{<katex>}}\texttt{ab(cab)cbb}{{</katex>}}；
- 以{{<katex>}}\texttt{abc(a)bcbb}{{</katex>}}开始的最长字符串为{{<katex>}}\texttt{abc(abc)bb}{{</katex>}}；
- 以{{<katex>}}\texttt{abca(b)cbb}{{</katex>}}开始的最长字符串为{{<katex>}}\texttt{abca(bc)bb}{{</katex>}}；
- 以{{<katex>}}\texttt{abcab(c)bb}{{</katex>}}开始的最长字符串为{{<katex>}}\texttt{abcab(cb)b}{{</katex>}}；
- 以{{<katex>}}\texttt{abcabc(b)b}{{</katex>}}开始的最长字符串为{{<katex>}}\texttt{abcabc(b)b}{{</katex>}}；
- 以{{<katex>}}\texttt{abcabcb(b)}{{</katex>}}开始的最长字符串为{{<katex>}}\texttt{abcabcb(b)}{{</katex>}}。

如果我们依次递增地枚举子串的起始位置，那么子串的结束位置也是递增的。这里的原因在于，假设我们选择字符串中的第{{<katex>}}k{{</katex>}}个字符作为起始位置，并且得到了不包含重复字符的最长子串的结束位置为{{<katex>}}r_k{{</katex>}}。那么当我们选择第{{<katex>}}k+1{{</katex>}}个字符作为起始位置时，首先从{{<katex>}}k+1{{</katex>}}到{{<katex>}}r_k{{</katex>}}的字符显然是不重复的，并且由于少了原本的第{{<katex>}}k{{</katex>}}个字符，我们可以尝试继续增大{{<katex>}}r_k{{</katex>}}，直到右侧出现了重复字符为止。

- 我们使用两个指针表示字符串中的某个子串（或窗口）的左右边界，其中左指针代表着上文中「枚举子串的起始位置」，而右指针即为上文中的{{<katex>}}r_k{{</katex>}}
- 在每一步的操作中，我们会将左指针向右移动一格，表示 我们开始枚举下一个字符作为起始位置，然后我们可以不断地向右移动右指针，但需要保证这两个指针对应的子串中没有重复的字符。在移动结束后，这个子串就对应着以左指针开始的，不包含重复字符的最长子串。我们记录下这个子串的长度；
- 在枚举结束后，我们找到的最长的子串的长度即为答案。

## 复杂度分析

- 时间复杂度：{{<katex>}}O(N){{</katex>}}，其中{{<katex>}}N{{</katex>}}是字符串的长度。左指针和右指针分别会遍历整个字符串一次。
- 空间复杂度：{{<katex>}}O(|\Sigma|){{</katex>}}，其中{{<katex>}}\Sigma{{</katex>}}表示字符集（即字符串中可以出现的字符），{{<katex>}}|\Sigma|{{</katex>}}表示字符集的大小。
