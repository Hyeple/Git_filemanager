# OSS Project 1 : 📁Git_FileManager

This program is a Git file manager designed to run on the Windows environment. 
Please run it on a Windows system.

It enables you to manage files on your computer's C drive. 
It offers functionalities such as file exploration, Git repository initialization, and various Git actions to assist you in file management using Git.


# Installation

## lists

### [python - Installation method] 
https://wikidocs.net/8

### [node - Installation method] 
https://offbyone.tistory.com/441

### [Chocolatey for nginx - Installation method] 
https://harrybark.tistory.com/8

### [nginx - Installation method]
  You must run this command in the cmd window with **administrator**
  ```bash
  choco -nginx
 ```

 or
 
  ```bash
  choco install nginx
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
    #**you must change this include line**
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
~/projectdirectory/frontend  npm install
~/projectdirectory/frontend  npm run build
~/projectdirectory/frontend  serve -s build
(venv)~/projectdirectory  uvicorn backend:app --host localhost --port 8000

Command in powershell run with **administrator**.
Start-Service nginx

Access to the **http://localhost/** in your browser.
```

If you don't see the screen you want, try running the commands below again.
Turn off localhost:3000 server and localhost:8000 server using ctrl + c

```bash
~/projectdirectory/frontend  serve -s build
(venv)~/projectdirectory  uvicorn backend:app --host localhost --port 8000
Restart-Service nginx

Access to the **http://localhost/** in your browser.
```

![image](https://github.com/Hyeple/Git_filemanager/assets/86519064/b85e962b-54ff-4ece-9a41-f25bc4b4ea61)

If you see a screen like this, it means that it has been executed correctly.
