---
title: Http（net/http模块）
order: 6
nav:
  title: Golang
  path: /Golang
  order: 6
---

# 🏷 net/http模块

## 📋 interface
<Alert type="info">
使用net/http模块，开发一个简单的web server
</Alert>

```go
package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
)

/*
使用net/http模块，开发一个简单的web server
	1、提供get请求 
	2、提供post请求
http: 协议（和web服务器进行交互的规范，规则）
	Get： 从数据库读取数据，比如 查询订单
		- get请求参数是从url上直接读取（一般数据都比较少）
	Post： 创建新的数据，163购买票（在数据库会添加一条数据，购票记录）
		- 从http的body中获取的数据
	Put：  修改数据，更新支付宝上的用户信息（修改我的手机号）
	Delete： 删除数据库中数据
*/

/*
开发一个web服务器主要的步骤
第一步：路由
第二步：处理函数
	- 解析请求的数据（获取某一个商品，你需要把商品Id信息携带给后端）
		- 根据请求数据参数查询数据库
	- 响应数据（把从数据库读取的数据，给返回给浏览器或者请求方）
*/
func main() {
	//第一步：路由
	// http://127.0.0.1:8005 /req/get ?name=zhangsan
	http.HandleFunc("/req/get", dealGetHandler)
	/*
		"/req/get": 路由URL除去域名的哪一块（http://www.example.com /book/1/）
		dealGetHandler： 处理函数（处理服务请求）
	*/
	http.HandleFunc("/req/post", dealPostHandler) // POST

	fmt.Println("http://127.0.0.1:8005/req/get")
	// 第三步：启动服务
	http.ListenAndServe(":8005", nil)
	/*
		addr: 当前server监听的端口号和ip
		handler：处理函数
	*/
}

// 处理函数的名字用驼峰命名： xxxHandler函数名
// 第二步：处理函数（处理get请求）
/*
- 1)解析请求的数据（获取某一个商品，你需要把商品Id信息携带给后端）
	http.Request：解析url中的数据或者post请求中body的数据
- 2)响应数据（把从数据库读取的数据，给返回给浏览器或者请求方）
	http.ResponseWriter: 本质是一个interface接口，定义三个方法，进行返回数据
*/
func dealGetHandler(w http.ResponseWriter, r *http.Request) {
	//1)解析请求的数据
	query := r.URL.Query() // 返回  map[string][]string
	// 1.1 通过字典下标取get路由参数
	if len(query["name"]) > 0 {
		names := query["name"][0]
		fmt.Println("字典下标取值", names)
	}
	// 1.2 通过Get方法取值
	name2 := query.Get("name")
	fmt.Println("通过get方法取值", name2)
	fmt.Println(query)

	//2)响应数据
	//// 2.1 返回一个简单字符串
	//w.Write([]byte("hello world!"))
	// 2.2 返回一个json数据
	// 加上我们拿到了 name=zhangsan，我们到数据库取出了zhangsan用户的信息
	type Info struct {
		Name     string
		Password string
		Age      int
	}
	// 假设这是从数据库中取出
	u := Info{
		Name:     name2,
		Password: "123456",
		Age:      24,
	}
	json.NewEncoder(w).Encode(u)
}

type Info struct {
	Name     string `json:"name"`
	Password string `json:"password"`
}

// 和get请求是一模一样的写法,这是一个post请求
func dealPostHandler(w http.ResponseWriter, r *http.Request) {
	// r  *http.Request是结构的对象
	// r.URL.query()从url取请求参数
	// post请求从http的body中获取数据
	// r.Body是结构体 Request 中的字段 r.body 其实是*http.Request.body
	bodyContent, _ := ioutil.ReadAll(r.Body) // 返回的是一个byte
	//fmt.Printf("%T %v", bodyContent, bodyContent)
	// 获取string
	//strData := string(bodyContent)
	// 如何才能解析这个string字符串（str转结构体）
	var d Info
	//json.Unmarshal([]byte(strData), &d)
	json.Unmarshal(bodyContent, &d)
	fmt.Println("获取的数据name:", d.Name)
	fmt.Println(d)
	w.Write([]byte("hello world Post"))
}

```