---
title: previewImage
order: 3
nav:
  title: API
  path: /api
  order: 1
---

<Alert type="info">
 在新页面中全屏预览图片。预览的过程中用户可以进行保存图片等操作
</Alert>

##### <Badge>umd 使用方式</Badge>

``` js
isgBridge.previewImage(parmas);
```

##### <Badge>cmd 使用方式</Badge>

``` js
import {
    previewImage
} from 'isg-bridge';
```

### 返回值: `Promise<Result>`

<Alert type="info">
 正常情况下没有返回值，如有错误，在catch中捕获
</Alert>

``` typescript
type Result = any;
```

### 用法

<Badge>async/await</Badge>

``` typescript
const urls = Array.from({ length: 4 }).map((_, idx) => 'http://${idx}.jpg');
const params: PreviewImageProps = {
  urls,
  current: 'http://1.jpg',
};

try {
  const result = await previewImage(params);
} catch (err) {
  console.log(err);
}
```

<Badge>promise</Badge>

``` typescript
const urls = Array.from({ length: 4 }).map((_, idx) => 'http://${idx}.jpg');
const params: PreviewImageProps = {
  urls,
  current: 'http://1.jpg',
};

previewImage(params)
  .then(result => {
    console.log(result);
  })
  .catch(e => {
    console.log(e);
  });
```

### 属性

| 参数   | 说明              | 类型     | required |  sdk 版本 |  app 版本 |
| ------ | ----------------- | -------- | -------- |------------| -------------|
| parmas | PreviewImageProps | `object` | `true` |   1.0.0     |   4.4.8      |

### `PreviewImageProps`

| 参数    | 说明                   | 类型       | 默认值                                      |
| ------- | ---------------------- | ---------- | ------------------------------------------- |
| urls    | 需要预览的图片链接列表 | `string[]` |                                             |
| current | urls 中的 url          | `string` |
| idx     | urls 的索引            | `number` | `idx` 和 `current` 传一个即可，current 优先 |
