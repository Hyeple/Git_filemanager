import { Layout } from "antd";
import styled from "styled-components";
import React from "react";

const { Content: AntdContent } = Layout;

const StyledContent = styled(AntdContent)`
  padding: 40px;
  background: rgb(249, 251, 255);
`;

interface ContentProps {
  children: React.ReactNode;
}

export default function Content({ children }: ContentProps) {
  return <StyledContent>{children}</StyledContent>;
}
