---
title: Ingress nginx配置
order: 1
nav:
  title: Kubernetes
  path: /kubernetes
  order: 1
---

# ingress nginx 配置

## 如何不让 ingress 重定向 HTTP 请求

为 ingress 配置增加注解（annotations）：
`nginx.ingress.kubernetes.io/ssl-redirect: 'false'` #就可以禁止 http 强制跳转至 https

![image.png](http://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/image-532e77ab16724faeaefd678207b4ec60.png)
