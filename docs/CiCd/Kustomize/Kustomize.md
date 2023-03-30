---
title: Kustomize云原生配置管理
order: 5
nav:
  title: CiCd
  path: /cicd
  order: 5
---

## Kustomize 简介

[Kustomize](https://github.com/kubernetes-sigs/kustomize) 是一种 Kubernetes 配置转换工具，它的作用是对描述 Kubernetes 资源的 YAML 文件进行定制化操作，产生新的 YAML （同时原有的 YAML 文件不会有任何变化）。Kustomize 的一个重要特性是不使用模板，而是直接工作在原始的 YAML 文件之上，还可以根据其他表示法生成 ConfigMap 和 Secret 等资源。


![image.png](https://docs.devopsn.com/images/docs/devops/cicd/kustomize/1.png)``

### 
  kustomize 解决了什么痛点

1. **kustomize 通过 Base & Overlays 方式可以管理多个环境的资源配置**
2. **资源配置可以复用**
3. **kustomize 管理的都是 Kubernetes 原生 YAML 文件，不需要掌握类似helm的模板语法。**
4. **集成在 kubectl 中，可以在命令行界面中以原生方式运行。不需要安装额外的工具就可以进行定制化操作**

### 一键安装（kubectl 1.20之后属于内嵌不需要安装）

`curl -s "[https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh"](https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh")  | bash`
详见 [https://kubectl.docs.kubernetes.io/installation/kustomize/](https://kubectl.docs.kubernetes.io/installation/kustomize/)

### 常用命令

查看包含 kustomization 文件的目录中的资源

```shell
kubectl kustomize <kustomization_directory>
#举例
kubectl kustomize overlays/prod
```

应用这些资源

```shell
#使用参数 --kustomize 或 -k
kubectl apply -k <kustomization_directory
```

## Kustomize 理解与使用

### ①项目初始化格式

![image.png](https://docs.devopsn.com/images/docs/devops/cicd/kustomize/2.png)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myngx
spec:
  selector:
    matchLabels:
      app: myngx
  replicas: 1
  template:
    metadata:
      labels:
        app: myngx
    spec:
      containers:
      - name: ngx1
        image: nginx:1.18-alpine
        imagePullPolicy: IfNotPresent
        ports:
          - containerPort: 80 
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: myngx-svc
spec:
  ports:
    - port: 80
      targetPort: 80
  selector:
    app: myngx
```

**初始化渲染**

```yaml
#渲染命令
kubectl kustomize

#以下为输出
- - - 
apiVersion: v1
kind: Service
metadata:
  name: myngx-svc
spec:
  ports:
  - port: 80
    targetPort: 80
  selector:
    app: myngx
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myngx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: myngx
  template:
    metadata:
      labels:
        app: myngx
    spec:
      containers:
      - image: nginx:1.18-alpine
        imagePullPolicy: IfNotPresent
        name: ngx1
        ports:
        - containerPort: 80
```

### ②抽取公共部分示例

**配置kustomization文件**

```yaml
#公共部分
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

#生成统一namespace
namespace: default
#生成统一注释
commonAnnotations:
  myname: hunter
#生成统一镜像Tag
images:
  - name: nginx
    newTag: 1.19-alpine
resources:
  - service.yaml
  - deployment.yaml
```

**修改后渲染**
![image.png](https://docs.devopsn.com/images/docs/devops/cicd/kustomize/3.png)


### ③使用overlay创建多“环境”配置  

**创建overlays层下级目录用于区分环境（可自定义，dev，uat，prod。。。）**
![image.png](https://docs.devopsn.com/images/docs/devops/cicd/kustomize/4.png)

**vim overlays/prod/kustomization.yaml**

```yaml
# 生成生产环境namespace
namespace: prod
# 生成生产环境的前缀“prod-”
namePrefix: prod-
# 指向base主目录
bases:
  - ../../base
```

**渲染生产环境模板**
![image.png](https://docs.devopsn.com/images/docs/devops/cicd/kustomize/5.png)


### ③使用patch（补丁）修改原有配置

**层级关系如图所示：**
![image.png](https://docs.devopsn.com/images/docs/devops/cicd/kustomize/6.png)


**示例：配置生产环境副本数以及镜像版本**

```yaml
# 生成生产环境namespace
namespace: prod
# 生成生产环境的前缀“prod-”
namePrefix: prod-
# 指向base主目录
bases:
  - ../../base

# 指向同级生产配置目录的·yaml资源
patchesStrategicMerge:
  - replica.yaml
  - image.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myngx
spec:
  replicas: 2

```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myngx
spec:
  #需要保留层级关系，同时只保留要改动的字段
  template:
    spec:
      containers:
      #需要保留name: ngx1用来匹配原资源文件字段
      - name: ngx1
        image: nginx:1.20-alpine
```

**配置后的场景渲染**
![image.png](https://docs.devopsn.com/images/docs/devops/cicd/kustomize/7.png)


### ④使用patchesJson6902修改细颗粒度的值

**当需要修改的属性值为列表时，列如port。则需要使用patchesJson6902指定更改具体的值**
**（基于 **[https://tools.ietf.org/html/rfc6902](https://tools.ietf.org/html/rfc6902)** 规范实现）**

```yaml
# 生成生产环境namespace
namespace: prod
# 生成生产环境的前缀“prod-”
namePrefix: prod-
# 指向base主目录
bases:
  - ../../base

# 指向同级生产配置目录的·yaml资源
patchesStrategicMerge:
  - replica.yaml
  - image.yaml


patchesJson6902:
  # 指定对应的deployment文件
  - target:
      group: apps
      version: v1
      kind: Deployment
      name: myngx
    # 修改同级目录的port.yaml
    path: port.yaml
```

```yaml
#指定对应列表的port的值
- op: replace
  path: /spec/template/spec/containers/0/ports/0/containerPort
  value: 8080
```

**渲染效果**

![image.png](https://docs.devopsn.com/images/docs/devops/cicd/kustomize/8.png)



## 拓展章节


### 使用生成器：configmap生成

**官方文档：**
[https://kubectl.docs.kubernetes.io/zh/api-reference/kustomization/configmapgenerator/](https://kubectl.docs.kubernetes.io/zh/api-reference/kustomization/configmapgenerator/)

```yaml
...

configMapGenerator:
- name: myngx-config
  #将key，value传递到生成的configmap
  literals:
    - UserName=hunter
    - PassWord=Admin@123
```

**实际渲染效果**
![image.png](https://docs.devopsn.com/images/docs/devops/cicd/kustomize/9.png)



### 更多配置项

[https://kubectl.docs.kubernetes.io/references/kustomize/kustomization/](
