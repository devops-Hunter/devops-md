---
title: 处理容器数据磁盘被写满
order: 4
nav:
  title: Kubernetes
  path: /kubernetes
  order: 1
---

# 处理容器数据磁盘被写满

## 📋 问题现象

- `node.kubernetes.io/disk-pressure=:NoSchedule`
- 不能创建 Pod (一直 ContainerCreating)
- 不能删除 Pod (一直 Terminating
- 无法 exec 到容器

<Badge>判断是否被写满:</Badge>
**容器数据目录大多会单独挂数据盘，路径一般是 /var/lib/docker，也可能是 /data/docker 或 /opt/docker，取决于节点被添加时的配置**

可通过`docker info`确定：

```bash
$ docker info
...
Docker Root Dir: /var/lib/docker
...
```

如果没有单独挂数据盘，则会使用系统盘存储。判断是否被写满:

```bash
$ df
Filesystem     1K-blocks     Used Available Use% Mounted on
...
/dev/vda1       51474044  4619112  44233548  10% /
...
/dev/vdb        20511356 20511356         0 100% /var/lib/docker

```

## 🔨 解决方法

<Badge>重启 dockerd (清理容器日志输出和可写层文件)</Badge>

- **重启前需要稍微腾出一点空间，不然重启 docker 会失败，可以手动删除一些 docker 的 log 文件或可写层文件，通常删除 log:**

```bash
cd /var/lib/docker/containers
du -sh * # 找到比较大的目录
cd dda02c9a7491fa797ab730c1568ba06cba74cecd4e4a82e9d90d00fa11de743c
cat /dev/null > dda02c9a7491fa797ab730c1568ba06cba74cecd4e4a82e9d90d00fa11de743c-json.log.9 # 删除log文件
```

### **注意: 使用 `cat /dev/null >`方式删除而不用 `rm`，因为用 `rm` 删除的文件，docker 进程可能不会释放文件，空间也就不会释放；log 的后缀数字越大表示越久远，先删除旧日志。**

- **将该 node 标记不可调度，并将其已有的 pod 驱逐到其它节点，这样重启 dockerd 就会让该节点的 pod 对应的容器删掉，容器相关的日志(标准输出)与容器内产生的数据文件(可写层)也会被清理**

```bash

kubectl drain 10.179.80.31

```

- **重启 dockerd:**

```bash

systemctl restart dockerd

```

- **取消不可调度的标记:**

```bash
kubectl uncordon 10.179.80.31

```

## 🔨 定位根因，彻底解决

### 问题定位方法见附录，这里列举根因对应的解决方法：

- 日志输出量大导致磁盘写满:
  - 减少日志输出
  - 增大磁盘空间
  - 减小单机可调度的 pod 数量
- 可写层量大导致磁盘写满: 优化程序逻辑，不写文件到容器内或控制写入文件的大小与数量
- 镜像占用空间大导致磁盘写满:
  - 增大磁盘空间
  - 删除不需要的镜像

## 📋 附录

<Badge>查看 docker 的磁盘空间占用情况</Badge>

```bash
docker system df -v

```

<Badge>定位容器写满磁盘的原因</Badge>
**进入容器数据目录(假设是 /var/lib/docker，并且存储驱动是 OverlayFS):**

```bash
cd /var/lib/docker
du -sh *
```
