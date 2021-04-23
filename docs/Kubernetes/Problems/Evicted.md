---
title: 删除处于Terminating状态的NAMESPACE
order: 3
nav:
  title: Kubernetes
  path: /kubernetes
  order: 1
---

# 工作负载异常：实例驱逐异常（Evicted）

## 📋 问题现象

**_若节点故障时，实例未被驱逐，请先按照如下方法进行问题定位。_**

使用如下命令发现很多 pod 的状态为 Evicted：
`kubectl get pods`
在节点的 kubelet 日志中会记录 Evicted 相关内容，搜索方法可参考如下命令：
`cat /var/paas/sys/log/kubernetes/kubelet.log | grep -i Evicted -C3`

## 排查思路

### <Badge>排查项一：是否在实例上设置了 tolerations</Badge>

通过 kubectl 工具或单击对应工作负载后的“更多 > 查看 YAML”，检查工作负载上是不是打上了`tolerations`

### <Badge>排查项二：是否满足停止驱逐实例的条件</Badge>

若属于小规格的集群（集群节点数小于 50 个节点），如果故障的节点大于总节点数的`55%`，实例的驱逐将会被暂停。此情况下 k8s 将部署尝试驱逐故障节点的工作负载

### <Badge>排查项三：容器与节点上的“资源分配量”是否一致</Badge>

容器被驱逐后还会频繁调度到原节点。节点驱逐容器是根据节点的“资源使用率”进行判断；容器的调度规则是根据节点上的“资源分配量”进行判断。由于判断标准不同，所以可能会出现被驱逐后又再次被调度到原节点的情况。

### <Badge>排查项四：工作负载实例不断失败并重新部署</Badge>

pod 驱逐后，如果新调度到的节点也有驱逐情况，就会再次被驱逐；甚至出现 pod 不断被驱逐的情况。

如果是由 kube-controller-manager 触发的驱逐，会留下一个状态为 Terminating 的 pod；直到容器所在节点状态恢复后，pod 才会自动删除。如果节点已经删除或者其他原因导致的无法恢复，可以使用“强制删除”删除 pod。

如果是由 kubelet 触发的驱逐，会留下一个状态为 Evicted 的 pod，此 pod 只是方便后期定位的记录，可以直接删除。

#### 🔨 使用如下命令删除旧驱赶的遗留：

`kubectl get pods | grep Evicted | awk '{print $1}' | xargs kubectl delete pod`
