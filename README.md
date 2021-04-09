## Kubernetes 网络概览

📦 🔨

`文章转自https://sookocheff.com/post/kubernetes/understanding-kubernetes-networking-model/#kubernetes-basic，加上一些注释便于理解`

**Kubernetes 的四种网络**

1. Container-to-Container networking：容器到容器的网络
2. Pod-to-Pod networking：pod 到 pod 的网络
3. Pod-to-Service networking：pod 到 service 的网络
4. Internet-to-Service networking：internet 到 service 的网络

## 1. Container-to-Container networking

在这里讲解的容器到容器的网络，指得是同一个 pod 的容器之间的通讯。容器与容器之间的通讯直接使用 localhost

​ 如果之前了解过 kubernetes 应该都知道，在 kubernetes 里面最小单元是 pod。而每一个 pod 里面必须有 pause 容器。这个 pause 容器所负责的之一就是容器与容器之间通讯。
![image.png](http://81.68.156.197:8090/upload/2020/09/image-cff0125bf4b54c0e8488a3693f950136.png)
想要了解 pause 容器，就必须先知道 linux namespace。实际上 docker 所实现的虚拟化服务就是建立在 namespace 之上的。docker 所使用的隔离就是 namespace 的隔离。kubernetes 通过调整容器的 network namespace，实现同一个 pod 中容器间的相互通讯。

```
namespace 的小知识

1. linux 中提供了7中namespace（network namespace是其中之一），namespace之间相互隔离。

2. linux 启动的时候会分配一个root namespace。可以通过命令ll /proc/$$/ns查看当前所在的namespace

3. 在pid namespace里面可以创建子pid namespace，同时在父pid namespace可以看到子pid namespace的进程。

4. pid namespace的1号进程挂掉之后，该pid namespace其他进程将会kill,系统1号进程是不会被杀掉。

5. 1号进程（当前nameapace中pid 为1的进程）还有一个能力，就是能够接管孤儿进程，成为孤儿进程的父进程。这一点很重要，否则系统里就会出现非常多的僵死进程了。
```

在启动 pod 的时候，kubernetes 会最先启动 pause 容器，在 pause 容器中构建一个新的 network namespace，然后 kubernetes 会启动业务容器，将业务容器的 network namespace 设置为 pause 容器的 network namespace。这样所有的业务容器的通讯都是使用 pause 的 network namespace。
`在docker run 命令中使用 –name pause 设置容器名称，–net=container:pause设置容器的network namespace`

## 2.Pod-to-Pod networking

在 Kubernetes 中，每个 Pod 都有一个真实的 IP 地址，并且每个 Pod 使用该 IP 地址与其他 Pod 通信。当前的章节是了解 Kubernetes 如何使用真实 IP 启用 Pod 到 Pod 的通信，在这里我们先解决 Pod 是部署在集群中的同一物理节点。以避免通过内部网络进行跨节点通信的复杂性。

​ 从 Pod 的角度来看，它存在于自己的 network namespace（由 pause 建立） 中，该 namespace 需要与同一节点上的其他网络 namespace 进行通信。我们可以直接使用一对 veth—–由两个可以在多个 namespace 中分布的虚拟接口组成。

​ 要实现接 Pod namespace 之间的通讯，我们可以将一对 veth 的一侧分配给 root network namespace，另一侧分配给 Pod 的 network namespace。有多少个的 Pod 就有多少对 veth 设备。下图显示了将每个 Pod 连接到 root network namespace 的 veth 对（eth0-veth0 组成一对 veth 设备）。

![image.png](http://81.68.156.197:8090/upload/2020/09/image-1ded774217a643fda88e646f94ca9342.png)
​ 至此，我们已经将 Pod 设置了自己的 network namespace。同时他们认为自己具有自己的 eth0 设备和 IP 地址，并且它们已连接到 Node 的 root namespace。现在，我们希望 Pods 通过 root namespace 相互通信，为此，我们使用了 bridge（网桥）。如下图。
![image.png](http://81.68.156.197:8090/upload/2020/09/image-a0885df18e6b443fb7c4894225e52574.png)
Linux bridge 是一种虚拟的第 2 层网络设备，用于将两个或多个网段结合在一起。bridge 透明地将两个网络连接在一起。bridge 维护源和目的地之间转发表。bridge 通过检查转发表确定数据包的目的地并确定是否将数据包传递到连接到 bridge 的其他网段。 bridge 通过查看网络中每个以太网设备唯一的 MAC 地址来决定是桥接数据还是丢弃数据。

​ Bridge 实现 ARP 协议来发现 IP 地址和 MAC 地址，并关联 P 地址和 MAC 地址。当在 Bridge 处接收到数据帧时，Bridge 会将帧广播到所有连接的设备（原始发送方除外），并且将对帧进行响应的设备存储在查找表中。具有相同 IP 地址的将来流量将使用查找表来发现正确的 MAC 地址，以将数据包转发到该 MAC 地址。

### 2.1 同节点 Pod-to-Pod networking

给定将每个 Pod 隔离到其自己的网络堆栈的 network namespace，将每个 network namespace 连接到 root network namespace 的虚拟以太网设备。这样我们终于可以在同一节点上的 Pod 之间发送流量了。如下图所示。
![image.png](http://81.68.156.197:8090/upload/2020/09/image-eac94e6a215e41fe9aeed82838438d3b.png)
数据包流程

- Pod 1 将数据包发送到其自己的以太网设备 eth0，该设备可用作 Pod 的默认设备。
- 在 Pod 1，eth0 通过虚拟以太网设备连接到根名称空间 veth0 。
- Bridge 的 cbr0 器配置有 veth0 连接的网段。数据包到达网桥后，网桥解析正确的网络段，使用 ARP 协议发现 veth1。
- 将数据包发送至 veth1。当数据包到达虚拟设备时 veth1，它将直接转发到 Pod 2 的名称空间以及该名称空间中的 eth0 设备,至此完成数据的交互。

​ Kubernetes 的网络模型要求 Pod 必须通过其跨节点的 IP 地址才能访问。也就是说，一个 Pod 的 IP 地址始终对网络中的其他 Pod 可见，并且每个 Pod 都将自己的 IP 地址视为与其他 Pod 看到的 IP 地址相同。现在，我们转向在不同节点上的 Pod 之间路由流量的问题。

### 2.2 跨节点 Pod-to-Pod networking

在确定了如何在同一节点上的 Pod 之间路由数据包之后。我们继续进行路由，以在不同节点上的 Pod 之间路由数据包。Kubernetes 网络模型要求 Pod IP 在整个网络上都是可访问的，但是它没有指定必须如何完成。实际上，这是特定于网络的，但是 Kubernetes 已经建立了一些模式来简化此过程。

​ 通常，群集中的每个节点都分配有一个 CIDR 块（一个 ip 地址段，用于分配 pod 地址）。一旦发往 CIDR 块的流量到达节点，则节点有责任将流量转发到正确的 Pod。下图说明了两个节点之间的流量流，假设网络可以将 CIDR 块中的流量路由到正确的节点。
![image.png](http://81.68.156.197:8090/upload/2020/09/image-e40b8a42543b415ab21f881a0bddb1f7.png)

- 数据包首先通过 Pod 1 的 eth0 设备发送，该设备与 root namespace 中的 veth0 设备配对。最终，数据包最终到达 root namespace 的网络 bridge
- ARP 将在 bridge 上查询失败，因为没有任何设备连接到网桥，且该设备的数据包的 MAC 地址正确。失败时，网桥将数据包发送给 root network namespace 的 eth0 设备。此时，数据包离开节点并进入网络。
- 现在我们假设网络可以根据 CIDR 块将数据包路由到正确的节点
- 数据包进入目标节点的 root namespace（eth0 在 node 2 上），在此它通过 bridge 路由到正确的 veth
- 最后，通过数据流向 Pod4 的 network namespace

```
1.这段话省略的一个地方（就是上面第三步假设的处理）。我们常常说的网络插件（flannel，calico）。他们的作用就是帮助跨节点的pod与pod通讯。在上图中并没有标示出网络插件，是因为每一个插件的作用是不同的。

2.为了方便调用网络插件。kubernets使用CNI 标准（可以看作是网络的统一调用接口）。这样kubernets在调用的时候就不用关心底层是flannel还是calico。大家可以看看flannel和calico的实现方式有啥异同点

3.CNI配置/etc/cni/net.d/。网络插件地址/opt/cni/bin
```

## 3.Pod-to-Service Networking

`Service是kubernets资源类型之一，常用于负载均衡。`
​ 我们已经展示了如何在 Pod 与 pod 之间的通讯。到目前为止，这个方案非常有效，但事实往往是出人意料的。Pod IP 地址不是静态的。应用程序崩溃或节点重启后 ip 就不是原来的 ip 了。这些突发事件中的每一个都可以使 Pod IP 地址更改却不会发出警告。Kubernetes 中内置的 Service 就是用来解决此问题。

​ Kubernetes Service 管理一组 Pod 的状态。通过 Service，你可以监控一组 pod 的 ip 地址。Service 充当对一组 Pod 抽象，并为这组 Pod IP 地址分配一个虚拟 IP 地址。发送到 Service 的虚拟 IP 的所有流量都将被转发到与虚拟 IP 关联的 Pod 集。这允许该 service 内的 Pod 集的 ip 地址随时更改。客户端只需要记住 Service 的虚拟 IP 即可。

​ 创建新的 Kubernetes Service 时，将代表您创建一个新的虚拟 IP（也称为 cluster IP）。群集中任何地方，寻址到该 IP 的流量都将负载均衡到与该 Service 关联的一组支持 Pod。实际上，Kubernetes 会自动创建并维护一个分布式集群内负载均衡器，该负载均衡器会将流量分配给与服务相关联的健康 Pod。让我们仔细看看它是如何工作的。

### 3.1 netfilter and iptables

为了在集群中执行负载平衡，Kubernetes 依赖于 Linux 内置的网络框架 netfilter。Netfilter 是 Linux 提供的框架，它允许以自定义处理程序的形式实现各种与网络相关的操作。

​ Netfilter 提供了用于数据包过滤，网络地址转换和端口转换的各种功能和操作，这些功能和操作提供了通过网络定向数据包所需的功能，并提供了禁止数据包到达计算机网络内敏感位置的功能。 iptables 是一个用户空间程序，它提供一个基于表的系统，用于定义使用 netfilter 框架处理和转换数据包的规则。

​ 在 Kubernetes 中，kube-proxy 控制器通过访问 Kubernetes API 服务器来配置 iptables 规则。当 Service 或 Pod 的 ip 地址更新时。kube-proxy 将同步的更新 iptables 规则，以便将定向到 service 的流量正确路由到 Pod。iptables 规则监视发往 Service 的虚拟 IP 的流量，并在匹配项中从可用 Pod 的集合中选择一个随机的 Pod IP 地址，并且 iptables 规则将数据包的目标 IP 地址从 Service 的虚拟 IP 更改为选定的 Pod 的 ip。

​ 在返回数据包时，该 IP 地址来自目标 Pod。 在这种情况下，iptables 再次重写 IP 标头，用 Service 的 IP 替换 Pod IP。原 Pod 认为它一直在与 ServiceIP 进行的通信。

### 3.2 IPVS

Kubernetes 的最新版本（1.11）新添加了负载均衡的选项：IPVS。 IPVS（IP Virtual Server）也建立在 netfilter 之上，并作为 Linux 内核的一部分实现传输层负载平衡。 IPVS 被集成到 Linux 中，在此服务器上运行，并充当真实服务器群集之前的负载平衡器。 IPVS 可以将对基于 TCP 和 UDP 的服务的请求定向到真实服务器，并使真实服务器的服务在单个 IP 地址上显示为虚拟服务。这使得 IPVS 非常适合 Kubernetes Services。

​ 在声明 Kubernetes 服务时，您可以指定是否要使用 iptables 或 IPVS 完成集群内负载平衡。 IPVS 专为负载平衡而设计，并使用更有效的数据结构（哈希表），与 iptables 相比，几乎可以无限扩展。创建使用 IPVS 平衡的服务负载时，会发生三件事：在节点上创建虚拟 IPVS 接口，将服务的 IP 地址绑定到虚拟 IPVS 接口，并为每个服务 IP 地址创建 IPVS 服务器。

​ 现在，让我们看一下通过集群内负载平衡服务的数据包的周期。

### 3.3pod 到 service 数据包的过程

![1588923819698292podtoservice.gif](http://81.68.156.197:8090/upload/2020/09/1588923819-698292-pod-to-service-84009c674d114dfdb60cf276afcc2862.gif)

- 数据包首先通过连接到 Pod 网络名称空间的 eth0 接口离开 Pod
- 然后，它通过虚拟以太网设备（weth pair）到达 bridge
- bridge 上运行的 ARP 协议无法定位 Service 的 ip，因此它通过默认路由 eth0 将数据包传输出去
- 在这里，发生了一些不同的事情。 在被 eth0 接受之前，该数据包已通过 iptables 进行过滤。 收到数据包后，iptables 会修改数据包，将目标的 Service 的 ip 修改成 pod 的 ip。
- 最终数据包流向的事真实的 pod ip，而不是 service ip

### 3.4Service 到 pod 数据包的过程

![1111.gif](http://81.68.156.197:8090/upload/2020/09/1111-960082a3bd16401cae5f857d81cd5e65.gif)

- 接收到此数据包的 Pod 将做出响应，将源 IP 标识为自己的 IP，将目标 IP 标识为最初发送该数据包的 Pod
- 进入节点后，数据包流经 iptables，后者使用 conntrack 记住其先前所做的选择，并将数据包的源重写为 service 的 IP 而非 Pod 的 IP。
- 数据包从此处通过网桥流到与 Pod 的 namespace 配对的虚拟以太网设备，再流到我们之前看到的 Pod 的以太网设备。

### 3.5 使用 DNS

​ Kubernetes 可以选择使用 DNS（域名），以避免必须将服务的群集 IP 地址硬编码到您的应用程序中。Kubernetes DNS 实际上就是 kubernets 的一个 service。Kubernetes DNS 通过 kubelete 的配置来设置域名。每一个 service 都会定义一个域名（包括自己）

​ 在最新的 Kubernetes 中，使用 coredns 作为 DNS 服务器。CoreDNS 使用 Caddy 作为底层的 Web Server，Caddy 是一个轻量、易用的 Web Server，它支持 HTTP、HTTPS、HTTP/2、GRPC 等多种连接方式。所有 coreDNS 可以通过四种方式对外直接提供 DNS 服务，分别是 UDP、gRPC、HTTPS 和 TLS

​ CoreDNS 的大多数功能都是由插件来实现的，插件和服务本身都使用了 Caddy 提供的一些功能，所以项目本身也不是特别的复杂。
`原文档DNS使用的是kubedns，但是kubesphere使用的是coredns。从使用方面来说coredns更优于kubedns，所以这里讲解coredns。具体文章可以看<https://zhuanlan.zhihu.com/p/80141656?from_voters_page=true>。实际上，DNS的实现就是一个service。`

## 4.Internet-to-Service Networking

到目前为止，我们已经研究了如何在 Kubernetes 集群中路由流量。一切都很好，但不幸的是，您的应用程序与外界隔离，无法实现任何业务目标。有时您将需要向外部流量公开您的服务。这种需求突出了两个相关的问题：（1）将来自 Kubernetes 服务的流量引出到 Internet（2）将来自 Internet 的流量引到您的 Kubernetes 服务。本节依次处理这些问题。

​ 一般情况下，从 service 流向 internet 的流量是不会遇到阻碍的。如果有网关限制的话，可能需要设置 iptables。下面我们只讲解 internet 访问 service 的情况。

### 4.1 InEgress，Internet 流向 service

入口（将流量引入群集）是一个非常棘手的问题。同样，这是特定于您正在运行的网络的。Ingress 分为两个可在网络堆栈的不同部分上运行的解决方案：（1）Service LoadBalancer（2）Ingress 控制器。

### 4.2metallb

metallb 提供两种服务，1.address allocation（地址分配） 2.external announcement.（外部通知）

#### 4.2.1 metallb 的地址分配

在启用了云的 Kubernetes 集群中，您需要一个负载均衡器，并且您的云平台会为您分配一个 IP 地址。在裸机集群中，MetalLB 负责该分配。

​ MetalLB 无法凭空创建 IP 地址，因此您必须为它提供可以使用的 IP 地址池。当服务启动和脱机时，MetalLB 将负责分配和取消分配单个地址，但是它只会分发作为其已配置池一部分的 IP。

​ 如何获取 MetalLB 的 IP 地址池取决于您的环境。如果您在主机托管设施中运行裸机群集，则托管服务提供商可能会提供 IP 地址进行租赁。在这种情况下，您将租用/26 个 IP 空间（64 个地址），并将该范围提供给 MetalLB 以用于群集服务。

​ 另外，您的群集可能完全是私有的，为附近的 LAN 提供服务，但不暴露于 Internet。在这种情况下，您可以从一个专用地址空间（所谓的 RFC1918 地址）中选择一个 IP 范围，并将其分配给 MetalLB。这样的地址是免费的，并且只要您仅向 LAN 提供群集服务就可以正常工作。或者，您可以两者都做！MetalLB 使您可以定义任意数量的地址池，而不管您为它提供什么样的地址。

#### metallb 的外部公告

一旦 MetalLB 为服务分配了外部 IP 地址，它就需要使群集之外的网络意识到该 IP 在群集中“存在”。MetalLB 使用标准路由协议来实现此目的：ARP，NDP 或 BGP。

​ 在第 2 层模式下，群集中的一台机器拥有服务的所有权，并使用标准地址发现协议（用于 IPv4 的 ARP， 用于 IPv6 的 NDP）使这些 IP 在本地网络上可访问。从 LAN 的角度来看，通告机仅具有多个 IP 地址。

​ 在 BGP 模式下，群集中的所有计算机都 与您控制的附近路由器建立 BGP 对等会话，并告诉这些路由器如何将流量转发到服务 IP。借助 BGP 的策略机制，使用 BGP 可以在多个节点之间实现真正的负载平衡，并实现细粒度的流量控制。

### 4.3Ingress

![image.png](http://81.68.156.197:8090/upload/2020/09/image-73f0b9250cc943c08f1c3aa90ee08d0e.png)
实际上，ingress 相当于一个 7 层的负载均衡器，是 k8s 对反向代理的一个抽象。大概的工作原理也确实类似于 Nginx，可以理解成在 Ingress 里建立一个个映射规则 , ingress Controller 通过监听 Ingress 这个 api 对象里的配置规则并转化成 Nginx 的配置（kubernetes 声明式 API 和控制循环） , 然后对外部提供服务。ingress 包括：**ingress controller**和**ingress resources**

`ingress controller`：核心是一个 deployment，实现方式有很多，比如 nginx, Contour, Haproxy, trafik, Istio，需要编写的 yaml 有：Deployment, Service, ConfigMap, ServiceAccount（Auth），其中 service 的类型可以是 NodePort 或者 LoadBalancer。
`ingress resources`: 这个就是一个类型为`Ingress`的 k8s api 对象了，这部分则是面向开发人员。

`总结，service是对pod的负载均衡，ingress是对service的负载均衡。`
