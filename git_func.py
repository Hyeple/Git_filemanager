import subprocess
import os

repo_dir = "/mnt/c/Users/ppoo9/Desktop/oss"      # 현재 directory 주소 

# python 3.7 이상 버전이어야함.
# git이 설치되어 있어야함.



"""
git config --global user.email " 이메일 "
git config --global user.name " 이름 " 
이 부분에 대한 구현 필요
"""

def is_git_repo():
    dot_git_dir = os.path.join(repo_dir, ".git")   # .git 폴더 경로
    is_git_repo = os.path.isdir(repo_dir)          # .git 폴더가 존재하는지 여부를 확인
    return is_git_repo

def git_init():
    subprocess.run(["git", "init"], cwd=repo_dir)

def git_add_file(file_name):
    subprocess.run(["git", "add", file_name], cwd=repo_dir)     

def git_add_all():
    subprocess.run(["git", "add", "."], cwd=repo_dir)

def git_commit(commit_message):
    subprocess.run(["git", "commit", "-m", commit_message], cwd=repo_dir)
    
def git_status():    # git status --porcelain 명령어를 통해 파싱 => 새로고침할 때마다 호출해서 파일 상태 갱신
    result = subprocess.run(["git", "status", "--porcelain"], cwd = repo_dir, capture_output=True, text=True)

    # 각 파일의 상태를 저장할 딕셔너리
    statuses = {}

    for line in result.stdout.splitlines():    # 여기 없는 파일들은 unmodified 또는 committed
        status_p = line[:2]
        if status_p=='??':
            status = "Untracking"
        if status_p==' M':
            status = "Modified"
        if status_p=='A ':
            status = "Staged"        
        name = line[3:]
        statuses[name] = status

    for name, status in statuses.items():    # 

        print(name, "=", status)

