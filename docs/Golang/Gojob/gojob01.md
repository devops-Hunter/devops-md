---
title: Go脚本
order: 5
nav:
  title: Golang
  path: /Golang
  order: 4
---

## 📋 Go 获取 SQL 信息并发送 request 请求到企业微信机器人

```go
package main

import (
	"database/sql"
	"fmt"
	"github.com/go-resty/resty/v2"
	_ "github.com/go-sql-driver/mysql"
	"log"
)

func  main() {
	db, err := sql.Open("mysql", "用户名:密码@tcp(数据库链接:3306)/库名") //连接数据库
	checkErr(err)
	rows, err := db.Query("SQL（SELECT XXX）; ")
	checkErr(err)
	for rows.Next() {
		var fail_num string
		var success_num string
		//var time  string
		err = rows.Scan(&fail_num, &success_num)
		checkErr(err)
		fmt.Println(success_num)
		fmt.Println(fail_num)

		bodyP1 := RespP1{}
		bodyP1.Msgtype = "markdown"
		bodyP1.Markdown.Content = fmt.Sprintf("**【今日同步排班记录】**\n > 成功条数为:<font color=\"info\">%v</font>\n > 失败条数为:<font color=\"warning\">%v</font>", success_num, fail_num)

		urlP1 := "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
		client := resty.New()
		resp, _ := client.R().
			SetHeaders(map[string]string{
				"Connection":      "keep-alive",
				"Content-Type":    "application/json",
				"Accept":          "*/*",
				"Cache-Control":   "no-cache",
				"Host":            "qyapi.weixin.qq.com",
				"accept-encoding": "gzip, deflate",
				"cache-control":   "no-cache",
			}).SetBody(&bodyP1).Post(urlP1)

		//if err != nil {
		// fmt.Printf("请求失败")
		// return
		//}
		fmt.Println(resp)




	}


}

type RespP1 struct {
	Msgtype  string `json:"msgtype"`
	Markdown struct {
		Content string `json:"content"`
	} `json:"markdown"`
}

func  checkErr(err error){
	if  err  != nil{
		log.Println(err)
	}
}
```

### 🔨 通过 go mod 执行，需要安装第三方依赖包

```bash
go get tidy
#mac需要编译成linux可执行的二进制文件
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build schedule.go
```

### 🔨 制作 docker 镜像，将编译好的二进制包放入

```Dockerfile
FROM alpine

RUN mkdir -p /app

WORKDIR /app
COPY ./scheduling .
CMD ["/app/scheduling"]
```

### 🔨 编写 Cronjob，部署到 kubernetes 中

```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: schedule-monitoring
  namespace: devops
spec:
  concurrencyPolicy: Allow
  failedJobsHistoryLimit: 1
  jobTemplate:
    metadata: {}
    spec:
      activeDeadlineSeconds: 600
      backoffLimit: 3
      completions: 1
      parallelism: 1
      template:
        spec:
          containers:
            - image: 'image'
              imagePullPolicy: Always
              name: schedule-monitoring
              resources:
                requests:
                  cpu: 250m
                  memory: 256Mi
              volumeMounts:
                - mountPath: /etc/localtime
                  name: volume-localtime
          dnsPolicy: ClusterFirst
          imagePullSecrets:
            - name: harbor
          restartPolicy: OnFailure
          terminationGracePeriodSeconds: 30
          volumes:
            - hostPath:
                path: /etc/localtime
                type: ''
              name: volume-localtime
  schedule: 0 5 * * *
  successfulJobsHistoryLimit: 3
  suspend: false
```
