from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from fastapi import Query
import os
from pathlib import Path

app = FastAPI()

app.mount("/frontend/static", StaticFiles(directory="frontend/build/static"), name="static")

@app.get("/{path:path}", include_in_schema=False)
async def catch_all(path: str):
    return FileResponse("frontend/build/index.html")

@app.get("/")
async def read_root():
    return FileResponse("frontend/build/index.html")


# file listing 
@app.get("/root-directory")
async def get_root_directory():
    root_directory = os.path.abspath(os.sep)
    return {"root_directory": root_directory}

@app.get("/api/files")
async def get_files(path: str):
    try:
        file_list = os.listdir(path)
        file_list_with_type = []
        for file_name in file_list:
            file_path = os.path.join(path, file_name)
            file_type = "directory" if os.path.isdir(file_path) else "file"
            file_list_with_type.append({"name": file_name, "type": file_type})
        return file_list_with_type
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


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