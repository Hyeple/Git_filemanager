import { Layout } from "antd";
import styled from "styled-components";
import { HEADER_HEIGHT } from "../../utils/values";
import { useMemo } from "react";
import CreateGitRepositoryView from "../views/CreateGitRepositoryView";
import ChangeView from "../views/ChangeView";

const { Sider: AntdSider } = Layout;

const StyledSider = styled(AntdSider)`
  &.ant-layout-sider {
    background: #fff;
    height: calc(100vh - ${HEADER_HEIGHT}px);
    border-right: 1px solid rgba(5, 5, 5, 0.06);
  }
`;

const ViewContainer = styled.div`
  padding: 10px;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export type SiderType = "create" | "change";

interface SiderProps {
  type: SiderType;
}

export default function Sider({ type }: SiderProps) {
  const view = useMemo(() => {
    switch (type) {
      case "create":
        return <CreateGitRepositoryView />;
      case "change":
        return <ChangeView />;
    }
  }, [type]);

  return (
    <StyledSider width={300}>
      <ViewContainer>{view}</ViewContainer>
    </StyledSider>
  );
}
