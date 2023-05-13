import React, { useState } from "react";
import ContentLayout from "../layouts/ContentLayout";
import { Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import FileTable from "../components/tables/FileTable";

interface IndexPageProps {
}

export default function IndexPage({}: IndexPageProps) {
  const [path, setPath] = useState("C:/");

  const handlePathChange = (newDir: string) => {
    const updatedPath = new URL(newDir, "file:///" + path).pathname.substring(1);
    setPath(updatedPath);
  };

  return (
    <ContentLayout>
      <FileTable path={path} onPathChange={handlePathChange} />
    </ContentLayout>
  );
}