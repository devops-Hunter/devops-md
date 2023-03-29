FROM registry.cn-shanghai.aliyuncs.com/hunter-devops-tools/nginx
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone
ADD . /usr/share/nginx/html
EXPOSE 80
