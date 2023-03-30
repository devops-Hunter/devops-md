---
title: azureDevops
order: 7
nav:
  title: CiCd
  path: /cicd
  order: 7
---
> 目前社区内的CI/CD方案还是比较完善的。例如老牌的自动化工具Jenkins，Gitlab-runner。基于云原生实现的Tekton，Argocd。然而当企业引入IT审计时就会面临一些挑战: 比如开源工具不够安全需要封装及单点认证，与整套敏捷工具集成度不够高需要打开多个ui，基于整个流水线需要有严格的构建环境&代码镜像安全审核机制等等。这时候公有云的一站式Devops平台成了不二之选，主流的有AzureDevops，AwsDevops，阿里云云效等。


AzureDevops 是由微软开发的服务平台，它提供了多种工具，可用于更好地进行团队协作。它还具有用于自动构建过程，测试，版本控制和程序包管理的工具。**但是网上缺少文档且调试时坑较多**。本次最佳实践将基于生产经验流程实现JavaSpringBoot项目部署到K8S集群中。用到的工具如下：

- Git
- AzureDevops Pipeline
- Maven
- Docker
- Kustomize

# 流水线整体框架

![azurePipelines.png](http://image.devopsn.com/docs/devops/cicd/azuredevops/azurepipeline/2.png)
**首先我们将按照AzureDevops Pipeline内嵌的Task模块以及Shell脚本将流水线步骤进行拆解：**
第一步骤codeBuild（即代码编译打包）

1. 下载命中Maven缓存（相当于把之前缓存在本地.m2的路径挂载到任务中）
2. 单元测试&编译打包
3. 将最终target目录生成的项目上传到微软的Artifacts持久化，用于其他步骤使用
4. 自动上传Maven缓存
   第二步骤getGitTag获取tag进行版本控制
5. 通过git describe --abbrev=0 --tags获取tag，存入变量
   第三步骤imageBuild（构建Docker镜像并上传镜像仓库）
6. 下载codeBuild步骤中打完包上传Artifacts的项目（xx.jar）
7. 构建Docker镜像传入imageTag并上传镜像仓库
   第四步骤editKustomizeYaml修改Kustomize资源组进行版本控制
8. 修改项目Kustomize repo中的镜像版本并PR
   第五步骤deployToACK（通过Kustomize制品工具将项目部署到k8s集群中）
9. 克隆本项目Kustomize的Git Repo（建议将Kustomize单独创建一个git repo用于管理k8s的yaml文件，当然官方的task模块也支持使用helm）
10. 在k8s集群中创建一个用于镜像仓库认证的Secret
11. 将Kustomzie中的所有yaml文件进行渲染
12. kubectl kustomize部署到k8s集群
13. 验证CD状态并将本次Pipeline的构建版本号加入资源的Annotations中便于后续回滚

# Pipeline拆解

## 第零步骤：前期配置

①首先我们需要在azureDevops界面中配置一些Service Connections用于存放k8s集群连接配置，镜像仓库配置，Git仓库等
![image.png](http://image.devopsn.com/docs/devops/cicd/azuredevops/azurepipeline/1.png)

②开始创建pipeline,选择项目仓库。默认会在项目中提交一个**azure-pipelines.yaml**文件用于存放流水线源码(这个pipeline文件可以放在项目源码仓库中，也可以和项目的kustomize仓库放在一起）
本次实践采用了Azure Repos Git
![image.png](https://cdn.nlark.com/yuque/0/2023/png/32484067/1674137521108-539618b2-946b-4ecd-9ff0-859d96568c25.png#averageHue=%231c1b1b&clientId=u3cda970d-f01f-4&from=paste&height=591&id=uffc28b0e&name=image.png&originHeight=1182&originWidth=1370&originalType=binary&ratio=1&rotation=0&showTitle=false&size=195294&status=done&style=none&taskId=uf596d9e4-144f-4d83-a9a0-7f503875f24&title=&width=685)
③选择start pipeline我们开始编写流水线

④点击右上角的Variables，将项目kustomize仓库的Git用户名密码填写到变量中，可以选择加密存储。
这里的变量还可以暂存一些参数（比如每次发布时pod的数量，jvm的启动参数，灰度发布的权重占比等等。。。），在执行pipeline时通过UI实时修改变量参数，玩法较多，这里就不展开了。详情见[https://learn.microsoft.com/en-us/azure/devops/pipelines/security/inputs?view=azure-devops](https://learn.microsoft.com/en-us/azure/devops/pipelines/security/inputs?view=azure-devops)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/32484067/1674138035617-fb8945a1-6035-4cb9-a471-bdfed63a1144.png#averageHue=%23272626&clientId=u3cda970d-f01f-4&from=paste&height=321&id=u214ea452&name=image.png&originHeight=642&originWidth=1030&originalType=binary&ratio=1&rotation=0&showTitle=false&size=59923&status=done&style=none&taskId=u8300f221-0c9b-4d21-90d7-f7d5a1bf09e&title=&width=515)

**⑤可选项：这里可以关闭自动构建。不然在调试阶段每次保存pipeline后默认都会有钩子自动触发流水线。后续在dev/test环境需要自动发版时可以再打开。**![image.png](https://cdn.nlark.com/yuque/0/2023/png/32484067/1674138760838-032cd54c-0df0-423a-97c0-5d48bba23975.png#averageHue=%23191919&clientId=u3cda970d-f01f-4&from=paste&height=424&id=u7eb7a6db&name=image.png&originHeight=848&originWidth=2184&originalType=binary&ratio=1&rotation=0&showTitle=false&size=166739&status=done&style=none&taskId=u05584a5c-b011-4233-b767-b18dc74176d&title=&width=1092)

## 第一步骤：codeBuild

废话不多说，直接上源码

```yaml
variables:
  MAVEN_CACHE_FOLDER: $(Pipeline.Workspace)/.m2/repository
  MAVEN_OPTS: '-Dmaven.repo.local=$(MAVEN_CACHE_FOLDER)'
  # npm_config_cache: $(Pipeline  .Workspace)/.npm
  imageRepository: dev/demo/java-demo
  containerRegistryServiceConnection: aliyun-acr-dev

jobs:

#①代码编译打包
- job: codeBuild
  pool:
    vmImage: 'ubuntu-latest'
  steps:
  # - task: Cache@2
  #   inputs:
  #     key: 'npm | "$(Agent.OS)" | package-lock.json'
  #     restoreKeys: |
  #        npm | "$(Agent.OS)"
  #     path: $(npm_config_cache)
  #   displayName: 缓存npm共享cache目录

  - task: Cache@2
    inputs:
      key: 'maven | "$(Agent.OS)" | **/pom.xml'
      restoreKeys: |
        maven | "$(Agent.OS)"
        maven
      path: $(MAVEN_CACHE_FOLDER)
    displayName: Cache Maven local repo

  - task: Maven@4  
    displayName: Maven单元测试&编译打包
    inputs:
      mavenPomFile: 'pom.xml'
      #传递参数-Dmaven.repo.local的变量
      mavenOptions: '-Xmx3072m $(MAVEN_OPTS)'
      javaHomeOption: 'JDKVersion'
      jdkVersionOption: '1.8'
      jdkArchitectureOption: 'x64'
      publishJUnitResults: true
      testResultsFiles: '**/surefire-reports/TEST-*.xml'
      goals: 'package'
      
  - task: PublishBuildArtifacts@1
    inputs:
      pathtoPublish: $(System.DefaultWorkingDirectory)/target
      artifactName: JavaApp
```

由于SaaS化的流水线基于安全性考虑使用自建共享存储会有很多限制，大部分功能都是基于内嵌的task模块实现。以下几点需要注意：

- 首先是Cache@2模块，这个模块的实现方式就是将每次job（编译环节）生成的maven缓存临时上传到azure的存储中，job下次执行（编译环节）前再下载到本地。**这个功能略坑，根据官方的说法从安全角度不允许跨分支（或tag）的job缓存上传（既只读权限，只能下载）**。因此每次基于tag发版时都会传不上去，需要在源分支上先跑一遍才能实现每个tag完美命中缓存，同时缓存在7天没有更新后将自动清空。。相当难用。当然azure也提供了他的存储功能Artifacts让你自己实现，这里也先不展开了[https://learn.microsoft.com/zh-cn/azure/devops/pipelines/artifacts/universal-packages?view=azure-devops&tabs=yaml](https://learn.microsoft.com/zh-cn/azure/devops/pipelines/artifacts/universal-packages?view=azure-devops&tabs=yaml)
- 模块PublishBuildArtifacts@1可以将最终编译打包生成的jar临时存起来，用于其他步骤中下载使用

## 第二步骤：getGitTag

```yaml
- job: A
  displayName: getGitTagToimageVersion
  steps:
  - bash: |
     export gitTag=`git describe --abbrev=0 --tags`
     echo "##vso[task.setvariable variable=myOutputVar;isoutput=true]$gitTag"
    name: passOutput
```

。。。这么简单的环节掉了好几次链子，不知道是什么原因，后续步骤经常会读不到这个变量。改了里面的变量或者字段名，有时候也会读不到。。没办法了，只能复制黏贴官方模版
它的变量写法也必须按照官方提供的命令来，才能用于其他步骤引用。上链接[https://learn.microsoft.com/zh-cn/azure/devops/pipelines/process/set-variables-scripts?view=azure-devops&tabs=bash](https://learn.microsoft.com/zh-cn/azure/devops/pipelines/process/set-variables-scripts?view=azure-devops&tabs=bash)

## 第三步骤：imageBuild

```yaml
- job: imageBuild
  pool:
    vmImage: 'ubuntu-latest'
  steps:
  - bash: |
     export gitTag=`git describe --abbrev=0 --tags`
     echo "##vso[task.setvariable variable=imageTagVersion;isoutput=true]$gitTag"
    name: tagOutput
    displayName: 获取gitTag作为版本号

  - bash: |
     echo $(tagOutput.imageTagVersion)
    displayName: 输出版本号

  - task: DownloadPipelineArtifact@2
    displayName: '下载codeBuild生成的jar包'
    inputs:
      artifact: JavaApp
      path: $(Build.SourcesDirectory)/target

  - task: Docker@2
    displayName: 构建Docker镜像并上传阿里云ACR镜像仓库
    inputs:
      containerRegistry: $(containerRegistryServiceConnection)
      repository: $(imageRepository)
      command: buildAndPush
      Dockerfile: './Dockerfile'
      tags: '$(tagOutput.imageTagVersion)'
      arguments: '--disable-content-trust=false'
  dependsOn: codeBuild
  condition: succeeded() 
```

这里没什么好说的了，还是获取tag版本号（这里其实可以直接引用步骤二的变量，但是保险起见还是再来亿遍吧）。然后生成容器镜像。需要注意或者可以优化的点是：

- dependsOn字段建议还是要的，表示在某个步骤成功后才能执行这一步骤。这个可玩性也很多，默认的执行顺序是按部署顺序来的。可以自由控制步骤并发执行，优先级等
- 实际上dockerImage也是可以通过Cache@2模块做缓存的，可以加快镜像构建速度。

## 第四步骤：editKustomizeYaml

```yaml
- job: editKustomizeYaml
  dependsOn: A
  variables:
    myVarFromJobA: $[ dependencies.A.outputs['passOutput.myOutputVar'] ]
  pool:
    vmImage: 'ubuntu-latest'
  steps:
  - checkout: none
  - bash: |
     echo $(myVarFromJobA)
 
    displayName: 输出版本号
  - bash: |
     ls -l
     
     
     git remote set-url origin https://$(CDGITUSER):$(CDGITPASSWORD)@xxx/javaDemoKustomize
     git config --global user.name "Hunter"
     git config --global user.email "hunter.shen@outlook.com"
     git clone https://$(CDGITUSER):$(CDGITPASSWORD)@xxx/javaDemoKustomize devops-cd
     cd devops-cd
     git pull
     
     sed -i 's/java-demo.*/java-demo:'$(myVarFromJobA)'/g' overlays/dev/image.yaml
     cat overlays/dev/image.yaml
     git commit -am 'image update'
     git push origin main

 
    displayName: 修改项目Kustomize资源镜像并上传git
```

这里可能要熟悉一下Kustomize这个工具，可以参考我上次写的文章。用于做kubernetes项目的版本管理还是不错滴，也更符合gitops的流程。helm我也用的比较熟，但是用于微服务的维护管理并不是很方便而且不同技术栈不同环境经常要多写几个模版。当然了，较为复杂的集群应用还是首推helm，结合operator可以整的花活很多。
那我们这步里也是把项目的Kustomize仓库下到本地，然后sed修改一些资源参数，本次实践就把镜像地址改掉了。之后再push回去

- dependsOn是肯定要的，必须在步骤二getGitTag后才能改镜像标签，不然传进去的就是空变量
- 用sed命令其实挺low的，修改参数多了以后也不便于维护。这里可以换成yq命令，或者kustomize本身也提供参数可以修改字段，本次实践就先不涉及啦。老样子上链接[https://kustomize.io](https://kustomize.io/)
- 实际生产环境当几十个微服务并发构建时，会有概率出现git push报错的情况。最合适的方式是自己写一个脚本自行判断git远程仓库的状态并且有重试机制

## 第五步骤：deployToACK

```yaml
- deployment:
  dependsOn: editKustomizeYaml
  displayName: deployToACK
  environment: dev
  strategy:
    runOnce:
      deploy:
        steps:
        - checkout: git://xxx/javaDemoKustomize
        - download: none
        - task: KubernetesManifest@0
          displayName: 创建镜像仓库认证秘钥
          inputs: 
            action: createSecret
            namespace: dev
            secretType: dockerRegistry
            secretName: dev-acr-secret
            kubernetesServiceConnection: aliyun-ack-dev
            dockerRegistryEndpoint: aliyun-acr-dev
            
        - task: KubernetesManifest@0
          displayName: Bake K8s manifests from Kustomzie
          name: bake
          inputs:
            action: bake
            namespace: dev
            kubernetesServiceConnection: aliyun-ack-dev
            renderType: kustomize 
            kustomizationPath: overlays/dev
            imagePullSecrets: |
              aliyun-acr-dev

        - task: KubernetesManifest@0
          displayName: Deploy K8s manifests
          inputs:
            action: 'deploy'
            kubernetesServiceConnection: aliyun-ack-dev
            namespace: dev
            manifests: $(bake.manifestsBundle)
```

终于到最后一步了！！！
其实如果集群有装Argocd都不需要这一步。但是写流水线还是有始有终，我们把它实现了吧！

- 按照KubernetesManifest@0模块，就是把kustomize的yaml文件渲染出来再apply。但是该模块还是加了一些逻辑。比如会用rollout status检查目前的服务状态，annotate加一些流水线本身的参数用于版本控制等

![image.png](https://cdn.nlark.com/yuque/0/2023/png/32484067/1674142599200-d66d0a30-8dcf-41d6-b1b2-d359010e9d6d.png#averageHue=%23272626&clientId=ufea0f642-7742-4&from=paste&height=431&id=u1768a1f6&name=image.png&originHeight=862&originWidth=994&originalType=binary&ratio=1&rotation=0&showTitle=false&size=97206&status=done&style=none&taskId=u6164cb95-9b58-454e-b9dd-4f51f109db8&title=&width=497)
![image.png](https://cdn.nlark.com/yuque/0/2023/png/32484067/1674142571118-12504836-30e7-4721-8699-2dbdca711d39.png#averageHue=%231f1e1e&clientId=ufea0f642-7742-4&from=paste&height=447&id=u593bb232&name=image.png&originHeight=894&originWidth=1268&originalType=binary&ratio=1&rotation=0&showTitle=false&size=141218&status=done&style=none&taskId=ucf4176b2-769f-4da9-b249-f15db0a4d00&title=&width=634)
runPipeline时我们就可以选择项目tag了。最后的效果是这样滴

# 总结

本次实践到此结束。其实按照以前自建的jenkins，tekton玩法，还有很多优化空间。官方在这一块也是像社区主流看齐的。

- 比如可以像jenkins公共库一样将步骤拆解封装到git，然后流水线里import跨包调用（有点像python装饰器）
- 比如在不同环节中用不同的容器去跑里面的步骤，这样自定义场景就多了，像前面提到的kustomize插件之类都能简单实现。然而我们使用SaaS产品的初衷可能也是从安全合规的角度，所以在使用容器跑流水线步骤时时还是要谨慎谨慎再谨慎
- 可以加入sonarQube等代码审核环境

后续如果有azurePipeline进阶玩法或者其他SaaS产品，比如阿里云云效，腾讯云Coding都会发出来大家一起探讨。再会