import React, { useState, useCallback, useEffect } from "react";
import { Modal, Button, Table, Tooltip } from "antd";
import { PlusOutlined, RedoOutlined, DeleteOutlined, FileTextTwoTone, FolderTwoTone, EditOutlined } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import styled from "styled-components";
import { getFileSize } from "../../utils/number";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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
type FileType =  "folder" | "file" | "untracked" | "modified" | "staged" | "committed";
type NameType = {
  fileName: string;
  type?: FileType;
};

interface FileTableDataType {
  key: React.Key;
  name: NameType;
  size: number;
  lastModified: string;
  action?: FileType;
}

const getFileIcon = (type: FileType) => {
  switch (type) {
    case "folder":
      return <FolderTwoTone twoToneColor = "lightgray" style = {{ fontSize: 24}}/>;
    case "file" :
      return <FileTextTwoTone twoToneColor="lightgray" style={{ fontSize: 24 }} />;
    case "untracked":
      return <FileTextTwoTone twoToneColor="#1677ff" style={{ fontSize: 24 }} />;
    case "modified":
      return <FileTextTwoTone twoToneColor="#ff4d4f" style={{ fontSize: 24 }} />;
    case "staged":
      return <FileTextTwoTone twoToneColor="#f7f008" style={{ fontSize: 24 }} />;
    case "committed":
      return <FileTextTwoTone twoToneColor="#96F2D7" style={{ fontSize: 24 }} />;
  }
};


//실제 돌아갈 코드 부분

interface FileTableProps {}

//api 요청으로 백엔드에서 file list 호출
async function fetchFiles(path: string) {
  try {
    const encodedPath = encodeURIComponent(path);
    const response = await fetch(`/api/root_files?path=${encodedPath}`);

    if (!response.ok && response.status !== 304) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

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


export default function FileTable(props: FileTableProps) {
  const { pathname } = useLocation();
  const [tableHeight, setTableHeight] = useState<number>(0);
  const [fileList, setFileList] = useState<FileTableDataType[]>([]);

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

  const fetchApi = useCallback(async (path = "C://") => {
    const data = await fetchFiles(path);
    const files = data.map((item: any) => ({
      key: item.key,
      name: {
        fileName: item.name,
        type: item.type,
      },
      size: item.size,
      lastModified: item.last_modified,
    }));
  
    setFileList(files as FileTableDataType[]);
  }, [pathname]);     

  useEffect(() => {
    fetchApi();
  }, [fetchApi]);

  const columns: ColumnsType<FileTableDataType> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (value: NameType, record: FileTableDataType) => {
        if (!value) {
          return "";
        }
  
        const { fileName, type } = value;
  
        return (
          <NameWrapper onClick={() => type === "folder" && fetchApi(record.name.fileName)}>
            {type && getFileIcon(type)}
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
      render: (value: FileType) => {
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
                  <Button icon = {<EditOutlined />} >
                    Rename
                  </Button>
                </Tooltip>
              </ActionWrapper>
            );
        }
      },
    },
  ];


  return (
    <Table
      columns={columns}
      dataSource={fileList}
      pagination={false}
      scroll={{ y: tableHeight }}
    />
  );
}





/*
//프론트 테스트용 mock
const data: FileTableDataType[] = [
  {
    key: "1",
    name: {
      fileName: "test",
      type: "folder",
    },
    size: 325,
    lastModified: "2023-05-05",
    action: "untracked",
  },
  {
    key: "2",
    name: {
      fileName: "test.js",
      type: "modified",
    },
    size: 325,
    lastModified: "2023-05-05",
    action: "modified",
  },
  {
    key: "3",
    name: {
      fileName: "test.py",
      type: "staged",
    },
    size: 325,
    lastModified: "2023-05-05",
    action: "staged",
  },
  {
    key: "4",
    name: {
      fileName: "test.go",
      type: "committed",
    },
    size: 325,
    lastModified: "2023-05-05",
    action: "committed",
  },
  {
    key: "5",
    name: {
      fileName: "readme.MD",
    },
    size: 325,
    lastModified: "2023-05-05",
  },
  {
    key: "6",
    name: {
      fileName: "readme.MD",
    },
    size: 325,
    lastModified: "2023-05-05",
  },
  {
    key: "7",
    name: {
      fileName: "readme.MD",
    },
    size: 325,
    lastModified: "2023-05-05",
  },
  {
    key: "8",
    name: {
      fileName: "readme.MD",
    },
    size: 325,
    lastModified: "2023-05-05",
  },
  {
    key: "9",
    name: {
      fileName: "readme.MD",
    },
    size: 325,
    lastModified: "2023-05-05",
  },
  {
    key: "10",
    name: {
      fileName: "readme.MD",
    },
    size: 325,
    lastModified: "2023-05-05",
  },
  {
    key: "11",
    name: {
      fileName: "readme125125.MD",
    },
    size: 325,
    lastModified: "2023-05-05",
  },
  {
    key: "12",
    name: {
      fileName: "readme123.MD",
    },
    size: 325,
    lastModified: "2023-05-05",
  },
  {
    key: "13",
    name: {
      fileName: "readme123.MD",
    },
    size: 325,
    lastModified: "2023-05-05",
  },
  {
    key: "14",
    name: {
      fileName: "readme123.MD",
    },
    size: 325,
    lastModified: "2023-05-05",
  },
  {
    key: "15",
    name: {
      fileName: "readme123.MD",
    },
    size: 325,
    lastModified: "2023-05-05",
  },
];

interface FileTableProps {}

export default function FileTable(props: FileTableProps) {
  const { pathname } = useLocation();
  const [tableHeight, setTableHeight] = useState<number>(0);

  const updateTableHeight = () => {
    const windowHeight = window.innerHeight;
    const desiredTableHeight = windowHeight - 300; // You can adjust this value to change the margin
    setTableHeight(desiredTableHeight);
  };

  useEffect(() => {
    updateTableHeight();
    window.addEventListener("resize", updateTableHeight);

    return () => {
      window.removeEventListener("resize", updateTableHeight);
    };
  }, []);

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      scroll={{ y: tableHeight }} // Use the tableHeight state here
    />
  );
}
*/