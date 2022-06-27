---
title: Kustomize云原生配置管理
order: 5
nav:
  title: CiCd
  path: /cicd
  order: 5
---

# Kustomize云原生配置管理

## ①概览&安装
### kustomize 解决了什么痛点
- kustomize 通过 Base & Overlays 方式维护不同环境的应用配置
- kustomize 使用 patch 方式复用 Base 配置，并在 Overlay 描述与 Base 应用配置的差异部分来实现资源复用
- kustomize 管理的都是 Kubernetes 原生 YAML 文件，不需要额外学习类似helm的DLS语法

### 安装
```bash
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"  | bash
```
详见 https://kubectl.docs.kubernetes.io/installation/kustomize/

### 常用命令

查看包含 kustomization 文件的目录中的资源
```bash
kubectl kustomize <kustomization_directory>
#举例
kubectl kustomize overlays/prod
```
                              
应用这些资源
```bash
#使用参数 --kustomize 或 -k
kubectl apply -k <kustomization_directory
```


## ②结构



