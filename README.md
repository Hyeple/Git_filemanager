# OSS Project 1

## Installation

#lists
#[python - Installation method] (https://wikidocs.net/8)

#[node - Installation method] (https://offbyone.tistory.com/441)

#[nginx - Installation method] (https://taewooblog.tistory.com/entry/%EC%9C%88%EB%8F%84%EC%9A%B0-10%EC%97%90-nginx-%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0)

# libraries
python : venv, fastapi, uvicorn, gitpython
node : axios


#libraries install
pip install venv
pip install fastapi
pip install uvicorn
pip install gitpython


## Settings

```bash
You need to modify 'nginx.conf' to match the setting of nginx to 'default.conf'.

First, find the location of nginx.conf. It is usually located in the conf folder of the installation file.
```
![nginx_conf](https://github.com/Hyeple/Git_filemanager/assets/102994654/a7f3fb34-1251-4493-9cf5-02393a7894fd)

```bash
Second, you need to modify the 'include' statement in the HTTP paragraph. Adds a 'path' to refer to the location of default.conf.
```

![modify_include](https://github.com/Hyeple/Git_filemanager/assets/102994654/da2b525e-1691-4c48-9997-f8cf20f20950)

```bash
Third, you must 'annotate' or 'clear' the server paragraph within the HTTP paragraph.
```

![server_para](https://github.com/Hyeple/Git_filemanager/assets/102994654/82dc118d-06af-4799-8a8b-f60319a2e30f)


## Run

```bash
#preparation
You need two powershell windows and one powershell which run as 'administrator'.

~/projectdirectory  python -m venv venv 
~/projectdirectory  venv/Scripts/activate  'activate venv'
(venv)~/projectdirectory  pip install fastapi
(venv)~/projectdirectory  pip install uvicorn
(venv)~/projectdirectory  pip install gitpython
~/projectdirectory/frontend  npm install axios
~/projectdirectory/frontend  npm install --global serve
~/projectdirectory/frontend  yarn
~/projectdirectory/frontend  npm run build
~/projectdirectory/frontend  serve -s build
(venv)~/projectdirectory  uvicorn backend:app --host localhost --port 8000

Command in powershell run with 'administrator'.
Start-Service nginx

Access to the 'http://localhost/' in your browser.
```
