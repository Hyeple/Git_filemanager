# OSS Project 1


# Installation

## lists

### [python - Installation method] (https://wikidocs.net/8)

### [node - Installation method] (https://offbyone.tistory.com/441)

### [Chocolatey for nginx - Installation method] (https://harrybark.tistory.com/8)

### [nginx - Installation method]
  You must run this command in the cmd window with **administrator**
  ```bash
  choco nginx
  ```

## libraries

python : venv, fastapi, uvicorn, gitpython

node : axios


**libraries install**

pip install venv

pip install fastapi

pip install uvicorn

pip install gitpython





# Settings


You need to modify **nginx.conf** to match the setting of nginx to **default.conf**.

First, find the location of nginx.conf. It is usually located in the conf folder of the installation file.



![nginx_conf](https://github.com/Hyeple/Git_filemanager/assets/102994654/a7f3fb34-1251-4493-9cf5-02393a7894fd)



Second, you need to modify the **include** statement in the HTTP paragraph. Adds a **path** to refer to the location of default.conf.



![modify_include](https://github.com/Hyeple/Git_filemanager/assets/102994654/da2b525e-1691-4c48-9997-f8cf20f20950)



Third, you must **annotate** or **clear** the server paragraph within the HTTP paragraph.



![server_para](https://github.com/Hyeple/Git_filemanager/assets/102994654/82dc118d-06af-4799-8a8b-f60319a2e30f)


copy and change include part
```bash
#user  nobody;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
    worker_connections  1024;
}

http {
    #you must change this include line
    include       C:/Users/hyzaa/Desktop/OSS/Git_filemanager/default.conf;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

    # another virtual host using mix of IP-, name-, and port-based configuration
    #
    #server {
    #    listen       80;
    #    listen       80;
    #    server_name  somename  alias  another.alias;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}


    # HTTPS server
    #
    #server {
    #    listen       80 ssl;
    #    server_name  localhost;

    #    ssl_certificate      cert.pem;
    #    ssl_certificate_key  cert.key;

    #    ssl_session_cache    shared:SSL:1m;
    #    ssl_session_timeout  5m;

    #    ssl_ciphers  HIGH:!aNULL:!MD5;
    #    ssl_prefer_server_ciphers  on;

    #    location / {
    #        root   html;
    #        index  index.html index.htm;
    #    }
    #}

}
```


# Run

```bash
#preparation
You need two powershell windows and one powershell which run as **administrator**.

~/projectdirectory  python -m venv venv 
~/projectdirectory  venv/Scripts/activate  **activate venv**
(venv)~/projectdirectory  pip install fastapi
(venv)~/projectdirectory  pip install uvicorn
(venv)~/projectdirectory  pip install gitpython
~/projectdirectory/frontend  npm install axios
~/projectdirectory/frontend  npm install --global serve
~/projectdirectory/frontend  yarn
~/projectdirectory/frontend  npm run build
~/projectdirectory/frontend  serve -s build
(venv)~/projectdirectory  uvicorn backend:app --host localhost --port 8000

Command in powershell run with **administrator**.
Start-Service nginx

Access to the **http://localhost/** in your browser.
```
