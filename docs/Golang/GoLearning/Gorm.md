---
title: Gorm（指南）
order: 9
nav:
  title: Golang
  path: /Golang
  order: 9
---

# 🏷 Gorm

## 📋 Gorm特性
<Alert type="info">
官方文档：https://gorm.io/zh_CN/docs/index.html
</Alert>

- 全功能 ORM
- 关联 (Has One，Has Many，Belongs To，Many To Many，多态，单表继承)
- Create，Save，Update，Delete，Find 中钩子方法
- 支持 Preload、Joins 的预加载
- 事务，嵌套事务，Save Point，Rollback To Saved Point
- Context、预编译模式、DryRun 模式
- 批量插入，FindInBatches，Find/Create with Map，使用 SQL 表达式、Context Valuer 进行 CRUD
- SQL 构建器，Upsert，数据库锁，Optimizer/Index/Comment Hint，命名参数，子查询
- 复合主键，索引，约束
- Auto Migration
- 自定义 Logger
- 灵活的可扩展插件 API：Database Resolver（多数据库，读写分离）、Prometheus…
- 每个特性都经过了测试的重重考验
- 开发者友好

## 📋 Gorm快速入门

### 🔨安装

```bash
go get -u gorm.io/gorm
go get -u gorm.io/driver/sqlite
```

### 🔨创建数据库连接（mysql）

```go
package main
import ( 
	"fmt" "gorm.io/driver/mysql" 
	"gorm.io/gorm" 
)
func main() {
	dsn := "root:1@tcp(127.0.0.1:3306)/test_db?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println(db) // &{0xc00018a630 <nil> 0 0xc000198380 1}
```

### 🔨自动创建表

```go
package main
import ( 
	"fmt" "gorm.io/driver/mysql" 
	"gorm.io/gorm" 
)

// User 表的结构体ORM映射
type User struct {
	Id int64 `gorm:"primary_key" json:"id"`
	Username string
	Password string
}

func main() {
	// 1、连接数据库
	dsn := "root:1@tcp(127.0.0.1:3306)/test_db?charset=utf8mb4&parseTime=True&loc=Local"
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		fmt.Println(err)
	}
	// 2、自动创建表
	db.AutoMigrate(
		User{},
	)
}
```



### 🔨增删改查

```go
package mysql

import (
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)


func main() {
	//配置MYSQL连接参数
	username := "root"
	password := "123456"
	host := ""
	port := 3306
	Dbname := "book" //库名
	timeout := "10s" //连接超时

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8&parseTime=True&loc=Local&timeout=%s",
		username, password, host, port, Dbname, timeout)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("连接数据库失败, error=" + err.Error() )
	}
	/*自动创建表结构
	db.AutoMigrate(User{},)
	 */

	//增
	db.Create(&User{
		Username: "hunter",
		Password: "123456",
	})

	//改：修改表的某一个字段
	db.Model(User{
		Id: 1,
	}).Update("password", "111111")

	//查，过滤单体数据:First
	u := User{Id: 1}
	db.First(&u)
	fmt.Printf("%#v", u)
	//查询所有数据
	users := []User{} //定义一个User结构体的切片来接收
	db.Find(&users)
	fmt.Printf("%#v \n", users)

	//删,根据主键删除
	db.Delete(&User{Id: 1})
	//条件删除
	db.Where("username = ?", "hunter").Delete(&User{})



}

//定义表结构（模型定义）
type User struct {
	// gorm:"primary_key" 标记当前这个Id是自增的
	Id        int64 `json:"id" gorm:"primary_key"`
	Username  string
	Password string
}
```



### 🔨常见数据类型

```go
type User struct {
	// gorm:"primary_key" (主键)标记当前这个Id是自增的
	Id             int64 `json:"id" gorm:"primary_key"`
	Username       string	//默认字符串对应的是数据库的text文本类型
	Password       string
	CreatedAt      *time.Time `json:"createdAt" gorm:"column:create_at"`
	Email          string     `gorm:"type:varchar(100);unique_index"`  // unique_index为该列设置唯一索引
	Role           string     `gorm:"size:255"`  //设置字段的大小为255个字节
	MemberNumber   *string    `gorm:"unique:not null"` // unique:not null设置该字段唯一且不为空
	Num            int        `gorm:"AUTO_INCREMENT"`
	Address        string	  `gorm:"index":addr`
	IgnoreMe       int        `gorm:"-"`   // 忽略字段
}
```

### 🔨一对多关系

#### 一对多结构
```go
type User struct {
	gorm.Model
	//foreignkey:UserRefer 可以自己指定外键关联字段名为：UserRefer
	//默认外键字段名是UserId（所有者类型+它的主键）
	Cards []CreditCard
}
type CreditCard struct {
	gorm.Model
	Number string
	UserRefer uint
}
```
<Alert type="info">
gorm.Model的定义
</Alert>

```go
type Model struct {
	ID          uint            `gorm:"primaryKey"`
	CreatedAt   time.Time
    UpdatedAt   time.Time
    DeletedAt   gorm.DeletedAt  `gorm:"index"`
}

```

#### 一对多建立关联关系
```go
type User struct {
	gorm.Model
	Username string `json:"username" gorm:"colume:username"`
	//添加外键关联
	CreditCards []CreditCard
}
type CreditCard struct {
	gorm.Model
	Number string
	UserID uint  //外键名：结构体+主键
}

func main {
//创建表结构
db.AutoMigrate(User{}, CreditCard{})

//创建一对多
user := User{
	Username: "hunter",
	CreditCards: []CreditCard{
		{Number: "0001"},
		{Number: "0002"},
},
}
//为已存在的用户添加数据
u := User{Username: "xiaohei"}
db.First(&u)
db.Model(&u).Association("CreditCards").Append([]CreditCard{
	{Number: "0003"},
})

}
```


#### 建立关联查询

```go
func main {
 	//查询关联表数据
 	/*
 	①使用“Association”方法,需要把"user"查询号
 	②然后根据"User"定义中指定的“AssociationForeignKey”去查找"CreditCard"
 	*/

	u := User{Username: "hunter"}
	db.First(&u) //查询单条数
	fmt.Printf("v",u.Username)

	/*
	Association("CreditCards") 管理外键的字段名
	Fina(&u.CreditCards)       []CreditCard
	*/
	// 根据AssociationForeignKey外键字段进行查找
	err := db.Model(&u).Association("CreditCards").Find(&u.CreatedCards)
	if err != nil {
		fmt.Println("err", err)
	}
	fmt.Println(u)
	strUser, _ := json.Marshal(&u)
	fmt.Println(string(strUser))
}	
```






