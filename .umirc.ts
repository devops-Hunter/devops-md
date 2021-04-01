import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'isgBridge',
  mode: 'site',
  navs: {
    'en-US': [
      null,
      { title: 'GitHub', path: 'https://github.com/aiolosjs' },
      { title: 'Changelog', path: 'https://github.com/aiolosjs/releases' },
    ],
    'zh-CN': [
      null,
      { title: 'GitHub', path: 'https://github.com/aiolosjs' },
      { title: '更新日志', path: 'https://github.com/aiolosjs/releases' },
    ],
  },
  favicon:
    'https://frontassets.oss-cn-shanghai.aliyuncs.com/assets/%E7%88%B1%E4%B8%8A%E5%B2%97logo130-130.png',
  logo:
    'https://frontassets.oss-cn-shanghai.aliyuncs.com/assets/%E7%88%B1%E4%B8%8A%E5%B2%97logo130-130.png',
  outputPath: 'docs-dist',
  // more config: https://d.umijs.org/config
});
