import ContentLayout from "../layouts/ContentLayout";
import { Button } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import FileTable from "../components/tables/FileTable";

export default function IndexPage() {
  const path = "C:\\";


  return (
    <ContentLayout
      options={[
        <Button>
          <HomeOutlined />
        </Button>,
      ]}
    >
      <FileTable path = {path}/>
    </ContentLayout>
  );
}
