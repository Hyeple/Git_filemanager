from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi import Query
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import unquote
from typing import List
from pydantic import BaseModel
from git import Repo, GitCommandError, InvalidGitRepositoryError
import os 
from typing import Optional
import locale
import datetime
import logging
import urllib.parse
from collections import deque

path_stack = deque()

logging.basicConfig(level=logging.INFO)

app = FastAPI()

# 허용할 origin 주소들을 리스트로 입력합니다.(CORS setting)
origins = ["http://localhost", "http://localhost:3000", "http://localhost:8000", ...]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*", "OPTIONS"],
    allow_headers=["*"],
)

app.mount("/frontend/static", StaticFiles(directory="frontend/build/static"), name="static")

class FileItem(BaseModel):
    key: int
    name: str
    file_type: str
    git_type: str
    size: float  # float으로 변경(int 숫자 범위)
    last_modified: str


def sort_key(item: FileItem) -> str:
    locale.setlocale(locale.LC_COLLATE, 'ko_KR.UTF-8')
    return locale.strxfrm(item.name)


@app.get("/api/root_files", response_model=List[FileItem])
async def get_files(path: str):
    path = unquote(path)
    path = os.path.normpath(path)

    # Log the normalized path
    #logging.info(f"Normalized path: {path}")

    try:
        #logging.info(f"Received path: {path}")
        directory = os.path.abspath(os.path.join("/", path))

        # Log the absolute directory path
        #logging.info(f"Absolute directory path: {directory}")

        if not os.path.exists(directory):
            raise HTTPException(status_code=404, detail="Directory not found")

        folders = []
        files = []

        # Add a special folder item for going back
        go_back_item = FileItem(key=-1, name="..", file_type="folder", git_type="null", size=0, last_modified="")
        folders.append(go_back_item)

        try:
            repo = Repo(directory, search_parent_directories=True)
            is_git = True
        except InvalidGitRepositoryError:
            is_git = False

        with os.scandir(directory) as entries:
            entries = [entry for entry in entries]
            entries.sort(key=lambda entry: (not entry.is_dir(), entry.name))

            for key, entry in enumerate(entries):
                file_type = "folder" if entry.is_dir() else "file"
                
            # Git_Type 인식 (코드 병합 부분) git_folder
                if is_git == True :
                    if file_type == "file" : 
                        diff_index = repo.index.diff(None)
                        diff_staged = repo.index.diff("HEAD")
                        full_path = os.path.relpath(entry.path, repo.working_tree_dir).replace("\\", "/")

                        #logging.info("{full_path}")

                        if full_path in [d.a_path for d in diff_staged]:
                            git_type = "staged"
                        elif full_path in [d.a_path for d in diff_index]:
                            git_type = "modified"
                        elif full_path in repo.untracked_files:
                            git_type = "untracked"
                        else:
                            git_type = "committed"
                            
                    if file_type == "folder":
                        folder_path = entry.path
                        folder_files = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
                        untracked_folder_files = [f for f in folder_files if os.path.relpath(f, repo.working_tree_dir).replace("\\", "/") in repo.untracked_files]
                        if len(folder_files) == len(untracked_folder_files):
                            git_type = "untracked"
                        else : 
                            git_type = "tracked"


                elif is_git == False and file_type == "folder":
                    git_type = "null"

                elif is_git == False and file_type == "file" :
                    git_type = "null"
                    
                else:
                    git_type = "null"

                directory = os.path.abspath(os.path.join("/", path))


                file_size = entry.stat().st_size
                last_modified = datetime.datetime.fromtimestamp(
                    entry.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")

                item = FileItem(key=key, name=entry.name, file_type=file_type,git_type=git_type, size=file_size, last_modified=last_modified)
                
                if file_type == "folder":
                    folders.append(item)
                else:
                    files.append(item)

        return folders + files
    
    except Exception as e:
        logging.error(f"Error occurred: {str(e)}")  # 로깅 레벨을 error로 설정
        raise HTTPException(status_code=500, detail=str(e))


class Path(BaseModel):
    path: str

# push path_stack
@app.post("/api/push_path")
async def push_path(path: Path):
    path_stack.append(path.path)
    logging.info(f"Path_Stack: {path_stack}")   # path_stack에 push 잘 되나 출력.
    return {"message": "Path pushed successfully"}


# path_reset
@app.post("/api/reset_path_stack")
async def reset_path_stack():
    path_stack.clear()  # 새로 고침하면 path_stack 초기화
    return {"message": "Path stack reset successfully"}






# git_init
@app.post("/init_repo")
async def init_repo(path: Path):
    logging.info(f"INIT_PATH: {path}")
    # Check if the repo_path is a valid directory
    if not os.path.exists(path) or not os.path.isdir(path):
        logging.error(f"INIT_PATH: {path}")
        raise HTTPException (status_code=404, detail="Directory not found")

    try:
        # Initialize the directory as a git repository
        Repo.init(path)
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Repository initialized successfully"}





# git_add
class AddItem(BaseModel):
    path: str
    file_path: str

@app.post("/api/git_add")
async def git_add(path: str, file_path: str): # path means git repository path. file_path means directory path.
    # Check if the path is a valid directory
    if not os.path.exists(path) or not os.path.isdir(path):
        raise HTTPException(status_code=404, detail="Directory not found")

    try:
        repo = Repo(path)
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=400, detail="The directory is not a valid git repository")

    # Try to add the file
    try:
        repo.git.add(file_path)
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "File added successfully"}


# git_commit
class CommitItem(BaseModel):
    path: str
    message: str

@app.post("/api/commit") # 스테이징된 파일이라면 커밋이 가능하다!
async def commit(item: CommitItem):
    # Check if the path is a valid directory
    if not os.path.exists(item.path) or not os.path.isdir(item.path):
        raise HTTPException(status_code=404, detail="Directory not found")

    try:
        repo = Repo(item.path)
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=400, detail="The directory is not a valid git repository")

    # Check if there are any staged files
    diff_index = repo.index.diff(None)
    if len(diff_index) == 0:
        raise HTTPException(status_code=400, detail="No files staged for commit")

    # Try to commit
    try:
        repo.index.commit(item.message)
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Commit successful"}


# git_restore
class RestoreItem(BaseModel):
    path: str
    file_path: str


@app.post("/api/git_restore")
async def git_restore(item: RestoreItem):
    # Check if the path is a valid directory
    if not os.path.exists(item.path) or not os.path.isdir(item.path):
        raise HTTPException(status_code=404, detail="Directory is not found.")
    
    try:
        repo = Repo(item.path)
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=400, detail="The Directory is not a repository.")
    
    try:
        repo.git.restore(item.file_path)
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    return {"message" : "File restored successfully."}


@app.get("/{path:path}", include_in_schema=False)
async def catch_all(path: str):
    return FileResponse("frontend/build/index.html")


@app.get("/")
async def read_root():
    return FileResponse("frontend/build/index.html")