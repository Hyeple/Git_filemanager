import React, { useState } from "react";
import { FolderAddOutlined as AntdFolderAddOutlined } from "@ant-design/icons";
import styled from "styled-components";
import { Popconfirm } from "antd";

const Container = styled.div`
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
  align-items: center;
  justify-content: center;
  background-color: rgb(249, 251, 255);
  cursor: pointer;
`;

const IconContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
`;

const Icon = styled(AntdFolderAddOutlined)`
  font-size: 60px;
  color: #1677ff;
`;

const TextContainer = styled.div``;

const Text = styled.h3`
  color: #1677ff;
  font-size: 16px;
`;

interface CreateGitRepositoryViewProps {}

export default function CreateGitRepositoryView(
  props: CreateGitRepositoryViewProps
) {
  const [showPopconfirm, setShowPopconfirm] = useState(false);

  const onConfirm = () => {
    console.log("폴더를 깃으로 관리합니다.");
    setShowPopconfirm(false);
  };

  const onCancel = () => {
    console.log("취소되었습니다.");
    setShowPopconfirm(false);
  };

  return (
    <Container>
      <Popconfirm
        title="폴더를 Git 레포지토리로 만듭니다."
        visible={showPopconfirm}
        onConfirm={onConfirm}
        onCancel={onCancel}
        okText="확인"
        cancelText="취소"
      >
        <InnerContainer onClick={() => setShowPopconfirm(true)}>
          <IconContainer>
            <Icon />
          </IconContainer>
          <TextContainer>
            <Text>Create Git Repository</Text>
          </TextContainer>
        </InnerContainer>
      </Popconfirm>
    </Container>
  );
}
