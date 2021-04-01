---
title: ready
order: 1
nav:
  title: API
  path: /api
  order: 1
---

<Alert type="info">
 flutterInAppWebViewPlatformReady是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
</Alert>

##### <Badge>umd 使用方式</Badge>

```js
isgBridge.ready(callback);
```

##### <Badge>cmd 使用方式</Badge>

```js
import { ready } from 'isg-bridge';
```

### 属性

| 参数     | 说明     | 类型     | required |
| -------- | -------- | -------- | -------- |
| callback | 回调函数 | Function | true     |
