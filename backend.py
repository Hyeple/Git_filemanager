from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi import Query
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
    type: str
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

        files = []

        with os.scandir(directory) as entries:
            for entry in entries:
                if entry.name.startswith(".") or entry.name == "__pycache__" or entry.name.startswith("$"):
                    continue

                file_type = "folder" if entry.is_dir() else "file"
                file_size = entry.stat().st_size
                last_modified = datetime.datetime.fromtimestamp(
                    entry.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S")

                files.append(FileItem(key=len(files), name=entry.name, type=file_type, size=file_size, last_modified=last_modified))

        files.sort(key=sort_key)
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
        files = [
            {
            # if we need key value (like order), add key element
            "name": file.name,
            "size": file.stat().st_size,
            "last_modified": datetime.datetime.fronttimestamp(
                file.stat().st_mtime).strftime("%Y-%m-%d %H:%M:%S"),
            # directory: true   file: false
            "type": file.is_dir()
        }
        for file in file_list.iterdir()
        if not (file.name.startswith(".") or file.name == "__pycache__" or file.name.startswith("$"))
        ]

# search_parent_directories option is to search whether parent directory have .git or not
# if this option is false, Repo check only this path
        try:
            repo = Repo(path, search_parent_directories=True)
            is_git = True
        except InvalidGitRepositoryError:
            is_git = False

        if is_git:
            for file in files:
                if not file["type"]:
                    if file["name"] in repo.untracked_files:
                        file["status"].append("untracked")

                    diff_index = repo.index.diff(None)
                    if file["name"] in [d.a_path for d in diff_index]:
                        file["status"].append("modified")

                    diff_staged = repo.index.diff("HEAD")
                    if file["name"] in [d.a_path for d in diff_staged]:
                        file["status"].append("staged")

                    if not file["status"]:
                        file["status"].append("committed")

        locale.setlocale(locale.LC_COLLATE, 'ko_KR.UTF-8')
        dir = sorted([f for f in files if os.path.isdir(os.path.join(path, f["name"]))], key=lambda x: locale.strxfrm(x["name"]))
        file = sorted([f for f in files if os.path.isfile(os.path.join(path, f["name"]))], key=lambda x: locale.strxfrm(x["name"]))
        entire_list = dir + file

        return {"file_list": entire_list} # or entire_list
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/{path:path}", include_in_schema=False)
async def catch_all(path: str):
    return FileResponse("frontend/build/index.html")


@app.get("/")
async def read_root():
    return FileResponse("frontend/build/index.html")

## 밑에 부분은 쿼리 받으면 동작하는 코드들. 쿼리문 바뀌면 다시 바꿔서 테스트 해보겠습니다.

## file upload
# @app.post("/upload/")
# async def upload_file(file: UploadFile = File(...)):
#     with open(f"static/{file.filename}", "wb") as f:
#         f.write(await file.read())
#     return {"filename": file.filename}


##file delete
# @app.delete("/delete/{filename}")
# async def delete_file(filename: str):
#     if os.path.exists(f"static/{filename}"):
#         os.remove(f"static/{filename}")
#         return {"status": "File deleted successfully"}
#     else:
#         return {"status": "File not found"}