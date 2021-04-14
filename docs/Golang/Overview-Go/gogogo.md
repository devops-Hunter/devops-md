---
title: 笔记而已
order: 3
nav:
  title: Golang
  path: /Golang
  order: 4
---

# 仅仅是笔记

## 📋 第一章内容

---

- 🏷 `Print` 、 `Println` 和 `Printf` 函数都可以将⽂本和数字打印到屏幕上。

- 🏷 通过 `Printf` 函数和格式化变量 `%v` ，⽤户可以将值放置到被打印⽂本的任意位置上。

- 🏷 `const` 关键字声明的是常量，它们⽆法被改变。

- 🏷 `var` 关键字声明的是变量，它们可以在程序运⾏的过程中被赋予新值。

- 🏷 rand 包的导⼊路径为 `math/rand` 。

- 🏷 rand 包中的 `Intn` 函数可以⽣成伪随机数。

- 🏷 到⽬前为⽌，我们已经使⽤了 Go 25 个关键字中的 5 个，它们分别是：`package` 、 `import` 、 `func` 、 `const` 和 `var`

### 🔨 实验：malacandra.go

<Alert type="info">
 # Malacandra并不遥远，我们大约只需二十八天就可以到达哪里。 --C.S.Lewis，《沉寂的星球》

编写一个程序，计算出在距离为 56,000,000 公里的情况下，宇宙飞船需要以每小时多少公里的速度飞行才能够只用 28 天就到达 Malacandra（火星）
</Alert>

```golang
package main

import "fmt"

func main() {
	var distance = 56000000 //km
	const date = 28
	var hour = date * 24
	fmt.Printf("宇宙飞船需要以每小时%v公里的速度才能够只用%v天就到达Malacandra", distance/hour, date)
}
```
