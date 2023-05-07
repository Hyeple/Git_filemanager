import { Layout } from "antd";
import styled from "styled-components";
import React from "react";

const { Content: AntdContent } = Layout;

const StyledContent = styled(AntdContent)`
  padding: 10px;
  background: #ffffff;
`;

const InnerContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  border: 1px solid rgb(240, 240, 240);
  border-radius: 4px;
  flex-direction: column;
  padding: 20px;
  background-color: rgb(249, 251, 255);
`;

interface ContentProps {
  children: React.ReactNode;
}

export default function Content({ children }: ContentProps) {
  return <StyledContent>
     <InnerContent>
    {children}
    </InnerContent>
    </StyledContent>;

}
