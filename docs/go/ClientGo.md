---
title: Client-go（k8s插件）
order: 1 
nav:
  title: Golang
  path: /Golang
  order: 8
group:
  title: k8s
---

# 🏷 Client-go

## 📋 Client-go简单引用

:::info{title=info}
常用方法
:::

```go
package main

import (
	"context"
	"fmt"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/tools/clientcmd"
)

func main () {
	//将kubeconfig文件转换成rest.config类型的对象
	conf, err := clientcmd.BuildConfigFromFlags("", "/home/{USER}/.kube/config")
	if err != nil {
		panic(err)
	}
	//根据rest.config类型的对象，new一个clientset出来
	clientset,err := kubernetes.NewForConfig(conf)
	if err != nil {
		panic(err)
	}
	//使用clientset获取pod列表
	podList, err := clientset.CoreV1().Pods("default").
		List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		panic(err)
	}
	for _, pod := range podList.Items {
		fmt.Println(pod.Name,pod.Namespace)
	}
}
```
