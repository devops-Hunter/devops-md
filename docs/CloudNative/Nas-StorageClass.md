---
title: 创建基于阿里云NAS的StorageClass（ACK）
order: 1 
nav:
  title: 云原生
  path: /cloudNative
  order: 1
group:
  title: 阿里云ACK
---

# 本方案实现的动态 NAS 卷，是在某个 NAS 文件系统下通过创建子目录并把子目录映射为一个动态 PV 提供给应用。

首先需要区分 ACK 的存储插件类型：`Flexvolume`, `CSI`

## Flexvolume

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: alicloud-nas
mountOptions:
  - nolock,tcp,noresvport
  - vers=3
parameters:
  server: '23a9649583-iaq37.cn-shenzhen.nas.aliyuncs.com:/nasroot1/'
  driver: flexvolume
provisioner: alicloud/nas
reclaimPolicy: Delete
```

### 说明

- mountOptions：表示生成的 PV options 配置，挂载 NAS 卷时使用这个 options 挂载。
- server：表示生成目标 PV 所使用 NAS 挂载点列表。格式为 nfsurl1:/path1,nfsurl2:/path2；当配置多个 server 时，通过此 StorageClass 创建的 PV 会轮询使用上述 server 作为配置参数；~~极速 NAS 配置路径需要以/share 开头~~。
- driver：支持 Flexvolume、NFS 两种驱动，默认为 NFS。
- reclaimPolicy：PV 的回收策略，建议配置为 Retain。
  当配置为 Delete 时，删除 PV 后 NAS 文件系统中的对应目录会默认修改名字（例如，path-name 会被修改为 archived-path-name）。
  -- **如果需要删除文件系统中对应的存储目录，可在 StorageClass 中配置 archiveOnDelete 为 false。**

## CSI

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: alicloud-nas-subpath
mountOptions:
  - nolock,tcp,noresvport
  - vers=3
parameters:
  volumeAs: subpath
  server: 'xxxxxxx.cn-hangzhou.nas.aliyuncs.com:/k8s/'
provisioner: nasplugin.csi.alibabacloud.com
reclaimPolicy: Retain
```

### 说明

NAS 存储卷的 xxxxxxx.cn-hangzhou.nas.aliyuncs.com:/share/nas-79438493-f3e0-11e9-bbe5-00163e09c2be 会同时挂载到 deployment-nas-1-5b5cdb85f6-nhklx 和 deployment-nas-2-c5bb4746c-4jw5l/data 目录下。其中：

- /share：StorageClass 中指定的 subpath。
- nas-79438493-f3e0-11e9-bbe5-00163e09c2be：PV 的名称。
  如果您需要为不同的 Pod 挂载同一个 NAS 文件系统的不同子目录， 则需要分别创建 pvc-1 和 nginx-1 以及 pvc-2 和 nginx-2。
