import React from "react";
import { FolderAddOutlined as AntdFolderAddOutlined } from "@ant-design/icons";
import styled from "styled-components";

const Container = styled.button`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgb(240, 240, 240);
  border-radius: 4px;
  background-color: rgb(249, 251, 255);
`;

const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const IconContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Icon = styled(AntdFolderAddOutlined)`
  font-size: 50px;
  color: #000000;
`;

const TextContainer = styled.div``;

const Text = styled.button`
  background-color: rgb(249, 251, 255);
  color: #000000;
  border: none;
  border-radius: 4px;
  padding: 10px;
  font-size: 16px;
  cursor: pointer;
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
