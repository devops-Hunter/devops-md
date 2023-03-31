---
title: promptK8s
order: 1
nav:
  title: chatGPT
  path: /chatgpt
  order: 1
---
> 嗯没错，就是追热点。作为高逼格的云原生项目怎么能没有chatGPT。这里我们尝试一个demo项目，向chatGPT发送请求，然后将接口回复的内容输出到控制台。在场景上，我们可以让AI来协助排查k8s运维当中的疑难杂症。


# 效果图
![1.jpg](https://docs.devopsn.com/images/docs/devops/chatgpt/promptk8s/1.jpg)

**比较有趣的是，该demo本身几乎都是由chatgpt生成，以后学习成本将下降不少**

## 撸代码

**实际上是一个简单的go编写的命令行工具**
```go
package main

import (
	"bufio" // 读取标准输入
	"context" // 上下文
	"encoding/json" // json解析
	"flag" // 命令行参数解析
	"fmt" // 标准输出
	"io/ioutil" // 读取文件
	"log" // 日志
	"os" // 环境变量
	"strings" // 字符串操作

	openai "github.com/sashabaranov/go-openai" // openai api
)

type Config struct {
	Data map[string]string `json:"data"` // 配置文件结构体
}

func readConfig(filePath string) (*Config, error) {
	fileBytes, err := ioutil.ReadFile(filePath) // 读取文件
	if err != nil {
		return nil, err
	}
	var config Config
	err = json.Unmarshal(fileBytes, &config) // 解析json
	if err != nil {
		return nil, err
	}

	return &config, nil
}

func readStdin() (string, error) {
	scanner := bufio.NewScanner(os.Stdin) // 读取标准输入
	var lines []string
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		return "", err
	}
	return strings.Join(lines, "\n"), nil // 拼接字符串
}

func main() {
	openaiToken, ok := os.LookupEnv("OPENAI_TOKEN") // 读取环境变量
	if !ok {
		log.Fatal("Failed to read OPENAI_TOKEN environment variable.")
	}

	typeFlag := flag.String("type", "", "Type to be retrieved from conf.json") // 解析命令行参数
	flag.Parse()

	if *typeFlag == "" {
		log.Fatal("Error: '--type' flag must be provided.")
	}

	config, err := readConfig("conf.json") // 读取配置文件
	if err != nil {
		log.Fatalf("Error reading config file: %v", err)
	}
	prompt, ok := config.Data[*typeFlag] // 获取配置文件中的数据
	if !ok {
		log.Fatalf("Error: Type '%s' not found in conf.json", *typeFlag)
	}

	kubeOutput, err := readStdin() // 读取标准输入
	if err != nil {
		log.Fatalf("Error reading from stdin: %v", err)
	}

	client := openai.NewClient(openaiToken) // 创建openai客户端
	resp, err := client.CreateChatCompletion(
		context.Background(),
		openai.ChatCompletionRequest{
			Model: openai.GPT3Dot5Turbo, // 模型选择，此处用的是免费的3.5
			Messages: []openai.ChatCompletionMessage{
				{
					Role:    openai.ChatMessageRoleUser, // 用户角色
					Content: prompt + "\n" + kubeOutput, // 拼接字符串
				},
			},
		},
)

	if err != nil {
		fmt.Printf("ChatCompletion error: %v\n", err)
		return
	}

	fmt.Println(resp.Choices[0].Message.Content) // 输出结果
}

```


## 配置Prompt
**修改conf.json文件，添加需要的Prompt类型，这里可以添加各种prompt**
```json
{
  "data":{"k8s": "简明扼要地用 Kubernetes 专家的身份判断一下这段输出有什么问题，要整齐列出问题对象和可能原因以及操作建议："}
}
```


## 用管道将命令行输出内容给 Pipe2GPT。
**以下是使用方法，怎么获取openai的秘钥这里也不提及了**
```bash
# 创建 bin 文件夹（如果不存在）
mkdir -p bin

# 编译代码并将二进制文件输出到 bin/pipe2gpt
go build -o bin/pipe2gpt cmd/main.go

# export OPENAI_TOKEN需要在环境变量中输入你的OpenAI API 密钥
export OPENAI_TOKEN=xxxx

# 现在就可以让ai来帮你排查啦
kubectl get pods | pipe2gpt --type=k8s

#可以将这个go编写命令行工具通过任意方式改成kubectl插件，这里不赘述
```
