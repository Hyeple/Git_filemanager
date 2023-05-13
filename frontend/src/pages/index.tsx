import React, { useState } from "react";
import ContentLayout from "../layouts/ContentLayout";
import { Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import FileTable from "../components/tables/FileTable";
import { SiderType } from "../components/common/Sider";

interface IndexPageProps {
  setType: React.Dispatch<React.SetStateAction<SiderType>>;
}

export default function IndexPage({ setType }: IndexPageProps) {
  const [path, setPath] = useState("C:\\");

  const handlePathChange = (newDir: string) => {
    const updatedPath = new URL(newDir, "file:///" + path).pathname.substring(1);
    setPath(updatedPath);
  };

  return (
    <ContentLayout
      options={[
        <Button>
          <HomeOutlined />
        </Button>,
      ]}
    >
      <FileTable path={path} onPathChange={handlePathChange} setType={setType} />
    </ContentLayout>
  );
}
