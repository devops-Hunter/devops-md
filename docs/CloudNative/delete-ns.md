---
title: 删除处于Terminating状态的NAMESPACE
order: 2
nav:
  title: 云原生
  path: /cloudNative
  order: 1
group:
  title: 疑难杂症
---

# 删除处于 Terminating 状态的 Namespace

## 📋 问题现象

尝试删除 Kubernetes 命名空间后，长时间停留在`Terminating`状态。

`kubectl delete ns <namespacename>`
`kubectl describe ns <namespacename>`

```yaml

---
Status: Terminating
```

## 🏷 可能原因

通常是因为从集群中删除的这些**namespace**下存在资源。

## 🔨 解决方案

删除命名空间的 finalizers。
该选项将会快速清除处于终止状态的 namespace，但可能会导致属于该 namespace 的资源留在集群中，因为无法自动删除它们。在 finalizers 数组为空并且状态为终止之后，Kubernetes 将删除命名空间。

- **打开 任意 Node 节点 终端，为您的 Kubernetes 集群创建一个反向代理。**
  `kubectl proxy`

```bash
Starting to serve on 127.0.0.1:8001
```

- **打开另一个终端，获取 Namespace 定义的内容**

`kubectl get namespace kubesphere-system -o json > kubesphere-system.json`

- **将 finalizers 数组置为空，并重新保存文件。**

```yaml
    "spec": {
        "finalizers": [
        ]
    },
```

- **执行以下命令去除 finalizers**
  `curl -X PUT --data-binary @kubesphere-system.json http://localhost:8001/api/v1/namespaces/kubesphere-system/finalize -H "Content-Type: application/json" --header "Authorization: Bearer $TOKEN" --insecure`

# 🔨 删除处于 Terminating 状态的其他资源（pod 等）

=============

## <Badge>以删除 pod 为例</Badge>

强制删除`--force --grace-period=0`

`kubectl -n $namespace delete pod $pod --force --grace-period=0`
