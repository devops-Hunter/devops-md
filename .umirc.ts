import { defineConfig } from 'dumi';

export default defineConfig({
  title: 'HunterのDevops',
  mode: 'site',
  navs: {
    'en-US': [
      null,
      {
        title: 'GitHub',
        path: 'https://github.com/Hunter-Shen-N/devops-md.git',
      },
      {
        title: 'Changelog',
        path: 'https://github.com/Hunter-Shen-N/devops-md/commits/main',
      },
    ],
    'zh-CN': [
      null,
      {
        title: 'GitHub',
        path: 'https://github.com/Hunter-Shen-N/devops-md.git',
      },
      {
        title: '更新日志',
        path: 'https://github.com/Hunter-Shen-N/devops-md/commits/main',
      },
    ],
  },
  favicon:
    'http://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/1051617871570_.pic.jpg',
  logo:
    'http://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/1051617871570_.pic.jpg',
  outputPath: 'docs-dist',
  hash: true,
});
