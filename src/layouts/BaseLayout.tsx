import { Layout } from "antd";
import Header from "../components/common/Header";
import React from "react";
import Sider, { SiderType } from "../components/common/Sider";
import Content from "../components/common/Content";

interface BaseLayoutProps {
  children: React.ReactNode;
  type: SiderType;
}

export default function BaseLayout({ children, type }: BaseLayoutProps) {
  return (
    <Layout>
      <Header />

      <Layout>
        <Sider type={type} />

        <Layout>
          <Content>{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
