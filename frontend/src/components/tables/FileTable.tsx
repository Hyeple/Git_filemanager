import React, { useCallback, useEffect } from "react";
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

const columns: ColumnsType<FileTableDataType> = [
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
    render: (value: NameType) => {
      if (!value) {
        return "";
      }

      const { fileName, type } = value;

      return (
        <NameWrapper>
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
    title: "Last modified",
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

//우선 들어있는건 mock. API로 파일 리스트 받아오면 됨.
//백에서 파일목록은 이름 순으로 정렬해서 넘겨주세요.
const data: FileTableDataType[] = [
  {
    key: "1",
    name: {
      fileName: "test folder",
      type: "folder",
    },
    size: 123123325,
    lastModified: "2023-05-05",
  },
  {
    key: "2",
    name: {
      fileName: "test.tsx",
      type: "untracked",
    },
    size: 123123325,
    lastModified: "2023-05-05",
    action: "untracked",
  },
  {
    key: "3",
    name: {
      fileName: "test.js",
      type: "modified",
    },
    size: 25,
    lastModified: "2023-05-05",
    action: "modified",
  },
  {
    key: "4",
    name: {
      fileName: "test.py",
      type: "staged",
    },
    size: 322315,
    lastModified: "2023-05-05",
    action: "staged",
  },
  {
    key: "5",
    name: {
      fileName: "test.go",
      type: "committed",
    },
    size: 321115,
    lastModified: "2023-05-05",
    action: "committed",
  },
  {
    key: "6",
    name: {
      fileName: "readme.MD",
      type: "file",
    },
    size: 12325,
    lastModified: "2023-05-05",
  },
];

interface FileTableProps {}

export default function FileTable(props: FileTableProps) {
  const { pathname } = useLocation();

  const fetchApi = useCallback(() => {
    // NOTE: pathname을 가지고 API 요청을 보내는 코드를 짠다.
    console.log(pathname);
  }, [pathname]);

  useEffect(() => {
    fetchApi();
  }, [pathname]);

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={{
        current: 1,
        defaultCurrent: 1,
        pageSize: 10,
        defaultPageSize: 10,
        position: ["bottomCenter"],
      }}
    />
  );
}
