---
title: Jenkins
order: 6
nav:
  title: Jenkins
  path: /jenkins
  order: 6
---

# 🏷 Jenkins 自动化

## 📋 部署配置 Jenkins

---

<Alert type="info">
使用docker部署
</Alert>

```bash
docker run \
  -u root \
  -d \
  -p 6080:8080 \   #映射端口，第一个数字代表宿主机上的端口
  -p 50000:50000 \
  -v /ops/jenkins:/var/jenkins_home \   #数据卷存储路径,第一个路径代表宿主机本地路径
  jenkins
```

#### <Badge>访问{宿主机 ip:6080}</Badge>

![image.png](https://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/jenkins/1635218434254.jpg)

- 通过宿主机路径获取初始密码
  `cat /ops/jenkins/secrets/initialAdminPassword`
- 后续默认安装即可

![image.png](https://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/jenkins/1635218893620.jpg)
![image.png](https://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/jenkins/1635219025117.jpg)

- 安装插件`nodejs` `gitlab`

![image.png](https://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/jenkins/1635221567303.jpg)

- 安装 nodejs，可指定已安装的 node 目录或自动安装相应版本

![image.png](https://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/jenkins/1635220848728.jpg)
![image.png](https://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/jenkins/1635220892133.jpg)
![image.png](https://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/jenkins/1635220910033.jpg)

- 创建一个 gitlab 的用户秘钥（可以是用户名密码，也可以是 ssh-key），复制它的唯一标识

## 🔨 创建 job

<Alert type="info">
编写一个jenkins-pipeline来接收git-webhook并构建打包
</Alert>
![image.png](https://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/jenkins/1635219445223.jpg)
![image.png](https://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/jenkins/1635221736540.jpg)

- 勾选`Build when a change is pushed to GitLab. GitLab webhook URL`
- 下方流水线填入 jenkinsfile

```groovy
#!/usr/bin/env groovy
// 所需插件: Git Parameter 动态从git中获取所有分支
//Git 拉取代吗
//Pipeline 流水线
//Config File Provider 将配置文件由jenkins存储，用pipeline调用
//kubernetes 连接k8s动态创建代理
//Extended Choice Parameter 扩展参数构建


//项目名
def project = "arp-admin-auto"
//项目git地址
def git_url = "http://1.1.1.1/xxx/arp-admin.git"
//秘钥的唯一标识
def git_auth = "148b285b-cf26-4797-9820-0f4aafea03df"
//分支名
def Branch = "dev"
//服务器本地存项目的路径
def app_pwd = "/opt/frontend-auto/html"

pipeline {
  agent any
    tools {
        nodejs 'nodejs'
    }
     options {
        //构建历史为10
        buildDiscarder(logRotator(numToKeepStr: '10'))
        //此项目不允许同时构建多个
        disableConcurrentBuilds()
    }
    stages {
        stage('拉取代码'){
            steps {
                checkout([$class: 'GitSCM',
                branches: [[name: "${Branch}"]],
                doGenerateSubmoduleConfigurations: false,
                extensions: [], submoduleCfg: [],
                userRemoteConfigs: [[credentialsId: "${git_auth}", url: "${git_url}"]]
                ])
            }
        }
        stage('代码编译') {
            // 编译指定服务
            steps {

                  sh """
                  npm install --unsafe-perm=true --allow-root && npm run build:dev
                  """
        }
        }

        stage('部署脚本') {
            steps {
                sh """
                  cd ${app_pwd}
                  rm -rf ./*
                  mv ${JENKINS_HOME}/workspace/${project}/dist/* ./


                """
            }
        }


        }
    }

```

![image.png](https://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/jenkins/1635221047855.jpg)
![image.png](https://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/jenkins/1635221198459.jpg)

- 将`GitLab webhook URL`填入 gitlab 的项目设置中并'Add webhook'，可进行测试
