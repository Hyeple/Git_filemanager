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
  font-size: 24px;
`;

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "File Manager" }: HeaderProps) {
  const [mode, setMode] = useState<"light" | "dark">("light");

  const icon = useMemo(() => {
    switch (mode) {
      case "light":
        return <BulbOutlined />;
      case "dark":
        return <BulbFilled />;
    }
  }, [mode]);

  return (
    <StyledHeader>
      <InnerContainer>
        <Title>{title}</Title>
        <Button icon={icon}>Switch Mode</Button>
      </InnerContainer>
    </StyledHeader>
  );
}
