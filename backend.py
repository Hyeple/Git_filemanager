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