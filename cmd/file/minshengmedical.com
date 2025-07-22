#The Nginx server instance
server{
    listen 80;
    listen [::]:80;
    server_name minshengmedical.com www.minshengmedical.com;   
    #开启openai接口的gzip压缩，大量重复文本的压缩率高，节省服务端流量
    gzip  on;
    gzip_min_length 1k;
    # gzip_types text/event-stream;

    gzip_http_version 1.1;
    gzip_comp_level 6;
    gzip_types  text/plain text/css application/x-javascript text/xml application/xml application/xml+rss text/javascript application/vnd.ms-fontobject application/x-font application/x-font-opentype application/x-font-otf application/x-font-truetype application/x-font-ttf application/xhtml+xml font/opentype font/otf font/ttf image/svg+xml image/x-icon;


    location / {
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:3889;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

    }

}




