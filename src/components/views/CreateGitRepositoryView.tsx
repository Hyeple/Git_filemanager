import React from "react";
import { FolderAddOutlined as AntdFolderAddOutlined } from "@ant-design/icons";
import styled from "styled-components";

const Container = styled.div`
  width: 100%;
  height: 500px;
  background: #e6f4ff;
  border: 2px solid #1677ff;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const InnerContainer = styled.div``;

const IconContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Icon = styled(AntdFolderAddOutlined)`
  font-size: 140px;
  color: #1677ff;
`;

const TextContainer = styled.div``;

const Text = styled.span`
  color: #1677ff;
  font-size: 20px;
`;

interface CreateGitRepositoryViewProps {}

export default function CreateGitRepositoryView(props: CreateGitRepositoryViewProps) {
  return (
    <Container>
      <InnerContainer>
        <IconContainer>
          <Icon />
        </IconContainer>
        <TextContainer>
          <Text>Create Git Repository</Text>
        </TextContainer>
      </InnerContainer>
    </Container>
  );
}
