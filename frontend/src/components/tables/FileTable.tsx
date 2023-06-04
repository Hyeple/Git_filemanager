import React, { useState, useCallback, useEffect } from "react";
import { Modal, Button, Table, Tooltip, Input, message, Breadcrumb } from "antd";
import { PlusOutlined, RedoOutlined, DeleteOutlined, FileTextTwoTone, FolderTwoTone, EditOutlined, FolderOpenTwoTone, BranchesOutlined, FolderAddOutlined, HomeOutlined, CheckOutlined, SendOutlined, MergeCellsOutlined, HistoryOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import styled from "styled-components";
import { getFileSize } from "../../utils/number";
import axios from 'axios';

const NameWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 6px;
`;
const ActionWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StyledBreadcrumbItem = styled(Breadcrumb.Item)`
  font-size: 14px; // Adjust font size as needed
  cursor: pointer;

  .anticon {
    font-size: 16px; // Adjust icon size as needed
  }
`;

//파일 타입 받아오기 (폴더인지, 파일인지, (이건 깃 레포가 아닐 때)      언트랙인지, 모디파이드인지, 스테이징인지 커밋된건지 (이건 깃 레포일 때))
type FileType =  "folder" | "file";
type GitType = "null" | "untracked" | "modified" | "staged" | "committed" | "tracked" | "back";

type NameType = {
  fileName: string;
  type_file: FileType;
  type_git?: GitType;
};

interface FileTableDataType {
  key: React.Key;
  name: NameType;
  size: number;
  lastModified: string;
  action?: GitType;
}

const getFileIcon = (type1: FileType, type2?: GitType) => {
  switch (type1) {
    case "folder":
      switch (type2) {
        case "tracked":
          return <FolderTwoTone twoToneColor="#96F2D7" style={{ fontSize: 24 }} />;
        case "untracked":
          return <FolderTwoTone twoToneColor="#1677ff" style={{ fontSize: 24 }} />;
        case "null" :
          return <FolderTwoTone twoToneColor="lightgray" style={{ fontSize: 24 }} />;
        case "back" :
          return <FolderOpenTwoTone twoToneColor="lightgray" style={{ fontSize: 24 }} />;
        default:
          return <FolderTwoTone twoToneColor="lightgray" style={{ fontSize: 24 }} />;
      }

    case "file":
      switch (type2) {
        case "untracked":
          return <FileTextTwoTone twoToneColor="#1677ff" style={{ fontSize: 24 }} />;
        case "modified":
          return <FileTextTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 24 }} />;
        case "staged":
          return <FileTextTwoTone twoToneColor="#f7f008" style={{ fontSize: 24 }} />;
        case "committed":
          return <FileTextTwoTone twoToneColor="#96F2D7" style={{ fontSize: 24 }} />;
        case "null" :
          return <FileTextTwoTone twoToneColor="lightgray" style={{ fontSize: 24 }} />;
        default:
          return <FileTextTwoTone twoToneColor="lightgray" style={{ fontSize: 24 }} />;
      }
  }
};


//실제 돌아갈 코드 부분
interface FileTableProps {
  path: string
  onPathChange: (newDir: string) => string;
}

//api 요청으로 백엔드에서 file list 호출
async function fetchFiles(path: string) {
  try {
    const encodedPath = encodeURIComponent(path);
    const response = await axios.get(`/api/root_files?path=${encodedPath}`, {
      withCredentials: true,
    });

    if (response.status !== 200 && response.status !== 304) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = response.data;

    if (!Array.isArray(data)) {
      throw new Error("Data is not an array");
    }

    console.log("Response data:", data);

    return data;
  } catch (error) {
    console.error("Error fetching files:", error);
    return [];
  }
}

export default function FileTable( { path, onPathChange }: FileTableProps) {
  const [tableHeight, setTableHeight] = useState<number>(0);
  const [fileList, setFileList] = useState<FileTableDataType[]>([]);
  const [isRenameModalVisible, setRenameModalVisible] = useState<boolean>(false);
  const [fileToRename, setFileToRename] = useState<NameType | null>(null);
  const [newName, setNewName] = useState<string>("");
  const [stagedFiles, setStagedFiles] = useState<FileTableDataType[]>([]);
  const [stagedArea, setStagedArea] = useState<Record<string, FileTableDataType[]>>({});
  const [commitModalVisible, setCommitModalVisible] = useState<boolean>(false);
  const [pathStack, setPathStack] = useState<string[]>([path]);

  const columns: ColumnsType<FileTableDataType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (value: NameType, record: FileTableDataType) => {
        if (!value) {
          return "";
        }
        const { fileName, type_file, type_git } = value;
        const normalizePath = (parts: string) => parts.replace(/\/+/g, '/');

        return (
          <NameWrapper onClick={() => {
            if (value.fileName === "..") {
              const newPath = path;
              //console.log(newPath);
              goBack();
            } else if (type_file === "folder") {
              const newPath = normalizePath(`${path}/${record.name.fileName}`);
              if (!pathStack.includes(newPath)) {
                const newPathStack = [...pathStack, newPath];
                setPathStack(newPathStack);
                onPathChange(newPath);
              }
            }
          }}>
            {getFileIcon(type_file, type_git)}
            {fileName}
          </NameWrapper>
        );
      },
    },
    {
      title: "Size",
      dataIndex: "size",
      key: "size",
      render: (value) => {
        if (!value) {
          return "-";
        }
  
        return getFileSize(value);
      },
    },
    {
      title: "Modified Date",
      dataIndex: "lastModified",
      key: "lastModified",
    },
    {
      title: "Git Action",
      dataIndex: "action",
      key: "action",
      render: (value: GitType, record : FileTableDataType) => {
        if (!value) {
          return "";
        }
  
        switch (value) {
          case "untracked":
            if (record.name.type_file !== "file"){
              return "";
            }

            return (
              <Tooltip title="Adding the file into a staging area">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => gitAdd(record.name.fileName)}>
                  Add
                </Button>
              </Tooltip>
          );
          
          case "modified":
            return (
              <ActionWrapper>
                <Tooltip title="Adding the file into a staging area">
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => gitAdd(record.name.fileName)}>
                    Add
                  </Button>
                </Tooltip>
          
                <Tooltip title="Undoing the modification">
                  <Button icon={<RedoOutlined />} onClick = {() => gitUndoModify(record.name.fileName)}>
                    Restore
                  </Button>
                </Tooltip>
              </ActionWrapper>
          );
          
  
          case "staged":
            return (
              <ActionWrapper>
                <Tooltip title="Unstaging changes">
                  <Button icon={<RedoOutlined />} onClick = {() => gitRestore(record.name.fileName)}>
                    Restore
                  </Button>
                </Tooltip>
              </ActionWrapper>
            );
  
          case "committed":
            return (
              <ActionWrapper>
                <Tooltip title=" Untracking file">
                  <Button icon={<DeleteOutlined />} onClick = {() => gitRmCached(record.name.fileName)} danger>
                    Untrack
                  </Button>
                </Tooltip>
  
                <Tooltip title="Deleting file">
                  <Button type="primary" icon={<DeleteOutlined />} onClick = {() => gitRm(record.name.fileName)} danger>
                    Delete
                  </Button>
                </Tooltip>
                
                <Tooltip title="Renaming file">
                  <Button icon={<EditOutlined />} onClick={() => handleRenameClick(record)}>
                    Rename
                  </Button>
                </Tooltip>
              </ActionWrapper>
            );

          case "null" :
            return "";

          case "back" :
            return "";

          case "tracked" :
            return "";
        }
      },
    },
  ];


  const handleRenameClick = (record: FileTableDataType) => {
    setFileToRename(record.name);
    setRenameModalVisible(true);
  };

  const handleCancelCommitModal = () => {
    setCommitModalVisible(false);
    setNewName("");
  };

  //테이블 크기 조정용
  const updateTableHeight = () => {
    const windowHeight = window.innerHeight;
    const desiredTableHeight = windowHeight - 300;
    setTableHeight(desiredTableHeight);
  };

  useEffect(() => {
    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);

    return () => {
      window.removeEventListener("resize", updateTableHeight);
    };
  }, []);

  //파일 리스트 불러오기
  const fetchApi = useCallback(async (path: string) => {
    const data = await fetchFiles(path);
    //console.log("path: " + path);
    const files = data.map((item: any) => ({
      key: item.key,
      name: {
        fileName: item.name,
        type_file: item.file_type,
        type_git: item.git_type,
      },
      size: item.size,
      lastModified: item.last_modified,
      action: item.git_type
    }));
  
    setFileList(files as FileTableDataType[]);
  
  // Push the current path to the backend
    await axios.post("/api/push_path", { path }, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true
    });
  }, []);

  useEffect(() => {
    fetchApi(path);
  }, [fetchApi, path]);

  //돌아가기
  const goBack = useCallback(() => {
    if (pathStack.length > 0) {
      const newPathStack = [...pathStack];
      newPathStack.pop();
      setPathStack(newPathStack);
      onPathChange(newPathStack[newPathStack.length - 1] || "");
    } else {
      //console.log("No more paths in the stack");
    }
  }, [onPathChange, pathStack]);

  //breadcumb
  const handleBreadcrumbClick = useCallback((path: string) => {
    const newPathStack = pathStack.slice(0, pathStack.indexOf(path) + 1);
    setPathStack(newPathStack);
    onPathChange(newPathStack[newPathStack.length - 1] || "");
  }, [onPathChange, pathStack]);
  
  //깃타입인지 체크
  const checkGitTypes = useCallback(() => {
    return fileList.every((file) => file.name.type_git === 'null');
  }, [fileList]);
  
  // git_init
  const initRepo = () => {
    const newPathStack = [...pathStack];
    setPathStack(newPathStack);
    const newPath = onPathChange(newPathStack[newPathStack.length - 1]);
  
    path = newPath;
    axios.post("/api/init_repo", { path: newPath.toString() }, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    })
    .then((response) => {
      if (response.data.message === "Repository initialized successfully") {
        message.success(response.data.message);
        //console.log("Success!")
        //console.log(path);
        fetchApi(path); // fetch the fileList again to update the UI
      } else {
        message.error(response.data.error);
      }
    })
    .catch((error) => {
      console.error("Error initializing repository:", error);
      if (error.response && error.response.data.detail === "Cannot initialize repository in root directory") {
        message.error("Cannot initialize repository in the root directory");
      } else {
        message.error("An error occurred while initializing the repository");
      }
    });
  };

  const handleCommit = async () => {
    try {
      const gitRootPath = await getGitRootPath();
      if (!gitRootPath) {
        throw new Error("Git root path not found");
      }
  
      const response = await axios.post("/api/git_commit", {
        git_path: gitRootPath,
        commit_message: newName,
        file_paths: stagedFiles.map(file => file.name.fileName),
      }, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
  
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      message.success("Files committed successfully");
  
      // Fetch the file list again to update the UI.
      fetchApi(path);
    } catch (error) {
      console.error("Error committing files:", error);
      message.error("An error occurred while committing the files");
    } finally {
      // 모달을 닫음.
      // After committing, clear the staged area for the current path
      setStagedArea(prev => ({
        ...prev,
        [path]: [],
      }));

      setCommitModalVisible(false);
      setNewName("");
    }
  };
  
  const getGitRootPath = async () => {
    try {
      const response = await axios.post("/api/git_root_path", { path }, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = response.data;

      if (!data.git_root_path) {
        throw new Error("Git root path not found in response");
      }
      
      //console.log("Git root path:", data.git_root_path);
      return data.git_root_path;

    } catch (error) {
      console.error("Error fetching git root path:", error);
    }
  };

  const getStagedFiles = useCallback(async () => {
    try {
      const gitRootPath = await getGitRootPath();
      if (!gitRootPath) {
        throw new Error("Git root path not found");
      }

      const response = await axios.post("/api/get_staged_files", { path: gitRootPath }, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const staged = response.data.files.map((file: any) => ({
        key: file.key,
        name: {
          fileName: file.name,
          type_file: file.file_type,
          type_git: file.git_type,
        },
        size: file.size,
        lastModified: file.last_modified,
        action: file.git_type
      }));

      setStagedFiles(staged as FileTableDataType[]);
    } catch (error) {
      console.error("Error fetching staged files:", error);
    }
  }, [getGitRootPath]);

  async function gitAdd(fileName: string) {
    const filePath = `${path}/${fileName}`; // Construct the complete file path

    const git_repository_path = await getGitRootPath();
    try {
      const response = await axios.post(
        "/api/git_add",
        { git_path: git_repository_path, file_path: filePath },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      message.success("File added successfully");

      // Fetch the file list again to update the UI.
      fetchApi(path);
    } catch (error) {
      //console.log("깃 레포지토리 주소  " + git_repository_path);
      //console.log("파일 path 주소  " + filePath);
      console.error("Error adding file:", error);
      message.error("An error occurred while adding the file");
    }
  }

  async function gitRestore(fileName: string) {
    const filePath = `${path}/${fileName}`; // Construct the complete file path

    const git_repository_path = await getGitRootPath();
    try {
      const response = await axios.post(
        "/api/git_restore_staged",
        { git_path: git_repository_path, file_path: filePath },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      message.success("File restored successfully");

      // Fetch the file list again to update the UI.
      fetchApi(path);
    } catch (error) {
      //("깃 레포지토리 주소  " + git_repository_path);
      //console.log("파일 path 주소  " + filePath);
      console.error("Error restoring file:", error);
      message.error("An error occurred while restore the file");
    }
  }

  async function gitUndoModify(fileName: string) {
    const filePath = `${path}/${fileName}`; // Construct the complete file path

    const git_repository_path = await getGitRootPath();
    try {
      const response = await axios.post(
        "/api/git_undo_modify",
        { git_path: git_repository_path, file_path: filePath },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      message.success("Undone Modification successfully");

      // Fetch the file list again to update the UI.
      fetchApi(path);
    } catch (error) {
      //console.log("깃 레포지토리 주소  " + git_repository_path);
      //console.log("파일 path 주소  " + filePath);
      console.error("Error undo Modification file:", error);
      message.error("An error occurred while undone Modification the file");
    }
  }

  async function gitRmCached(fileName: string) {
    const filePath = `${path}/${fileName}`; // Construct the complete file path

    const git_repository_path = await getGitRootPath();
    try {
      const response = await axios.post(
        "/api/git_remove_cached",
        { git_path: git_repository_path, file_path: filePath },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      message.success("File removed from index successfully");

      // Fetch the file list again to update the UI.
      fetchApi(path);
    } catch (error) {
      //console.log("깃 레포지토리 주소  " + git_repository_path);
      //console.log("파일 path 주소  " + filePath);
      console.error("Error removed file from index:", error);
      message.error("An error occurred while removed the file from index");
    }
  }

  async function gitRm(fileName: string) {
    const filePath = `${path}/${fileName}`; // Construct the complete file path

    const git_repository_path = await getGitRootPath();
    try {
      const response = await axios.post(
        "/api/git_remove",
        { git_path: git_repository_path, file_path: filePath },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      message.success("File removed successfully");

      // Fetch the file list again to update the UI.
      fetchApi(path);

      // Update stagedArea
      setStagedArea(prev => ({
        ...prev,
        [git_repository_path]: [
          ...(prev[git_repository_path] || []),
          {
            key: fileName, // Or whatever key you want to use
            name: {
              fileName: fileName,
              type_file: "file", // Or whatever type the file has
              type_git: "staged", // Since we just staged it
            },
            size: 0, // Or whatever size the file has
            lastModified: new Date().toISOString(), // Or whatever modification date the file has
            action: "staged", // Since we just staged it
          }
        ]
      }));

      getStagedFiles();
    } catch (error) {
      //console.log("깃 레포지토리 주소  " + git_repository_path);
      //console.log("파일 path 주소  " + filePath);
      console.error("Error removed file:", error);
      message.error("An error occurred while removed the file");
    }
  }


  //PROJ2_START
  //피쳐4 : 현재 문제 아주 많음. api 부터 손봐야할듯?
  const [isCloneModalVisible, setCloneModalVisible] = useState(false);
  const [repoUrl, setRepoUrl] = useState("");
  
  const openCloneModal = () => {
    setCloneModalVisible(true);
  };
  
  const closeCloneModal = () => {
    setCloneModalVisible(false);
  };
  
  const handleRepoUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRepoUrl(e.target.value);
  };

  
  const getRepoDetails = (repoUrl : string) => {
    // Assume the URL is of the form "https://github.com/{user}/{repo}"
    const parts = repoUrl.split('/');
    return {
      user: parts[parts.length - 2],
      repo: parts[parts.length - 1]
    };
  };

  const handleCloneRepo = async () => {
    try {
      const { user, repo } = getRepoDetails(repoUrl);

      const response = await axios.get(`/repo/${user}/${repo}`);

      if (response.data.message === "This repository is public.") {
        console.log(`The repository at ${repoUrl} is public.`);
      } else if (response.data.message === "This repository is private.") {
        console.log(`The repository at ${repoUrl} is private.`);
      } else {
        throw new Error('Could not determine the visibility of the repository.');
      }

      // Add your cloning logic here
    } catch (error) {
      console.error("Error fetching repository visibility:", error);
      message.error("An error occurred while fetching the repository visibility");
    }

    closeCloneModal();
  };

  //피쳐1
  // 추가된 상태
  const [branchModalVisible, setBranchModalVisible] = useState<boolean>(false);
  const [newBranchName, setNewBranchName] = useState<string>("");
  const [branchList, setBranchList] = useState<string[]>([]);
  const [renameBranchMode, setRenameBranchMode] = useState<string>("");
  const [renameBranchName, setRenameBranchName] = useState<string>("");
  const [activeBranch, setActiveBranch] = useState<string>("");

  // 브랜치 생성 모달을 연다
  const openBranchModal = async () => {
    setBranchModalVisible(true);
    await fetchBranches();  // 브랜치 목록을 가져온다
  };

  // 브랜치 생성 모달을 닫는다
  const closeBranchModal = async () => {
    setBranchModalVisible(false);
    setNewBranchName("");
    setRenameBranchMode("");

    // 파일 리스트 다시 불러오기
    await fetchApi(path);
  };
  
  // 브랜치를 생성한다
  const handleCreateBranch = async () => {
    // 브랜치 이름이 비어 있거나 공백만 있다면 오류 메시지를 표시하고 반환
    if (!newBranchName || !newBranchName.trim()) {
      message.error("Branch name cannot be empty or just spaces");
      return;
    }
    
    try {
      await axios.post(`/api/branch_create`, {
        git_path: await getGitRootPath(),
        branch_name: newBranchName
      });
      setNewBranchName("");
      fetchBranches(); // 브랜치 목록을 갱신한다
    } catch (error) {
      console.error("Error creating branch:", error);
    }
  };

  // 브랜치 목록을 가져온다
  const fetchBranches = async () => {
    try {
      const response = await axios.post(`/api/branche_get`, {
        git_path: await getGitRootPath()
      });
      if (response.status === 200) {
        setBranchList(response.data);
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };

  // Fetch active branch
  const fetchActiveBranch = async () => {
    try {
      const response = await axios.post(`/api/curbranch_get`, {
        git_path: await getGitRootPath()
      });
  
      if (response.status === 200) {
        setActiveBranch(response.data.active_branch);
      } else {
        throw new Error(`API request failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Error fetching active branch:", error);
    }
  };
  
  useEffect(() => {
    fetchActiveBranch();
  }, [fetchActiveBranch]);

  // 체크아웃을 수행하는 API 호출
  async function checkoutBranch(gitPath: string, branchName: string) {
    try {
      const response = await axios.post(`/api/branch_checkout`, {
        git_path: gitPath,
        branch_name: branchName
      });

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = response.data;
      setBranchModalVisible(false);
      // 파일 리스트 다시 불러오기
      await fetchApi(path);
      console.log("Response data:", data);

      return data;
    } catch (error) {
      console.error("Error checking out branch:", error);
      return null;
    }
  }
    // 브랜치를 삭제한다
  const handleDeleteBranch = async (branchName: string) => {
    try {
      await axios.post(`/api/branch_delete`, {
        git_path: await getGitRootPath(),
        branch_name: branchName
      });
      // After deletion, update the branch list
      fetchBranches();
    } catch (error) {
      console.error("Error deleting branch:", error);
    }
  };

  // 브랜치 이름을 변경한다
  async function renameBranch(gitPath: string, oldName: string, newName: string) {
    try {
      const response = await axios.post(`/api/branch_rename`, {
        git_path: gitPath,
        old_branch_name: oldName,
        new_branch_name: newName
      });

      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = response.data;
      console.log("Response data:", data);

      return data;
    } catch (error) {
      console.error("Error renaming branch:", error);
      return null;
    }
  }


  //피쳐2를 해볼까요~~~
  async function mergeBranch(gitPath: string, targetBranch: string) {
    try {
        const response = await axios.post(`/api/branch_merge`, {
            git_path: gitPath,
            branch_name: targetBranch
        });
  
        if (response.status !== 200) {
            throw new Error(`API request failed with status ${response.status}`);
        }
  
        message.success("Merge Success!");
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response && 
        error.response.status === 500 && error.response.headers["unmerged_paths"]) {
            const unmergedPaths = error.response.headers["unmerged_paths"];
            
            message.error("Merge Conflict...");
            message.error(`Unmerged paths: ${unmergedPaths}`)
        } else {
            console.error("Error merging branch:", error);
        }
        return null;
    }
}
  // Modify the branchColumns to include a checkmark for the active branch
  const branchColumns = [
    {
      title: 'Branches',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            onClick={async () => {
              if (renameBranchMode !== name) {
                const gitPath = await getGitRootPath();
                await checkoutBranch(gitPath, name);
                fetchBranches();
                fetchActiveBranch();
              }
            }}
          >
            {name === activeBranch && <CheckOutlined style={{ fontSize: '16px', marginRight: '5px' }} />}
            {renameBranchMode === name ? (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Input
                  defaultValue={name}
                  onChange={e => setRenameBranchName(e.target.value)}
                  onPressEnter={async () => {
                    const gitPath = await getGitRootPath();
                    await renameBranch(gitPath, name, renameBranchName);
                    setRenameBranchMode("");
                    fetchBranches();
                    fetchActiveBranch();
                  }}
                />
              </div>
            ) : (
              name
            )}
          </div>
          <div>
            {name === activeBranch && (
              <Button disabled style={{ marginRight: '5px' }}>
                <DeleteOutlined />
              </Button>
            )}
            {name !== activeBranch && (
              <Button danger style={{ marginRight: '5px' }} onClick={() => handleDeleteBranch(name)}>
                <DeleteOutlined />
              </Button>
            )}
            {renameBranchMode !== name && (
              <Button  style={{ marginRight: '5px' }} onClick={() => setRenameBranchMode(name)}>
                <EditOutlined />
              </Button>
            )}
            {name !== activeBranch && (
              <Button
                style={{ marginRight: '5px' }}
                onClick={async () => {
                  const gitPath = await getGitRootPath();
                  await mergeBranch(gitPath, name);
                  fetchBranches();
                  fetchActiveBranch();
                }}
              >
                <MergeCellsOutlined />
              </Button>
            )}
          </div>
        </div>
      ),
    },
  ];

  
  //왜 피쳐3은 계속 오류가 발생하는가?
  const [visible, setVisible] = useState(false);
  const [historyList, setHistoryList] = useState([]);

  async function fetchGitHistory(gitPath: string) {
    try {
      const response = await axios.post("/api/git_history", { git_path: gitPath });
      
      if (response.status !== 200) {
        throw new Error(`API request failed with status ${response.status}`);
      }
  
      return response.data;
    } catch (error) {
      console.error("Error fetching git history:", error);
      return null;
    }
  }

  const openHistoryModal = async () => {
    const data = await fetchGitHistory(await getGitRootPath());
    setHistoryList(data);
    setVisible(true);
  }
  
  const closeHistoryModal = () => {
    setVisible(false);
  }
  
  const historyColumns = [
    { title: 'Commit Checksum', dataIndex: 'commit_checksum', key: 'commit_checksum' },
    { title: 'Author', dataIndex: 'author', key: 'author' },
    // add other fields as needed
  ];
  
  
  
  
  
  
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumb style={{ marginRight: 'auto' }}>
          <StyledBreadcrumbItem key="root" onClick={() => handleBreadcrumbClick('C:/')}>
            <HomeOutlined />
          </StyledBreadcrumbItem>
          {pathStack.slice(1).map((path, index) => (
            <StyledBreadcrumbItem key={index} onClick={() => handleBreadcrumbClick(path)}>
              {path.split('/').pop()}
            </StyledBreadcrumbItem>
          ))}
        </Breadcrumb>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {checkGitTypes() && (
            <>
              <Button
                type="primary"
                onClick={initRepo}
                style={{ fontSize: '14px', height: '40px', display: 'flex', alignItems: 'center', marginRight: '10px' }}
              >
                <FolderAddOutlined style={{ fontSize: '25px', marginRight: '5px' }} /> Create Git Repo
              </Button>

              <Button
                onClick={openCloneModal}
                style={{ fontSize: '14px', height: '40px', display: 'flex', alignItems: 'center' }}
              >
                <FolderAddOutlined style={{ fontSize: '25px', marginRight: '5px' }} /> Clone GitHub Repo
              </Button>
            </>
          )}

          {!checkGitTypes() && (
            <>
              <Button
                onClick={openBranchModal}
                style={{ fontSize: '14px', height: '40px', display: 'flex', alignItems: 'center', marginRight : '10px' }}
              >
                <BranchesOutlined style={{ fontSize: '22px', marginRight: '5px' }} /> {activeBranch}
              </Button>

              <Button
                type="primary"
                onClick={() => {
                  getStagedFiles();
                  setCommitModalVisible(true);
                }}
                style={{ fontSize: '14px', height: '40px', display: 'flex', alignItems: 'center' }}
              >
                <SendOutlined style={{ fontSize: '22px', marginRight: '5px' }} /> Commit
              </Button>
            </>
            
          )}
        </div>
      </div>

    <br/>
      
    {!checkGitTypes() && (<Button
        onClick={openHistoryModal}
        style={{ fontSize: '14px', height: '40px', display: 'flex', alignItems: 'center', marginRight : '10px' }}
      >
        <HistoryOutlined style={{ fontSize: '22px', marginRight: '5px' }} /> git commit history
      </Button>)}

      <br/>

      <Table
        columns={columns}
        dataSource={fileList}
        pagination={false}
        scroll={{ y: tableHeight }}
      />

      <Modal
        title="Rename File"
        visible={isRenameModalVisible}
        onOk={async () => {
          // The new file path is constructed by replacing the old file name in the old path with the new name
          const newPath = fileToRename 
            ? `${path}/${fileToRename.fileName}`.replace(fileToRename.fileName, newName) 
            : '';
        
          await axios.post(`/api/git_move`, { 
            git_path: await getGitRootPath(),
            old_file_path: fileToRename ? `${path}/${fileToRename.fileName}` : '', 
            new_file_path: newPath
          });
        
          // Fetch the file list again to update the UI.
          await fetchApi(path);
        
          // Close the modal.
          setRenameModalVisible(false);
          setFileToRename(null);
          setNewName(""); // Reset newName state
        }}
        onCancel={() => {
          setRenameModalVisible(false);
          setNewName(""); // Reset newName state
        }}
      >
        <Input
          placeholder="Enter new file name"
          value={newName}
          onChange={e => {
            setNewName(e.target.value);
          }}

        />
      </Modal>

      <Modal
        title= <h3>Commit Staged Changes</h3>
        visible={commitModalVisible}
        onOk={handleCommit}
        onCancel={handleCancelCommitModal}
        okText="Commit"
      >
        {stagedFiles.map((file) => (
          <p key={file.key}>{file.name.fileName}</p>
        ))}

        {stagedArea[path] && stagedArea[path].map((file) => (
            <p key={file.key}>
              {file.action === 'staged' && 'deleted:   '}
              {file.name.fileName}
            </p>
          ))}


        <br />

        <Input
          placeholder="Enter commit message"
          value={newName}
          onChange={(e) => {
            setNewName(e.target.value);
          }}
      />
    </Modal>

      <Modal
    title="Clone GitHub Repository"
    visible={isCloneModalVisible}
    onOk={handleCloneRepo}
    onCancel={closeCloneModal}
  >
    <Input
      placeholder="Enter the GitHub repository URL"
      onChange={handleRepoUrlChange}
    />
    </Modal>

      <Modal
        title={<h3>Switch branches</h3>}
        visible={branchModalVisible}
        onOk={closeBranchModal}
        onCancel={closeBranchModal}
        okButtonProps={{
          style: {
            marginRight: '8px',
            display: 'none',
          },
        }}
        cancelButtonProps={{
          style: {
            display: 'none',
          },
        }}

      >
        <br />
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Input
            placeholder="Create a branch..."
            value={newBranchName}
            onChange={(e) => setNewBranchName(e.target.value)}
            style={{ flex: '1', marginRight: '8px' }}
          />
          <Button type="primary" onClick={handleCreateBranch}>
            OK
          </Button>
        </div>
        <div
          style={{
            maxHeight: '500px',
            overflowY: 'auto',
          }}
        >
          <br />
          <Table 
            columns={branchColumns} 
            dataSource={branchList.map((branch, index) => ({ key: index, name: branch }))} 
            pagination={false} />
        </div>
    </Modal>

    <Modal
      title="Git Commit History"
      visible={visible}
      onCancel={closeHistoryModal}
      footer={null}
    >
      <Table
        columns={historyColumns}
        dataSource={historyList}
        pagination={false}
        scroll={{ y: 300 }}
      />
    </Modal>


    </>
  );
}