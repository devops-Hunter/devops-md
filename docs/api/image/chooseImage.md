---
title: chooseImage
order: 2
nav:
  title: API
  path: /api
  order: 1
---

<Alert type="info">
 从本地相册选择图片或使用相机拍照。
</Alert>

##### <Badge>umd 使用方式</Badge>

``` js
isgBridge.chooseImage(parmas);
```

##### <Badge>cmd 使用方式</Badge>

``` js
import {
    chooseImage
} from 'isg-bridge';
```

### 返回值: `Promise<Result>`

``` typescript
type Result = Array<{
  url: string;
}>;
```

### 用法

<Badge>async/await</Badge>

``` typescript
const params: ChooseImageProps = {
  count: 4,
  sourceType: 'all',
};

try {
  const result = await chooseImage(params);
} catch (err) {
  console.log(err);
}
```

<Badge>promise</Badge>

``` typescript
const params: ChooseImageProps = {
  count: 4,
  sourceType: 'all',
};

chooseImage(params)
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
| parmas | 参数 | ChooseImageProps | `object` |   1.0.0     |   4.4.8      |

### `ChooseImageProps`

| 参数        | 说明                   | 类型                         | 默认值 |
| ----------- | ---------------------- | ---------------------------- | ------ |
| count       | 最多可以选择的图片张数 | `number` | 1      |
| sourceType  | 选择图片的来源         | `album` \| `camera` \| `all` | `all` |
| saveToAlbum | 是否保存到相册         | `boolean` | true   |
| compress    | 是否压缩图片           | `boolean` | true   |
