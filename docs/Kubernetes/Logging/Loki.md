---
title: LOKI
order: 1
nav:
  title: Kubernetes
  path: /kubernetes
  order: 1
---

# 配置 Promtai

`wget https://raw.githubusercontent.com/grafana/loki/master/cmd/promtail/promtail-local-config.yaml`

```yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /tmp/positions.yaml

clients:
  - url: http://loki:3100/loki/api/v1/push

scrape_configs:
  - job_name: system
    static_configs:
      - targets:
          - localhost
        labels:
          job: varlogs
          __path__: /var/log/*log
```

- job_name: 区分了收集的日志与其他日志组
- labels：静态标签，比如 environment name, job name, or app name.
- path：日志存储位置

**执行**
CMD
`.\promtail-windows-amd64.exe --config.file=promtail-local-config.yaml`

LINUX
`./promtail-linux-amd64 -config.file=promtail-local-config.yaml`

**Labels**

labels 就是键值对，可以定义成任意值
我们可以称为描述日志流的元数据（metadata）,这与 prometheus 相似，例如 job 和 instance

```yaml
scrape_configs:
  - job_name: system
    pipeline_stages:
    static_configs:
      - targets:
          - localhost
        labels:
          job: syslog
          __path__: /var/log/syslog
```

上述配置将跟踪一个文件并分配一个标签：`job=syslog`.
可以这么查询：`{job=”syslog”}`，这将在 loki 中创建一个 stream

```yaml
scrape_configs:
  - job_name: system
    pipeline_stages:
    static_configs:
      - targets:
          - localhost
        labels:
          job: syslog
          __path__: /var/log/syslog
  - job_name: system
    pipeline_stages:
    static_configs:
      - targets:
          - localhost
        labels:
          job: apache
          __path__: /var/log/apache.log
```

上述配置将跟踪两个文件。每个文件的 label 里只有一个值，所以 loki 现在存储 2 个 stream
可以真的么查询

```bash
{job=”apache”} <- show me logs where the job label is apache
{job=”syslog”} <- show me logs where the job label is syslog
{job=~”apache|syslog”} <- show me logs where the job is apache **OR** syslog
```

```yaml
scrape_configs:
  - job_name: system
    pipeline_stages:
    static_configs:
      - targets:
          - localhost
        labels:
          job: syslog
          env: dev
          __path__: /var/log/syslog
  - job_name: system
    pipeline_stages:
    static_configs:
      - targets:
          - localhost
        labels:
          job: apache
          env: dev
          __path__: /var/log/apache.log
```

上述配置每个文件的 label 里有 2 个值，可以这么查询
`{env=”dev”} <- will return all logs with env=dev, in this case this includes both log streams`

通过使用单个 label，你可以通过组合几个不同的 label 查询多个 stream.，你可以创建非常灵活的日志查询。label 是 loki 日志数据的索引。它们用于查找压缩日志内容，这些内容以块的形式单独存储。标签和值的每个独特组合都定义了一个 stream，stream 的日志被批处理、压缩和存储为块。

**Cardinality(基数)**
有一些方法可以动态定义标签,使用 Apache 日志和可用于解析此类日志行的海量正则表达式:
`11.11.11.11 - frank [25/Jan/2000:14:00:01 -0500] "GET /1986.js HTTP/1.1" 200 932 "-" "Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7 GTB6"`

```yaml
- job_name: system
   pipeline_stages:
      - regex:
        expression: "^(?P<ip>\\S+) (?P<identd>\\S+) (?P<user>\\S+) \\[(?P<timestamp>[\\w:/]+\\s[+\\-]\\d{4})\\] \"(?P<action>\\S+)\\s?(?P<path>\\S+)?\\s?(?P<protocol>\\S+)?\" (?P<status_code>\\d{3}|-) (?P<size>\\d+|-)\\s?\"?(?P<referer>[^\"]*)\"?\\s?\"?(?P<useragent>[^\"]*)?\"?$"
    - labels:
        action:
        status_code:
   static_configs:
   - targets:
      - localhost
     labels:
      job: apache
      env: dev
      __path__: /var/log/apache.log
```

此正则表达式匹配日志行的每个组件，并将每个组件的值提取到捕获组中。在管道代码中，这些数据被放置在临时数据结构中，允许在处理该日志行期间将其用于多个目的（此时临时数据将被丢弃）。

从该正则表达式中，我们将使用两个捕获组根据日志行本身的内容动态设置两个标签：

action（例如 action=“GET”，action=“POST”）status_code（例如 status_code=“200”，status_code=“400”）

在 loki 中，将创建以下 stream：

```bash
{job=”apache”,env=”dev”,action=”GET”,status_code=”200”} 11.11.11.11 - frank [25/Jan/2000:14:00:01 -0500] "GET /1986.js HTTP/1.1" 200 932 "-" "Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7 GTB6"
{job=”apache”,env=”dev”,action=”POST”,status_code=”200”} 11.11.11.12 - frank [25/Jan/2000:14:00:02 -0500] "POST /1986.js HTTP/1.1" 200 932 "-" "Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7 GTB6"
{job=”apache”,env=”dev”,action=”GET”,status_code=”400”} 11.11.11.13 - frank [25/Jan/2000:14:00:03 -0500] "GET /1986.js HTTP/1.1" 400 932 "-" "Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7 GTB6"
{job=”apache”,env=”dev”,action=”POST”,status_code=”400”} 11.11.11.14 - frank [25/Jan/2000:14:00:04 -0500] "POST /1986.js HTTP/1.1" 400 932 "-" "Mozilla/5.0 (Windows; U; Windows NT 5.1; de; rv:1.9.1.7) Gecko/20091221 Firefox/3.5.7 GTB6"
```

这四条日志线将成为四个独立的流，并开始填充四个单独的块。

任何与标签/值组合匹配的额外日志行都将添加到现有 stream 中。如果出现另一个独特的标签组合（例如 status_code=“500”），则创建另一个新流。

想象一下，如果你为 ip 设置一个标签。来自用户的每个请求不仅成为唯一的流。来自同一用户的具有不同操作或 status_code 的每个请求都将获得自己的 stream。
进行一些快速数学运算，可能有四个常见的动作（GET，PUT，POST，DELETE）和四个常见的状态码（尽管可能有四个以上！），那么这将是 16 个流和 16 个单独的块。 现在，如果我们为 IP 使用标签，则将其乘以每个用户。 你将会快速拥有成千上万的流。`这就是高基数，这会kill掉loki`
高基数导致 loki 构建一个巨大的索引（读取：\$\$\$）并将数千个小块刷新到对象存储区（读取：缓慢）。Loki 目前在这个配置中表现很差

**并行化的最佳 loki 性能**
