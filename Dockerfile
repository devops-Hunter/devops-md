FROM harbor.ishanggang.com/common/isg-nginx:microapp
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo 'Asia/Shanghai' >/etc/timezone
ADD . /usr/share/nginx/html
EXPOSE 80
