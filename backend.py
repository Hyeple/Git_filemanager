from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
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
import requests
from collections import deque

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
    git_types : dict[str] # git_types_dict
    git_type: str
    size: float  # float으로 변경(int 숫자 범위)
    last_modified: str
    path: str # file_path

    git_types[path] = git_type


# FileItem inherit 클래스 만들기
class GitItem(FileItem):
    repoPath: str # git_path
    newPath: str # after moving path
    commitMsg: str # commit mesage
    file_paths: list[str] # file_path_list
    https: str # cloning https
    username: str # username for private clone
    access_token: str # token for private clone


path_stack = deque() # path_stack 선언


def sort_key(item: FileItem) -> str:
    locale.setlocale(locale.LC_COLLATE, 'ko_KR.UTF-8')
    return locale.strxfrm(item.name)


@app.get("/api/root_files", response_model=List[FileItem])
async def get_files(path: FileItem):
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

        # If the directory isn't the root directory, add the go_back_item
        if directory != "C:\\":
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
                        if full_path in repo.untracked_files:
                            git_type = "untracked"
                        elif full_path in [d.a_path for d in diff_staged]:
                            git_type = "staged"
                        elif full_path in [d.a_path for d in diff_index]:
                            git_type = "modified"
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

                item = FileItem(key=key, name=entry.name, file_type=file_type,git_type=git_type, size=file_size, last_modified=last_modified, path=path)
                
                if file_type == "folder":
                    folders.append(item)
                else:
                    files.append(item)

        return folders + files
    
    except Exception as e:
        #logging.error(f"Error occurred: {str(e)}")  # 로깅 레벨을 error로 설정
        raise HTTPException(status_code=500, detail=str(e))


# push path_stack
@app.post("/api/push_path")
async def push_path(path: FileItem):
    path_stack.append(path.path)
    logging.info(f"Path_Stack: {path_stack}")   # path_stack에 push 잘 되나 출력.
    return {"message": "Path pushed successfully"}


# path_reset
@app.post("/api/reset_path_stack")
async def reset_path_stack():
    path_stack.clear()  # 새로 고침하면 path_stack 초기화
    return {"message": "Path stack reset successfully"}


#git_init
@app.post("/api/init_repo")
async def init_repo(request: GitItem):
    path = request.path
    git_types = request.git_types
    git_type = request.git_type

    #logging.info(f"INIT_PATH: {path_str}")

    if path == "C:/":
        raise HTTPException(status_code=400, detail="Cannot initialize repository in root directory")

    try:
        #logging.info(f"try문 로깅: {path}")
        # Initialize the directory as a git repository
        repo = Repo.init(path)
        # Create an empty commit
        repo.index.commit("Initial commit") #Ref 'HEAD' did not resolve to an object 오류 해결
        # 딕셔너리의 키 값으로 경로를 사용하는 방법
        git_types[path] = git_type
        # git_init 이후의 파일 상태는 untracked
        git_type = "untracked"
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Repository initialized successfully"}


# git_add
@app.post("/api/git_add")
async def git_add(request: GitItem):
    git_path = request.repoPath
    file_path = request.path
    git_type = request.git_type
    git_types = request.git_types

    # Check if the path is a valid directory
    if not os.path.exists(git_path) or not os.path.isdir(git_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    try:
        repo = Repo(git_path)
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=400, detail="The directory is not a valid git repository")

    # Try to add the file
    try:
        repo.git.add(file_path)
        # 딕셔너리의 키 값으로 경로를 사용하는 방법
        git_types[file_path] = git_type
        # git_add 하면 파일 상태는 staged
        git_type = "staged"
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "File added successfully"}


# git_restore_staged (restore)
@app.post("/api/git_restore_staged")
async def git_restore(request: GitItem):
    git_path = request.repoPath
    file_path = request.path
    git_type = request.git_type
    git_types = request.git_types

    # 딕셔너리의 키 값으로 경로를 사용하는 방법
    git_types[file_path] = git_type

    # Check if the path is a valid directory
    if not os.path.exists(git_path) or not os.path.isdir(git_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    try:
        repo = Repo(git_path)
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=400, detail="The directory is not a valid git repository")

    # Try to restore the file
    try:
        repo.git.restore("--staged", file_path)
        # 딕셔너리의 키 값으로 경로를 사용하는 방법
        git_types[file_path] = git_type
        # unstage 된 파일의 상태는 modified
        git_type = "modified"
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "File restored successfully"}


#git_undo_modify (restore)
@app.post("/api/git_undo_modify")
async def git_undo_modify(request: GitItem):
    git_path = request.repoPath
    file_path = request.path
    git_type = request.git_type
    git_types = request.git_types

    # Check if the path is a valid directory
    if not os.path.exists(git_path) or not os.path.isdir(git_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    try:
        repo = Repo(git_path)

    except InvalidGitRepositoryError:
        raise HTTPException(status_code=400, detail="The directory is not a valid git repository")

    # Try to undo the modification
    try:
        repo.git.restore(file_path)
        # 딕셔너리의 키 값으로 경로를 사용하는 방법
        git_types[file_path] = git_type
        # git_undo_modify 이후 파일의 상태는 수정하기 이전의 상태
        git_type = git_types.get(file_path, "")
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    # git_type = git_types.get(file_path, "")

    return {"message": "Undone Modification successfully"}


#git_rm --cached (untrack)
@app.post("/api/git_remove_cached")
async def git_remove(request: GitItem):
    git_path = request.repoPath
    file_path = request.path

    # Check if the path is a valid directory
    if not os.path.exists(git_path) or not os.path.isdir(git_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    try:
        repo = Repo(git_path)
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=400, detail="The directory is not a valid git repository")

    # Try to remove the file from the index
    try:
        repo.git.rm("--cached", file_path)
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "File removed from index successfully"}


#git_rm
@app.post("/api/git_remove")
async def git_remove(request: GitItem):
    git_path = request.repoPath
    file_path = request.path

    # Check if the path is a valid directory
    if not os.path.exists(git_path) or not os.path.isdir(git_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    try:
        repo = Repo(git_path)
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=400, detail="The directory is not a valid git repository")

    # Try to remove the file
    try:
        repo.git.rm(file_path)
        repo.index.commit("Remove file from index")
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "File removed successfully"}


#git_mv
@app.post("/api/git_move")
async def git_rename(request: GitItem):
    git_path = request.repoPath
    old_file_path = request.path
    new_file_path = request.newPath
    git_type = request.git_type
    git_types = request.git_types

    # Check if the path is a valid directory
    if not os.path.exists(git_path) or not os.path.isdir(git_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    try:
        repo = Repo(git_path)
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=400, detail="The directory is not a valid git repository")

    # Try to move the file
    try:
        repo.git.mv(old_file_path, new_file_path)
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "File renamed successfully"}


#git_commit
@app.post("/api/git_commit")
async def git_commit(request: GitItem):
    git_path = request.repoPath
    commit_message = request.commitMsg
    file_paths = request.file_paths
    git_type = request.git_type
    git_types = request.git_types

    # Check if the path is a valid directory
    if not os.path.exists(git_path) or not os.path.isdir(git_path):
        raise HTTPException(status_code=404, detail="Directory not found")

    try:
        repo = Repo(git_path)
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=400, detail="The directory is not a valid git repository")

    # Add files to staging area
    for file_path in file_paths:
        try:
            logging.info(f"committed path: {file_path}")
            repo.git.add(file_path)
        except GitCommandError as e:
            raise HTTPException(status_code=500, detail=str(e))
        
    # 딕셔너리의 키 값으로 경로를 사용하는 방법
    git_types[file_path] = git_type

    # Commit changes
    try:
        repo.index.commit(commit_message)
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Files committed successfully"}


@app.post("/api/get_staged_files")
async def get_staged_files(repo_path: GitItem):
    path_str = repo_path.path
    #logging.info(f"GET_STAGED_FILES_PATH: {path_str}")

    try:
        repo = Repo(path_str)
        staged_files = []
        for item in repo.index.diff("HEAD"):
            file_path = os.path.join(path_str, item.a_path)
            if os.path.isfile(file_path):
                file_size = os.path.getsize(file_path)
                last_modified = datetime.datetime.fromtimestamp(
                    os.path.getmtime(file_path)).strftime("%Y-%m-%d %H:%M:%S")
                staged_files.append({
                    'key': len(staged_files),
                    'name': item.a_path,
                    'file_type': 'file',
                    'git_type': 'staged',
                    'size': file_size,
                    'last_modified': last_modified
                })

        return {"files": staged_files}

    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"message": "Staged files fetched successfully"}


@app.post("/api/git_root_path")
async def get_git_root_path(item: GitItem):
    try:
        repo = Repo(item.path, search_parent_directories=True)
        git_root_path = repo.git.rev_parse("--show-toplevel")
        return {"git_root_path": git_root_path}
    except InvalidGitRepositoryError:
        raise HTTPException(status_code=400, detail="The directory is not a valid git repository")


@app.get("/{path:path}", include_in_schema=False)
async def catch_all(path: str):
    return FileResponse("frontend/build/index.html")


@app.get("/")
async def read_root():
    return FileResponse("frontend/build/index.html")


# Feature 4

@app.post("/api/public_clone")
async def public_clone(request: GitItem):
    path = request.path
    clone_link = request.https

    try:
        Repo.clone_from(clone_link, path)

        return {"message": "Clone Successfully"}
    
    except GitCommandError as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Repo.clone(url, path)
# > clone in url to path


@app.get("/api/repo_status")
async def get_repo_status(request: GitItem):
    clone_link = request.https
    access_token = request.access_token

    headers = {
        'Authorization': f'token {access_token}',
    }

    try:
        response = requests.get(clone_link, headers = headers)

        if response.status_code == 200:
            return {'public': response.json()["private"] == False}
        elif response.status_code == 404:
            return {'error': 'Repository does not exist or not access have'}
        else:
            return {'error': 'Error occured'}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# for this api, we need to import requests >> install

# to access git repository and get private or public,
# this api need access_token early

# if repo is public, 'public': 'True' / if repo is private, 'public': 'False'
# if repo does not exist or does not have access : status_code == 404


@app.post("/api/private_clone")
async def private_clone(request: GitItem):
    path = request.path
    clone_link = request.https
    username = request.username
    access_token = request.access_token

    try:
        os.environ['GIT_ASKPASS'] = 'echo'
        os.environ['TOKEN'] = access_token

        Repo.clone_from(clone_link, path)

        return {"message": "Clone Successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# for private clone
# basic https >> need id and Access token
