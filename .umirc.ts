import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'isgBridge',
  mode: 'site',
  navs: {
    'en-US': [
      null,
      {
        title: 'GitHub',
        path: 'https://gitlab.ishanggang.com/isg-group/front/isg-jsbridge',
      },
      {
        title: 'Changelog',
        path: 'https://gitlab.ishanggang.com/isg-group/front/isg-jsbridge',
      },
    ],
    'zh-CN': [
      null,
      {
        title: 'GitHub',
        path: 'https://gitlab.ishanggang.com/isg-group/front/isg-jsbridge',
      },
      {
        title: '更新日志',
        path: 'https://gitlab.ishanggang.com/isg-group/front/isg-jsbridge',
      },
    ],
  },
  favicon:
    'https://frontassets.oss-cn-shanghai.aliyuncs.com/assets/%E7%88%B1%E4%B8%8A%E5%B2%97logo130-130.png',
  logo:
    'https://frontassets.oss-cn-shanghai.aliyuncs.com/assets/%E7%88%B1%E4%B8%8A%E5%B2%97logo130-130.png',
  outputPath: 'docs-dist',
  hash: true,
});
