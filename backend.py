from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi import Query
from fastapi import Body
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from git import Repo, GitCommandError, InvalidGitRepositoryError
from urllib.parse import unquote
from typing import List
from pydantic import BaseModel
import os
import locale
import datetime
import logging

logging.basicConfig(level=logging.INFO)

app = FastAPI()

# 허용할 origin 주소들을 리스트로 입력합니다.(CORS setting)
origins = ["http://localhost", "http://localhost:3000", "http://localhost:8000", ...]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/frontend/static", StaticFiles(directory="frontend/build/static"), name="static")

class FileItem(BaseModel):
    key: int
    name: str
    fileType: str
    gitType: str
    size: float  # change int to float for large file sizes
    last_modified: str


def sort_key(item: FileItem) -> str:
    locale.setlocale(locale.LC_COLLATE, 'ko_KR.UTF-8')
    return locale.strxfrm(item.name)


@app.get("/api/root_files", response_model=List[FileItem])
async def get_files(path: str):
    path = unquote(path)
    path = os.path.normpath(path)

    try:
        logging.info(f"Received path: {path}")
        directory = os.path.abspath(os.path.join("/", path))

        if not os.path.exists(directory):
            raise HTTPException(status_code=404, detail="Directory not found")

        folders = []
        files = []

        with os.scandir(directory) as entries:
            for entry in entries:
                if entry.name.startswith(".") or entry.name == "__pycache__" or entry.name.startswith("$"):
                    continue

                file_type = "folder" if entry.is_dir() else "file"
                file_size = entry.stat().st_size
                last_modified = datetime.datetime.fromtimestamp(
                    entry.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")

                if file_type == "folder":
                    folders.append(FileItem(key=len(files), name=entry.name, type=file_type, size=file_size, last_modified=last_modified))
                else:
                    files.append(FileItem(key=len(files), name=entry.name, type=file_type, size=file_size, last_modified=last_modified))

        folders.sort(key=sort_key)
        files.sort(key=sort_key)

        return folders + files
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/{path:path}", include_in_schema=False)
async def catch_all(path: str):
    return FileResponse("frontend/build/index.html")


@app.get("/")
async def read_root():
    return FileResponse("frontend/build/index.html")

# get filelist api
@app.get("/api/files")
async def get_files(path: str):
    path = unquote(path)
    path = os.path.normpath(path)

# we must choose to use path for absolute or relative path
    try:
        logging.info(f"Received path: {path}")
        directory = os.path.abspath(os.path.join("/", path))

        if not os.path.exists(directory):
            raise HTTPException(status_code=404, detail="Directory not found")

        # path is relative path & directory is absolute path
        file_list = Path(path)
        files = []
        key = 0
        for file in file_list.iterdir():
            if not (file.name.startswith(".") or file.name == "__pycache__" or file.name.startswith("$")):
                files.append({
                    "key": key,
                    "name": file.name,
                    "size": file.stat().st_size,
                    "last_modified": datetime.datetime.fronttimestamp(
                        file.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
                    "fileType": "folder" if file.is_dir() else "file",
                    "gitType": []  # empty > will get if in git repo
                })
                key += 1  # increase the key for next file

# search_parent_directories option is to search whether parent directory have .git or not
# if this option is false, Repo check only this path
        try:
            repo = Repo(path, search_parent_directories=True)
            is_git = True
        except InvalidGitRepositoryError:
            is_git = False

        if is_git:
            for file in files:
                if file["fileType"] == "file":
                    diff_index = repo.index.diff(None)
                    diff_staged = repo.index.diff("HEAD")
                    if file["name"] in [d.a_path for d in diff_staged]:
                        file["gitType"] = "staged"
                    elif file["name"] in [d.a_path for d in diff_index]:
                        file["gitType"] = "modified"
                    elif file["name"] in repo.untracked_files:
                        file["gitType"] = "untracked"
                    else:
                        file["gitType"] = "committed"

        locale.setlocale(locale.LC_COLLATE, 'ko_KR.UTF-8')
        dir = sorted([f for f in files if os.path.isdir(os.path.join(path, f["name"]))], key=lambda x: locale.strxfrm(x["name"]))
        file = sorted([f for f in files if os.path.isfile(os.path.join(path, f["name"]))], key=lambda x: locale.strxfrm(x["name"]))
        entire_list = dir + file

        return entire_list
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# check is managed to git
@app.get("/is_git_repo")
async def is_git_repo(path: str):
    path = unquote(path)
    path = os.path.normpath(path)

    try:
        directory = os.path.abspath(os.path.join("/", path))
        Repo(directory, search_parent_directories=True)
        return True
    except InvalidGitRepositoryError:
        return False

# Git repo create
# for coherence, error message can be changed for ahead code
@app.post("/init_repo")
async def init_repo(path: str):
    path = unquote(path)
    path = os.path.normpath(path)

    directory = os.path.abspath(os.path.join("/", path))
    if not os.path.exists(directory) or not os.path.isdir(directory):
        return JSONResponse(content={"error": "Invalid path"}, status_code=404)

    try:
        Repo.init(directory)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    return {"message": "Git repository initialized"}

#git commit >> git commit -m "message"
@app.post("/git_commit")
async def git_commit(path: str, message: str):
    path = unquote(path)
    path = os.path.normpath(path)
    try:
        directory = os.path.abspath(os.path.join("/", path))
        repo = Repo(directory, search_parent_directories=True)
        repo.git.commit('-m', message)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    return {"message": "Changes committed"}

# git add actives for modified files and unctracked files
# we can know success about this activation for return message
# path is directory of this file (absolute path) , file is fileName
@app.post("/git_add")
async def git_add(path: str, file: str):
    path = unquote(path)
    path = os.path.normpath(path)
    try:
        directory = os.path.abspath(os.path.join("/", path))
        repo = Repo(directory, search_parent_directories=True)
        full_path = os.path.join(directory, file)
        repo.git.add(full_path)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    return {"message": "File added to staging area"}

# git restore and git rm have optional menu
# >> git restore --staged && git rm --cached

# staged var have default value false >> true: git restore --staged
# we may add path exception handling
@app.post("/git_restore")
async def git_restore(path: str, file: str, staged: bool = False):
    path = unquote(path)
    path = os.path.normpath(path)
    try:
        directory = os.path.abspath(os.path.join("/", path))
        repo = Repo(directory, search_parent_directories=True)
        full_path = os.path.join(directory, file)
        if staged:
            repo.git.restore(full_path, staged=True)
        else:
            repo.git.restore(full_path)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    return {"message": "File restored"}

# it has same optional handler with git restore
@app.post("/git_rm")
async def git_rm(path: str, file: str, cached: bool = False):
    path = unquote(path)
    path = os.path.normpath(path)
    try:
        directory = os.path.abspath(os.path.join("/", path))
        repo = Repo(directory, search_parent_directories=True)
        full_path = os.path.join(directory, file)
        if cached:
            repo.git.rm(full_path, cached=True)
        else:
            repo.git.rm(full_path)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    return {"message": "File removed"}

# repo_path: repository / old_path: old name / new_path: new name
@app.post("/git_mv")
async def git_mv(repo_path: str, old_name: str, new_name: str):
    repo_path = unquote(repo_path)
    repo_path = os.path.normpath(repo_path)
    try:
        directory = os.path.abspath(os.path.join("/", repo_path))
        repo = Repo(directory, search_parent_directories=True)

        old_path = os.path.join(directory, old_name)
        new_path = os.path.join(directory, new_name)
        repo.git.mv(old_path, new_path)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

    return {"message": "File renamed"}


# with commit, browser must show list of staged changes
# get staged changes for list 
@app.get("/staged_changes")
async def get_staged_changes(path: str):
    path = unquote(path)
    path = os.path.normpath(path)
    try:
        directory = os.path.abspath(os.path.join("/", path))
        repo = Repo(directory, search_parent_directories=True)
        diff_staged = repo.index.diff("HEAD")
        staged_changes = [d.a_path for d in diff_staged]
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# if staged_changes want to show order of fileName
    # locale.setlocale(locale.LC_COLLATE, 'ko_KR.UTF-8')
    # staged_changes = sorted([d.a_path for d in diff_staged], key=locale.strxfrm)
    return staged_changes


# "/" >> starting file browser in root directory
# when rendering directory (& files), we must check whether
# the directory created git repository or not >> '/is_repo'
# >> may show different interface (in git repo or not)

# if the directory is not have .git yet, we can make git repository
# with left creation button >> we can see another interface
# (left: commit && changes | center: modified icon with git status
#  right: have different menu with git status) >> '/init_repo'

# if we show icon of files differently, each file should get
# own git status => return status >> '/git_status'
# it may be have these orders
# -> click add button >> '/git add' >> update UI >> to update UI,
# we may check with '/git_status' >> update

# version controlling
# untracked file: git add (untracked > staged) >> '/git_add'

# modified file : git add (modified > staged) >> '/git_add'
# && git restore (modified > unmodified) >> '/git_restore'

# staged file : git restore --staged (staged > modified | untracked)
# >> '/git_restore(staged = True)'

# commited or unmodified file : git rm (unmodified > remove & staged)
# >> '/git_rm'  && git rm --cached (unmodified > untracked)
# >> '/git_rm (cached = True)'
# git mv >> '/git_mv' (with path)

# to commit >> '/git_commit'
# in file browser, user will write commit message and use commit button..
# we must show the list of staged changes >> '/staged_changes'
# and git commit and get return message >> show browser updating display