import { Button, Layout } from "antd";
import { BulbOutlined, BulbFilled } from "@ant-design/icons";
import styled from "styled-components";
import { useMemo, useState } from "react";

const { Header: AntdHeader } = Layout;

const StyledHeader = styled(AntdHeader)`
  background: #fff;
  border-bottom: 1px solid rgba(5, 5, 5, 0.06);
`;

const InnerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.span`
  font-weight: 600;
  font-size: 26px;
`;

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "File Manager" }: HeaderProps) {

  return (
    <StyledHeader>
      <InnerContainer>
        <Title>{title}</Title>
      </InnerContainer>
    </StyledHeader>
  );
}
