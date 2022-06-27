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









