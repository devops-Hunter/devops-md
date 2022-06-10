---
title: Go（概览）
order: 3
nav:
  title: Golang
  path: /Golang
  order: 3
---

# Golang 目录结构

### 个人项目

![image.png](http://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/image-d8d8801ad1904ddea72736f9df8614d1.png)

### 公司项目

![image.png](http://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/image-a70f913e56f144778377f0c74eddad52.png)

# 包的概念

1. 和 python ⼀样，把相同功能的代码放到⼀个⽬录，称之为包
2. 包可以被其他包引⽤用
3. main 包是用来生成可执行⽂件，每个程序只有⼀个 main 包
4. 包的主要⽤途是提高代码的可复用性

# Go 命令

- go run 快速执⾏ go ⽂件，就像执行脚本⼀样
- go build 编译程序，⽣成⼆进制可执⾏⽂件
- go install 安装可执⾏⽂件到 bin 目录
- go test 执⾏单元测试或压⼒测试
- go env 显示 go 相关的环境变量
- go fmt 格式化源代码

# Go 程序结构

- go 源码按 package 进行组织，并且 package 要放到⾮注释的第⼀⾏
- ⼀个可执⾏程序只有一个 main 包和⼀个 main 函数
- main 函数是程序的执行入⼝

## 注释

- 单⾏注释 //
- 多⾏注释 /\* \*/

## Go 垃圾回收机制

- 内存⾃动回收，再也不需要开发⼈员管理内存
- 开发⼈员专注业务实现，降低了⼼智负担
- 只需要 new 分配内存，不需要释放

## 天然并发

- 从语⾔层面支持并发，非常简单。只需要 go 一下
- goroutine，轻量级线程，创建成千上万个 goroute 成为可能

```go
func calc() {
   //⼤量计算 
}
func main() {
   go calc() 
}
```

## channel

- 管道，类似 unix/linux 中的 pipe
- 多个 goroute 之间通过 channel 进⾏通信
- ⽀持任何类型

## 多返回值

- 一个函数返回多个值

## 编译型语言

- 性能只⽐ C 语⾔差 10%
- 开发效率和 python、php 差不多
