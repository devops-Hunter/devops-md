---
title: getVersion
order: 2
nav:
  title: API
  path: /api
  order: 1
---

<Alert type="info">
 获取当前app版本
</Alert>

##### <Badge>umd 使用方式</Badge>

``` js
isgBridge.getVersion();
```

##### <Badge>cmd 使用方式</Badge>

``` js
import {
    getVersion
} from 'isg-bridge';
```

### 返回值: `Promise<string>`

### 用法

<Badge>async/await</Badge>

``` typescript

try {
  const result = await getVersion();
} catch (err) {
  console.log(err);
}
```

<Badge>promise</Badge>

``` typescript

getVersion()
  .then(result => {
    console.log(result);
  })
  .catch(e => {
    console.log(e);
  });
```

### 属性

| 参数   | 说明 | 类型             | required |  sdk 版本 |  app 版本 |
| ------ | ---- | ---------------- | -------- |------------| -------------|
| 无 |  |  |  |   1.1.0     |   4.4.8      |
