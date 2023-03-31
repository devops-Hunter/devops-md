---
title: 重启deploy笨办法
order: 4
nav:
  title: 云原生
  path: /cloudNative
  order: 1
group:
   title: 疑难杂症
---

:::info{title=思路是啥？}
基本思路就是给Container添加一个无关紧要的环境变量，这个环境变量的值就是时间戳，而这个时间戳则是每>次执行上述命令的系统当前时间。这样一来对于K8S来讲这个Deployment spec就变化了，就可以像Updating a deployment一样，重启Pod了.
:::

`kubectl patch deployment <deployment-name> \ -p '{"spec":{"template":{"spec":{"containers":[{"name":"<container-name>","env":[{"name":"RESTART_","value":"'$(date +%s)'"}]}]}}}}'`
