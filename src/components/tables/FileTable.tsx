import React from "react";
import { Button, Table } from "antd";
import { PlusOutlined, RedoOutlined, DeleteOutlined, FileTextTwoTone } from "@ant-design/icons";
import { ColumnsType } from "antd/es/table";
import styled from "styled-components";
import { getFileSize } from "../../utils/number";

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

type FileType = "untracked" | "modified" | "staged" | "committed";
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
        return "-";
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
    title: "Action",
    dataIndex: "action",
    key: "action",
    render: (value: FileType) => {
      if (!value) {
        return "-";
      }

      switch (value) {
        case "untracked":
          return (
            <Button type="primary" icon={<PlusOutlined />}>
              Add
            </Button>
          );
        case "modified":
          return (
            <ActionWrapper>
              <Button type="primary" icon={<PlusOutlined />}>
                Add
              </Button>
              <Button icon={<RedoOutlined />}>Restore</Button>
            </ActionWrapper>
          );
        case "staged":
          return (
            <ActionWrapper>
              <Button type="primary" icon={<DeleteOutlined />} danger>
                Delete
              </Button>
            </ActionWrapper>
          );
        case "committed":
          return (
            <ActionWrapper>
              <Button icon={<DeleteOutlined />} danger>
                Untraking file
              </Button>
            </ActionWrapper>
          );
      }
    },
  },
];

const data: FileTableDataType[] = [
  //현재 mock 데이터
  {
    key: "1",
    name: {
      fileName: "test.tsx",
      type: "untracked",
    },
    size: 21231231325,
    lastModified: "2023-05-05",
    action: "untracked",
  },
  {
    key: "2",
    name: {
      fileName: "test.js",
      type: "modified",
    },
    size: 234234,
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
    size: 35235235,
    lastModified: "2023-05-05",
    action: "committed",
  },
  {
    key: "5",
    name: {
      fileName: "readme.MD",
    },
    size: 625,
    lastModified: "2023-05-05",
  },
];

interface FileTableProps {}

export default function FileTable(props: FileTableProps) {
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
