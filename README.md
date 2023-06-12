
<div align="center">
 
# OSS Project : 📁Git_FileManager

 
<img src="https://img.shields.io/badge/node.js-339933?style=flat-square&logo=node.js&logoColor=white"/>  <img src="https://img.shields.io/badge/react-61DAFB?style=flat-square&logo=react&logoColor=white"/> <img src="https://img.shields.io/badge/typescript-3178C6?style=flat-square&logo=typescript&logoColor=white"/>  <img src="https://img.shields.io/badge/python-3776AB?style=flat-square&logo=python&logoColor=white"/>  <img src="https://img.shields.io/badge/fastapi-009688?style=flat-square&logo=fastapi&logoColor=white"/>   <img src="https://img.shields.io/badge/electron-47848F?style=flat-square&logo=electron&logoColor=white"/>  
 
<a href="https://github.com/Hyeple/Git_filemanager/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Hyeple/Git_filemanager" />
</a>
 
 <br/>
 
 ![ezgif com-gif-maker](https://github.com/Hyeple/Git_filemanager/assets/86519064/81033036-f41c-4f96-acdd-84636d0d191f)
 
 
 </div>
 
 <br/>
 
This program is a Git file manager designed to run on the <img src="https://img.shields.io/badge/windows_10,_11-0078D6?style=flat-square&logo=windows&logoColor=white"/> environment.
Please run it on a Windows system. 

Git_filemanager is a simple GUI-based git repository management program. 
It enables you to manage files on your computer's C drive. 
It offers functionalities such as file Git repository initialization, and various Git actions to assist you in file management using Git. 

<br/>


 
<br/>


## 📄 Documentation
<img src="https://img.shields.io/badge/notion-000000?style=flat-square&logo=notion&logoColor=white"/> https://hw-ple.notion.site/OSS-Project-2-138ed9345e89404c96ce6bb5e2c6ce17

<br/>

## 🔎 Functions

<v1.0>

📎**Download Link**

```v1.0``` https://github.com/Hyeple/Git_filemanager/releases/tag/v1.0


- File explorer(File browser)
  > This program provides a GUI for browsing files and directories on your computer's C drive.
  >
	- The file browsing starts from the C drive.
	- A user can browse a directory by clicking.

- Git Repository Creation 
  > The service supports to turn any local directory into a git repo.
  > 
	- It provides a menu for a git repo creation only if a current directory in the browser is not managed by git yet.

- Version Controlling of a Git Repository
  > This program can execute the following **git command**
    - `git init`
    - `git add`             
    - `git commit`              
    - `git mv`
    - `git rm`             
    - `git rm —cached` 
    - `git restore`    
    - `git restore —staged`

<br/>


<v2.0> 🌟New Update!🌟

📎**Download Link**

```v2.0``` https://github.com/Hyeple/Git_filemanager/releases/tag/v2.0

- Git branch management

  > This program supports the branch management of a git repository
  > 
	- `git branch {branch_name}`
    - `git branch -D {branch_name}`
    - `git branch -m {old_name} {new_name}`
    - `git checkout {branch_name}`
    - `git merge {branch_name}`
        
- Git branch merge (not rebase)

  > This program supports to merge two branches
  > 
    - It provides a menu to merge a target branch to the current branch.
    - It provides branch list to user
    - It then attempts to merge the selected branches
    - If success, It provides the user with a success message
    - Otherwise, It provides the user with an error message
    - If the merge is failed due to conflict, it provides the user with unmerged paths and simply aborts the merge process

- Git commit history

  > This program shows the commit history of a project in the form of a simplified graph
  >
	- Each commit object in the graph includes its author name and message.
    - If a user chooses a commit object, then it provides the detailed information about the commit	

- Git clone from Github
  > The service provides a functionality to clone a git repo from Github to local
  >
	- When cloning a public repo, you only need to enter the address of the remote repo.
	- When cloning a private repo, you must enter the user's name and access token, not just the address of the remote repo.

<br/>


## 💻 Installation

### lists

### [python - Installation method] 
https://wikidocs.net/8

### [node - Installation method] 
https://offbyone.tistory.com/441


<br/>


 ## 📖 Libraries
 
 |libraries|description|
 |---|-----|
 |[**fastapi**](https://fastapi.tiangolo.com/ko/)|FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.7+ based on standard Python type hints.|
 |[**gitPython**](https://gitpython.readthedocs.io/en/stable/)|GitPython is a python library used to interact with git repositories, high-level like git-porcelain, or low-level like git-plumbing.|
 |[**pyGithub**](https://github.com/PyGithub/PyGithub)|PyGitHub is a Python library to access the GitHub REST API. This library enables you to manage GitHub resources such as repositories, user profiles, and organizations in your Python applications.|
 |[**electron**](https://github.com/electron/electron)|The Electron framework lets you write cross-platform desktop applications using JavaScript, HTML and CSS. It is based on Node.js and Chromium and is used by the Atom editor and many other apps.|
 

**📌 Installation**

pip install -r requirements.txt



<br/>


## ⚙️ Execution

- **powershell - 1**
```bash
~/projectdirectory/frontend  serve -s build
```

 
- **⚠️ If the command "serve-s build" doesn't work, check your computer's firewall or security program first. If you still have problems afterwards, type in the commands below in order.⚠️**
```bash
~/projectdirectory/frontend> yarn
~/projectdirectory/frontend> npm install
~/projectdirectory/frontend> yarn build
~/projectdirectory/frontend> serve -s build
```


- **powershell - 2**
 ```bash
 ~/projectdirectory>  python -m venv venv 
 ~/projectdirectory> venv/Scripts/activate    **activate venv**
 (venv)~/projectdirectory>  pip install -r requirements.txt
 (venv)~/projectdirectory>  uvicorn backend:app --host localhost --port 8000    ** after serve -s build**
 ```
 

- **powershell - 3**
 ```bash
 ~/projectdirectory>  npm install electron
 ~/projectdirectory>  npm run electron-start
 ```




![image](https://github.com/Hyeple/Git_filemanager/assets/102994654/dbe7ad0a-b154-41d4-b6d7-9ba869c1f55d)

If you see a screen like this, it means that it has been executed correctly.


