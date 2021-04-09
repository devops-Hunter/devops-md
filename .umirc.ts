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
        path: 'https://github.com/Hunter-Shen-N/devops-md.git',
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
        path: 'https://github.com/Hunter-Shen-N/devops-md.git',
      },
    ],
  },
  favicon:
    'http://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/WechatIMG105.jpeg',
  logo:
    'http://rdsbackuposs.oss-cn-shanghai.aliyuncs.com/hunter-docs/WechatIMG105.jpeg',
  outputPath: 'docs-dist',
  hash: true,
});
