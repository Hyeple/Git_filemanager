import { Layout } from "antd";
import Header from "../components/common/Header";
import React from "react";
import Content from "../components/common/Content";

interface BaseLayoutProps {
  children: React.ReactNode;
}

export default function BaseLayout({ children}: BaseLayoutProps) {
  return (
    <Layout>
      <Header />
      <Layout>

        <Layout>
          <Content>{children}</Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
