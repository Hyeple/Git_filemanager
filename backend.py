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
    allow_methods=["*", "OPTIONS"],
    allow_headers=["*"],
)

app.mount("/frontend/static", StaticFiles(directory="frontend/build/static"), name="static")

class FileItem(BaseModel):
    key: int
    name: str
    file_type: str
    git_type: str
    size: float  # change int to float for large file sizes
    last_modified: str


def sort_key(item: FileItem) -> str:
    locale.setlocale(locale.LC_COLLATE, 'ko_KR.UTF-8')
    return locale.strxfrm(item.name)


@app.get("/api/root_files", response_model=List[FileItem])
async def get_files(path: str):
    path = unquote(path)
    path = os.path.normpath(path)

    # Log the normalized path
    logging.info(f"Normalized path: {path}")

    try:
        logging.info(f"Received path: {path}")
        directory = os.path.abspath(os.path.join("/", path))

        
        # Log the absolute directory path
        logging.info(f"Absolute directory path: {directory}")

        if not os.path.exists(directory):
            raise HTTPException(status_code=404, detail="Directory not found")

        folders = []
        files = []

        with os.scandir(directory) as entries:
            entries = [entry for entry in entries if not entry.name.startswith(".") and not entry.name == "__pycache__" and not entry.name.startswith("$")]
            entries.sort(key=lambda entry: (not entry.is_dir(), entry.name))

            for key, entry in enumerate(entries):
                file_type = "folder" if entry.is_dir() else "file"
                git_type = "null"
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
    
path_stack = [] # path 를 저장하는 stack

class Path(BaseModel):
    path: str

@app.post("/api/push_path")
async def push_path(path: Path):
    path_stack.append(path.path)
    return {"message": "Path pushed successfully"}

@app.post("/api/pop_path")
async def pop_path():
    if path_stack:
        return {"path": path_stack.pop()}
    else:
        return {"message": "No more paths in the stack"}


@app.get("/{path:path}", include_in_schema=False)
async def catch_all(path: str):
    return FileResponse("frontend/build/index.html")


@app.get("/")
async def read_root():
    return FileResponse("frontend/build/index.html")