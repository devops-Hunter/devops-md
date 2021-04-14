---
title: 笔记而已
order: 3
nav:
  title: Golang
  path: /Golang
  order: 4
---

# 🏷 仅仅是笔记

## 📋 第一章内容

---

- `Print` 、 `Println` 和 `Printf` 函数都可以将⽂本和数字打印到屏幕上。

- `Printf` 函数和格式化变量 `%v` ，⽤户可以将值放置到被打印⽂本的任意位置上。

- `const` 关键字声明的是常量，它们⽆法被改变。

- `var` 关键字声明的是变量，它们可以在程序运⾏的过程中被赋予新值。

- rand 包的导⼊路径为 `math/rand` 。

- rand 包中的 `Intn` 函数可以⽣成伪随机数。

- 到⽬前为⽌，我们已经使⽤了 Go 25 个关键字中的 5 个，它们分别是：`package` 、 `import` 、 `func` 、 `const` 和 `var`

### 🔨 实验：malacandra.go

<Alert type="info">
Malacandra并不遥远，我们大约只需二十八天就可以到达哪里。 --C.S.Lewis，《沉寂的星球》
</Alert>

#### <Badge>编写一个程序，计算出在距离为 56,000,000 公里的情况下，宇宙飞船需要以每小时多少公里的速度飞行才能够只用 28 天就到达 Malacandra（火星) </Badge>

```go
package main

import "fmt"

func main() {
	var distance = 56000000 //km
	const date = 28
	var hour = date * 24
	fmt.Printf("宇宙飞船需要以每小时%v公里的速度才能够只用%v天就到达Malacandra", distance/hour, date)
}
```

## 📋 第二章内容

---

- 布尔值是唯一可以用于条件判断的值

- Go 通过`if`,`switch`和`for`来实现分支判断和重复执行代码

- 到目前为止，我们已经使用了 25 个 Go 关键字中的 12 个，分别是：

1. `package`
2. `import`
3. `func`
4. `var`
5. `if`
6. `else`
7. `switch`
8. `case`
9. `default`
10. `fallthrough`
11. `for`
12. `break`

### 🔨 实验：infinity.go

#### <Badge>火箭的发射过程并非总是一帆风顺。请实现一个火箭发射倒数程序，它在倒数过程中的每一秒钟都伴随着百分之一的几率会发射失败并停止倒数</Badge>

```go
package main

import (
	"fmt"
	"math/rand"
	"time"
)

func main() {
	//随机数种种子
	rand.Seed(time.Now().Unix())
	var count = 10
	for count > 0 {
		fmt.Println(count)
		time.Sleep(time.Second)
		//0~99里随机取一个数字
		if rand.Intn(100) == 0 {
			break
		}
		count--
	}
	if count == 0 {
		fmt.Println("🚀发射成功！！！")
	} else {
		fmt.Println("🚀爆炸了！！！")
	}
}

```

#### <Badge>请编写一个猜数字程序，让它重复地从 1 到 100 之间随机选择一个数字，直到这个数字跟你在程序开头声明的数字相同为止。请打印出程序随机选中的每个数字，并说明该数字是大于还是小于你指定的数字</Badge>

```go
package main

import (
	"fmt"
	"math/rand"
	"time"
)

func main() {
	rand.Seed(time.Now().Unix())
	//指定一个数字
	var a = 15
    for  {
		var b = rand.Intn(100) + 1
    	fmt.Printf("我猜%v\n",b)
		time.Sleep(time.Second)

		if b > a {
			fmt.Println("这个数比a要大！")
		} else if b < a {
			fmt.Println("这个数比a要小！")
		} else  {
			break
		}
	}
	fmt.Println("兄弟你猜对了！")
}
```

## 📋 第三章内容

---

- 左大括号 { 开启一个新的作用域而右大括号 } 则结束该作用域

- 虽然没有用到大括号，但关键字`case`和`default`也都引入了新的作用域。

- 声明变量的位置决定了变量所处的作用域

- 简短声明不仅仅是 var 声明的快捷方式，它还可以用在 var 声明无法使用的地方

- 在 for 语句，if 语句和 switch 语句所在行声明的变量，其作用域将持续至语句结束为止

- 宽广的作用域有时候会比狭窄的作用域更好，反之亦然

### 🔨 实验：random-data.go

#### <Badge>生成一个随机年费而不是一直使用 2018 年。如果生成的年份为闰年，那么将一月份的 daysInMonth 变量的值设置为 29，反之则将其设置为 28。使用 for 循环生成并显示 10 个随机日期</Badge>

```go
package main
import ( "fmt"
	"math/rand"
	"time"
)

var era = "AD"

func main() {
	rand.Seed(time.Now().Unix())
	//生成一个随机年份
	year := rand.Intn(100)+2000
	fmt.Println(year)
	month := rand.Intn(12) + 1
	fmt.Println(month)
	daysInMonth := 31
	//变量leap判断是否是瑞年
	leap := year%400 == 0 || (year%4 == 0 && year%100 != 0)

	switch month {
	case 1:
		if leap {
			daysInMonth = 29
		} else {
			daysInMonth = 28
		}
	case 2:
		daysInMonth = 28
	case 4, 6, 9, 11:
		daysInMonth = 30
	}

	for i:= 0 ;i< 11;i++ {
		day := rand.Intn(daysInMonth) + 1
		fmt.Println(era, year, month, day)
	}

}
```
