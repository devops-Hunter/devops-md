---
title: Struct（结构体）
order: 4
nav:
  title: Golang
  path: /Golang
  order: 4
group:
  title: go基础
---

# 🏷 结构体(Struct)




## 📋 结构体初始化

---
:::info{title=info}
go语言中的一种调用方法的方式，可以把一个方法绑定到一个结构体中.然后通过结构体就可以调用这个方法
:::

### 🔨 定义结构体&初始化结构体の三种方法
```go
func main() {
	// 结构体数据类型，可以存储json这种数据，绑定方法
	// 1、通过var关键字来实例化结构体
	var p1 Person
	p1.Age = 28
	p1.name = "zhangsan"
	fmt.Println(p1)
	fmt.Println(p1.name)

	// 2、new方法实例化一个结构体(返回指针类型)
	var p2 = new(Person)
	p2.Age = 25
	p2.name = "lisi"
	fmt.Println(p2)

	// 3、:= 键值对初始化
	p3 := Person{
		name: "wangwu",
		Age:  35,
	}
	fmt.Println(p3)

}

/*
type: 关键字
Person： 结构体名字
struct：  定义结构体的关键字
*/
// golang中严格区分大小写（json序列化的时候，或者不同包访问是不能访问小写）
type Person struct {
	name string
	Age  int
}
```

### 🔨 结构体方法调用

<Badge>①结构体用法：用来模拟其他语言中的类</Badge>
<Badge>②函数调用方式：直接通过函数名字调用</Badge>
<Badge>③构体方法调用：第一、初始化一个结构体   第二、通过结构体这对象.方法名调用</Badge>

```go
func main() {
	//第二步：实例化一个结构体（实例化一个类）
	pxx := Person{
		Name: "zhangsan",
		Age:  28,
	}
	//fmt.Println(pxx)

	// 第四步：调用结构的方法（通过类调用方法）
	pxx.printInfo()

	//px2 := Person{
	//	Name: "lisi",
	//	Age:  26,
	//}
	//px2.printInfo()
}

// PersonInfo

// 第一步：定义结构体(定义一个类)
type Person struct {
	Name string
	Age  int
}

// 第三步：给结构体绑定方法和接收者
//func  printInfo()  { // 这样定义的是一个函数
//
//}
/*
(p Person) : 接收者
	- p （变量名字）类似于我们python中类函数中的 self,或者js中类中的this
	- Person  接收者的结构体
printInfo() : 一个方法绑定了结构体之后就叫做 结构体方法
*/
func (xx Person) printInfo() { // 这样定义的是一个函数
	fmt.Println("name: ", xx.Name, xx.Age)
}
```


### 🔨 结构体{值与指针接收者绑定方法}


```go
func main() {
	// 2、实例化结构体（三种方法）
	p := Person{
		Name: "zhangsan",
		Age:  24,
	}
	p.setInfo()
	p.sayHi()
	fmt.Println("main", p.Name) // 理论上是lisi
	fmt.Println("main", p.Age)
}

// 1、定义一个结构体
type Person struct {
	Name string
	Age  int
}

// 3、指针接收者绑定方法（*Person传递的是一个指针）
// 指针接收者才类似于python语言的self
func (xx *Person) setInfo() {
	fmt.Println("通过结构体调用了方法")
	xx.Name = "lisi"
}

// 值接收者（Person） 只传递的是拷贝的一份数据
// 值接收者修改数据，只是修改的是拷贝的那份数据，原始数据
func (xx Person) sayHi() {
	fmt.Println("hello world")
	xx.Age = 100
	fmt.Println("sayHi", xx.Age)
}

```

### 🔨 将结构体转化成json字符串


```go
func main() {
	// 2、初始化结构体
	s := Student{
		ID:      1,
		Name:    "zhangsan",
		Address: "bj",
		Age:     24,
	}
	fmt.Printf("%T %#v \n", s, s)
	// 3、将结构体转化为json数据
	/*
		json.Marshal方法返回两个值
		第一个值： sByte  是一个 []byte 对象（将结构体转化出来的数据）
		第二个值： err    json.Marshal转化失败，通过err接收
	*/
	sByte, err := json.Marshal(s)
	if err != nil {
		fmt.Println("json.Marshal err, ", err)
	}
	// 将string(sByte)类型转换为 string类型
	fmt.Println(string(sByte))
	/*
		结构体数据：main.Student main.Student{ID:1, Name:"zhangsan", Age:24, Address:"bj"}
		json数据：{"ID":1,"Name":"zhangsan","Age":24,"Address":"bj"}

	*/
}
```

### 🔨 反序列化：将json字符串转换成struct对象

结构体的作用有两个
1. 绑定方法和接收者，然后通过结构体调用方法（类方法）
2. 可以和json字符串进行相互转

<Badge>序列化： 将struct对象转换成 json的string格式</Badge>

<Badge>反序列化：将一个json字符串转换成struct对象</Badge>

```go
func main() {
	//// 2、反序列化：结构体对应的json字符串数据(string)
	//// 当字符串 本身有双引号，或者 多行的时候使用 ``
	s := `{"ID":1,"Name":"zhangsan","Age":24,"Address":"bj"}`

	// 3、将json字符串转换为struct结构体
	var stu Student
	// 将string类型的数据转换为一个 []byte类型数据
	byteS := []byte(s)
	err := json.Unmarshal(byteS, &stu)
	if err != nil {
		fmt.Println("json.Unmarshal err, ", err)
	}
	//// %#v 是将数据展开
	//fmt.Printf("%T %#v \n", stu, stu)
	//fmt.Println(stu.Name, stu.Address)

	//// 4、结构体嵌套
	//p := Person{
	//	Id: 1,
	//	Stu: []Student{
	//		{ID: 1, Name: "zs", Age: 24, Address: "bj"},
	//		{ID: 2, Name: "lisi", Age: 24, Address: "bj"},
	//		{ID: 3, Name: "wangwu", Age: 24, Address: "bj"},
	//	},
	//}
	//
	//s, _ := json.Marshal(p.Stu)
	//fmt.Println(string(s))
}

type Person struct {
	Id  int
	Stu []Student
}

// 1、定义结构体
type Student struct {
	ID      int
	Name    string
	Age     int
	Address string
}
```







