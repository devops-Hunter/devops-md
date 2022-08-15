---
title: Kubernetes小课堂
order: 1
nav:
  title: Kubernetes
  path: /kubernetes
  order: 1
---

# 📦课堂大纲



## 📋入门扯蛋篇

- 容器技术从“初出茅庐”到“尘埃落定”的过程闲聊

- 梳理容器技术生态的发展脉络

- Kubernetes为什么赢了？

- 抽象的描述容器底层技术的实现方式


## 🔨集群的搭建与实践

- 每个组件的作用,明白架构原理

- 使用工具（kubeadmin，kubekey等） `一键安装`

- 简单的应用部署


## 📋容器编排！！！

- 分布式系统设计的特性

- Kubernetes 核心特性剖析----`编排、调度和作业管理`

- Pod，Deploy，STS，Cronjob，声明式API等。。

- 存储pv，pvc，sc

- 容器网络（svc，Ingress，Dns等）

- 调度器，调度策略

- 容器运行时

- 实践课程（完成一个项目demo）`对标CKA`


## 📋云原生周边生态

- 监控偷拍k8s（prometheus）

- 让日志无处可逃！（fluentd，filebeat，elk，loki）

- 应用管理（helm，kustomize）

- cicd的演进（gitops为什么流行？tekton+argocd实践）

- ingress网关kong等

## 📋进阶



- 用go编写一个简单的kubectl客户端插件`kubectl tail {DeploymentName}`（获取deployment日志）


- Client-go获取k8s资源


- Operator，CRD编写

- service Mesh（Istio，k8s为什么还需要一层网格）

- 未完待续。。。