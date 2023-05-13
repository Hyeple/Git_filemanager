import React, { useState, useCallback, useEffect } from "react";
import { Modal, Button, Table, Tooltip, Input } from "antd";
import { PlusOutlined, RedoOutlined, DeleteOutlined, FileTextTwoTone, FolderTwoTone, EditOutlined, FolderOpenTwoTone } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import styled from "styled-components";
import { getFileSize } from "../../utils/number";
import { useQuery } from "@tanstack/react-query";
import path from "path";
import axios from 'axios';
import { SiderType } from "../common/Sider";

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
  onPathChange: (newDir: string) => void;
  setType: (type: SiderType) => void;
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


export default function FileTable( { path, onPathChange, setType }: FileTableProps) {
  const [tableHeight, setTableHeight] = useState<number>(0);
  const [fileList, setFileList] = useState<FileTableDataType[]>([]);

  const [isRenameModalVisible, setRenameModalVisible] = useState<boolean>(false);
  const [fileToRename, setFileToRename] = useState<NameType | null>(null);
  const [newName, setNewName] = useState<string>("");

  const handleRenameClick = (record: FileTableDataType) => {
    setFileToRename(record.name);
    setRenameModalVisible(true);
  };


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

  const fetchApi = useCallback(async (path: string) => {
    const data = await fetchFiles(path);
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
  
  async function handleFolderClick(path: string) {
    console.log("현재 클릭한 path: " + path);
    try {
      const response = await axios.get(`/api/is_repo?directory=${encodeURIComponent(path)}`, {
        withCredentials: true,
      });
  
      if (response.status !== 200 && response.status !== 304) {
        console.error(`API request failed with status ${response.status}`);
        return;
      }
  
      const responseData = response.data;
      const isRepo = responseData.is_repo;
      console.log("isRepo: " + isRepo);
      setType(isRepo ? "change" : "create");
    } catch (error) {
      console.error("Error handling folder click:", error);
    }
  }
  
  
  
  
  const goBack = useCallback(async () => {
    // Pop the last path from the backend
    const response = await axios.post("/api/pop_path", {}, {
      withCredentials: true
    });
    const data = response.data;
  
    if (data.path) {
      // Fetch the files of the last path
      await fetchApi(data.path);
    } else {
      console.log(data.message);
    }
  }, [fetchApi]);    
  
  useEffect(() => {
    fetchApi(path);
  }, [fetchApi, path]);
  

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
              goBack();
            } else if (type_file === "folder") {
              const newPath = normalizePath(`${path}/${record.name.fileName}`);
              onPathChange(newPath);
              handleFolderClick(newPath);
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
            return (
              <Tooltip title="Adding the file into a staging area">
                <Button type="primary" icon={<PlusOutlined />}>
                  Add
                </Button>
              </Tooltip>
            );
  
          case "modified":
            return (
              <ActionWrapper>
                <Tooltip title="Adding the file into a staging area">
                  <Button type="primary" icon={<PlusOutlined />}>
                    Add
                  </Button>
                </Tooltip>
  
                <Tooltip title="Undoing the modification">
                  <Button icon={<RedoOutlined />}>
                    Restore
                  </Button>
                </Tooltip>
              </ActionWrapper>
            );
  
          case "staged":
            return (
              <ActionWrapper>
                <Tooltip title="Unstaging changes">
                  <Button icon={<RedoOutlined />}>
                    Restore
                  </Button>
                </Tooltip>
              </ActionWrapper>
            );
  
          case "committed":
            return (
              <ActionWrapper>
                <Tooltip title=" Untracking file">
                  <Button icon={<DeleteOutlined />} danger>
                    Untrake
                  </Button>
                </Tooltip>
  
                <Tooltip title="Deleting file">
                  <Button type="primary" icon={<DeleteOutlined />} danger>
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

          case "tracked" :
            return "";

          case "back" :
            return "";
        }
      },
    },
  ];


  return (
    <>
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
          // 백 실제 api랑 연결해야함.
          const newName = "newName"; // Get this value from your form.
          await axios.post(`/api/rename_file`, { 
            oldName: fileToRename?.fileName, 
            newName
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
    </>
  );
}