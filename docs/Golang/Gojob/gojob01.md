---
title: Go脚本
order: 5
nav:
  title: Golang
  path: /Golang
  order: 4
---

## 📋 Go 获取 SQL(MYSQL) 信息并发送 request 请求到企业微信机器人

### 企业微信群机器人接口文档 [wechat](https://open.work.weixin.qq.com/api/doc/90000/90136/91770 'wechat')

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

---

## 📋 Go 获取 SQL(SQLSERVER) 信息并发送 request 请求到企业微信机器人

### 企业微信群机器人接口文档 [wechat](https://open.work.weixin.qq.com/api/doc/90000/90136/91770 'wechat')

```go
package main

import (
	"bufio"
	"database/sql"
	"fmt"
	_ "github.com/denisenkom/go-mssqldb"
	"github.com/go-resty/resty/v2"
	"io"
	"log"
	"os"
	"time"
)

func main() {

	//获取下周一到周日的日期
	now := time.Now()
	offset := int(time.Monday - now.Weekday())

	if offset > 0 {
		offset = -6
	}
	weekStartDate := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, time.Local).AddDate(0, 0, offset)
	weekMonday := weekStartDate.Format("2006-01-02")

	TimeMonday, _ := time.Parse("2006-01-02", weekMonday)
	NextWeekMonday := TimeMonday.AddDate(0, 0, +7)
	NextWeekSunday := TimeMonday.AddDate(0, 0, +13)
	NextWeekMondayStr := NextWeekMonday.Format("2006-01-02")
	NextWeekSundayStr := NextWeekSunday.Format("2006-01-02")

	//fmt.Printf("本周一的日期是%v", weekMonday)
	fmt.Printf("\n下周的排班日期%v~%v\n", NextWeekMondayStr, NextWeekSundayStr)



     //链接sqlserver
	connString := fmt.Sprintf("server=%s;port=%s;user id=%s;password=%s;database=%s;encrypt=disable",
		"rm-xxx.sqlserver.rds.aliyuncs.com", "3433", "{userid}", "{passwd}", "DATABASE")

	conn, err := sql.Open("mssql", connString)
	if err != nil {
		log.Fatal("Open connection failed:", err.Error())
	}

	rows, err := conn.Query("{SQL}")
	if err != nil {
		log.Printf("\nPrepare failed:%T %+v\n", err, err)

	}
	//defer stmt.Close()


    //将遍历的数据写到文件中
	for rows.Next() {
		var a,b,c,d string

		err = rows.Scan(&a, &b, &c, &d)

		fmt.Println(a,b,c,d)

		f, err := os.OpenFile("/app/lines.txt", os.O_APPEND|os.O_WRONLY, 0644)
		if err != nil {
			fmt.Println(err)
			return
		}
		txt := []string{a,b,c,d}
		for _, v := range txt {
			fmt.Fprintln(f, v)
			if err != nil {
				fmt.Println(err)
				f.Close()
				return
			}
		}
		err = f.Close()
		if err != nil {
			fmt.Println(err)
			return
		}



	}



    //将文件中的数据放入map中
	lineMap := make(map[string]string, 5)

	count := 0
	lines, err := ForFileString("/app/lines.txt")
	if err != nil {
		return
	}
	for _, v := range lines {
		count++
		d := fmt.Sprintf("a%v", count)
		lineMap[d] = v
	}

	LM := PutMap()
	fmt.Println(LM["a1"])
	fmt.Println(LM["a2"])
	fmt.Println(LM["a3"])
	fmt.Println(LM["a4"])
	fmt.Println(LM["a5"])
	fmt.Println(LM["a6"])
	fmt.Println(LM["a7"])
	fmt.Println(LM["a8"])
	fmt.Println(LM["a9"])
	fmt.Println(LM["a10"])
	fmt.Println(LM["a11"])
	fmt.Println(LM["a12"])
	fmt.Println(LM["a13"])
	fmt.Println(LM["a14"])
	fmt.Println(LM["a15"])
	fmt.Println(LM["a16"])



	for k,v :=range LM {
		fmt.Println(k,v)
	}




    ///推送到企微机器人
	bodyP1 := RespP1{}
	bodyP1.Msgtype = "markdown"
	bodyP1.Markdown.Content = fmt.Sprintf("**【EHR⭐️%v~%v排班情况】**\n > 区域:<font color=\"info\">%v</font> 需要排班门店数:<font color=\"info\">%v</font> 已排班门店数:<font color=\"info\">%v</font> 已排班人员数:<font color=\"info\">%v</font>\n > 区域:<font color=\"info\">%v</font> 需要排班门店数:<font color=\"info\">%v</font> 已排班门店数:<font color=\"info\">%v</font> 已排班人员数:<font color=\"info\">%v</font>\n > 区域:<font color=\"info\">%v</font> 需要排班门店数:<font color=\"info\">%v</font> 已排班门店数:<font color=\"info\">%v</font> 已排班人员数:<font color=\"info\">%v</font>\n > 区域:<font color=\"info\">%v</font> 需要排班门店数:<font color=\"info\">%v</font> 已排班门店数:<font color=\"info\">%v</font> 已排班人员数:<font color=\"info\">%v</font> ", NextWeekMondayStr, NextWeekSundayStr, LM["a1"], LM["a2"], LM["a3"], LM["a4"], LM["a5"], LM["a6"], LM["a7"], LM["a8"], LM["a9"], LM["a10"], LM["a11"], LM["a12"], LM["a13"], LM["a14"], LM["a15"], LM["a16"])
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

func PutMap() map[string]string {
	lineMap := make(map[string]string, 16)

	count := 0
	lines, err := ForFileString("/app/lines.txt")
	if err != nil {
		return lineMap
	}
	for _, v := range lines {
		count++
		d := fmt.Sprintf("a%v", count)
		lineMap[d] = v
	}
	return lineMap



}



func ForFileString(path string) (lines []string, err error) {
	file, err := os.Open(path)
	if err != nil {
		fmt.Println(err)
		return lines, err
	}
	defer file.Close()

	br := bufio.NewReader(file)
	for {
		line, _, err := br.ReadLine()
		if err == io.EOF {
			break
		}

		lines = append(lines, string(line))
	}
	return lines, nil
}
```

### 🔨 通过 go mod 执行，需要安装第三方依赖包

```bash
go get tidy
#mac需要编译成linux可执行的二进制文件
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build list.go
```

### 🔨 制作 docker 镜像，将编译好的二进制包放入

```Dockerfile
FROM alpine

RUN mkdir -p /app && \
    touch /app/lines.txt && \
    chmod 755 /app/lines.txt

WORKDIR /app
COPY ./list .
CMD ["/app/list"]
```

### 🔨 编写 Cronjob，部署到 kubernetes 中

```yaml
apiVersion: batch/v1beta1
kind: CronJob
metadata:
  name: ehr-schedule
  namespace: devops
spec:
  concurrencyPolicy: Allow
  failedJobsHistoryLimit: 1
  jobTemplate:
    metadata: {}
    spec:
      activeDeadlineSeconds: 600
      backoffLimit: 1
      completions: 1
      parallelism: 1
      template:
        metadata: {}
        spec:
          containers:
            - image: 'harbor/devops/ehr-schedule'
              imagePullPolicy: Always
              name: ehr-schedule-6
              resources:
                requests:
                  cpu: 10m
                  memory: 1Mi
              terminationMessagePath: /dev/termination-log
              terminationMessagePolicy: File
              volumeMounts:
                - mountPath: /etc/localtime
                  name: volume-localtime
          dnsPolicy: ClusterFirst
          imagePullSecrets:
            - name: harbor
          restartPolicy: OnFailure
          schedulerName: default-scheduler
          securityContext: {}
          terminationGracePeriodSeconds: 30
          volumes:
            - hostPath:
                path: /etc/localtime
                type: ''
              name: volume-localtime
  ///每周六，日 的8:00~23:00，然后每小时执行一次
  schedule: '1 8-23/1 * * 6,0'
  successfulJobsHistoryLimit: 3
  suspend: false

```