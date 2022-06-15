---
title: Gin（Gin框架）
order: 7
nav:
  title: Golang
  path: /Golang
  order: 7
---

# 🏷 Gin框架

## 📋 框架结构
<Alert type="info">
常用包和Gin框架
</Alert>

```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
	//"github.com/gin-gonic/gin"
)

func main() {
	// 1、创建路由engine
	// r就是 *Engine 结构体
	r := gin.Default()
	// 2、路由绑定
	/*
		"/" 路由
		func(c *gin.Context)  处理函数
	*/
	r.GET("/", func(c *gin.Context) {
		// 第一：解析get/post请求的参数
		// 第二：根据参数去查询数据库（操作数据库：添加数据、删除数据）
		// 第三：返回从数据库查询的数据
		c.String(200, "hello world")
	})
	fmt.Println("http://127.0.0.1:8000")
	// 3、启动监听端口
	// 对 net/http服务的封装，替换了 http.ListenAndServe(address, engine)
	r.Run(":8000")
}


```


## 📋 路由


```go
package main

import (
	"fmt"
	"github.com/gin-gonic/gin"
)

/*
http请求两块
第一：路由
第二：处理函数
	- 获取get请求或者post 请求的参数（gin第一步）
	（根据参数去查询数据库）
	- 从数据库查询并返回数据
*/

func main() {
	// 1、生成engine
	r := gin.Default()

	// 2、注册路由
	//r.GET("/hello", func(c *gin.Context) {
	//	c.String(200, "hello")
	//})
	// 2.1 无参路由
	r.GET("/hello", HelloHandler)

	// 2.2 API路由： http://127.0.0.1:8000/book/18
	// :id 使用 id来获取 18这是值
	r.GET("/book/:id", GetBookDeatilHandler)

	// 3.3 url传参： http://127.0.0.1/user?id=20&name=zhangsan
	r.GET("/user", GetUserDetailHandler)

	// 3.4 shouldBind绑定(解析post请求中复杂的json数据)
	r.POST("/login/", LoginHandler)

	r.Run(":8000")
}

// 把handler处理函数拿出来
func HelloHandler(c *gin.Context) {
	c.String(200, "hello")
}

func GetBookDeatilHandler(c *gin.Context) {
	//bookId := c.Param("id1")
	// 这里 c.Param("id") 这个id一定要和路由中 :id完全一致
	bookId := c.Param("id")
	fmt.Println(bookId, "____>")
	c.String(200, "API params")
}

func GetUserDetailHandler(c *gin.Context) {
	// 1、获取值，如果没有为 nil
	name := c.Query("name")
	// 2、获取值，如果没有使用默认值
	/*
		name : key
		default val : 如果没传入参数，就是用默认值
	*/
	name2 := c.DefaultQuery("name", "default val")
	fmt.Println("获取的用户名---》", name, name2)
	c.String(200, "URL params")
}

type Login struct {
	// post请求的数据字段名一定要和 `json:"username" 一模一样
	// binding:"required" 要求username字段不能为空
	Username string `json:"username" binding:"required"`
	//Username string `json:"username"`
	Password string `json:"password"`
}

// 第四种：shouldBind方法获取json中复杂数据，并且可以对参数进行校验
func LoginHandler(c *gin.Context) {
	var login Login
	//  c.ShouldBind(&login) 方法必须要传入一个结构体对象
	// 将 net/http中的 r.Body数据解析到 Login的结构体中
	// c.ShouldBind(&login) => json.Unmarshal(bodyContent, &d)
	if err := c.ShouldBind(&login); err != nil {
		fmt.Println(err)
		c.String(200, "参数校验错误")
	}
	fmt.Println(login.Username, login.Password)
	c.String(200, "success")
}


```

## 📋 传参方式&如何返回数据

```go
package main

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"time"
)

/*
第一：路由的四种写法
第二：获取路由传参的方式以及获取post请求的数据
？连接数据库查询
第三：如何返回数据 返回json、返回string数据
*/

func main() {
	r := gin.Default()
	r.GET("/response", ResponseHandler)
	r.GET("/response/json", ResponseJsonHandler)
	r.GET("/response/redirect", ResponseRedirectHandler)
	r.Run(":8000")
}

// 1、响应一个普通的String字符串
func ResponseHandler(c *gin.Context) {
	c.String(200, "响应一个string字符串")
}

// 2、返回一个json数据（最常用）
func ResponseJsonHandler(c *gin.Context) {
	//type Data struct {
	//	Msg  string `json:"msg"`
	//	Code int    `json:"code"`
	//}
	//// 从数据库查到的数据
	//d := Data{
	//	Msg:  "Success",
	//	Code: 1001,
	//}
	//c.JSON(200, d)
	c.JSON(200, gin.H{
		"msg":  "success",
		"code": 1001,
	})
}

// 3、路由重定向(基本不怎么用)
func ResponseRedirectHandler(c *gin.Context) {
	time.Sleep(time.Second * 3)
	c.Redirect(http.StatusMovedPermanently, "https://www.baidu.com")
}

```
