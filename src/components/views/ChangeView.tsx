import React, { useState } from "react";
import styled from "styled-components";
import { Input, Button, Popconfirm } from "antd";

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  border: 1px solid rgb(240, 240, 240);
  border-radius: 4px;
  flex-direction: column;
  padding: 20px;
  background-color: rgb(249, 251, 255);
`;

const CommitMessageInput = styled(Input)`
  margin-bottom: 20px;
  height: 100px;
  overflow-y: auto;
`;

const CommitButton = styled(Button)`
  margin-bottom: 20px;
`;

const Separator = styled.div`
  height: 2px;
  background-color: rgba(0, 0, 0, 0.1);
  margin: 16px 0;
  width: 100%;
`;

const ChangeTitle = styled.h3`
  margin-bottom: 10px;
  font-size: 18px;
  text-align: left;
`;

const ChangesContainerWrapper = styled.div`
  overflow-y: auto;
  height: 100%;
`;

const ChangesContainer = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 10px;
  background-color: #ffffff;
  margin-bottom: 10px;
`;

interface ChangeViewProps {}

export default function ChangeView(props: ChangeViewProps) {
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleCommit = () => {
    setConfirmVisible(true);
  };

  const handleConfirm = () => {
    setConfirmVisible(false);
    console.log("커밋됨");
  };

  const handleCancel = () => {
    setConfirmVisible(false);
  };

  return (
    <Container>
      <CommitMessageInput placeholder="Enter commit message" />

      <Popconfirm
        title="Commit?"
        visible={confirmVisible}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        okText="확인"
        cancelText="취소"
      >
        <CommitButton type="primary" onClick={handleCommit}>
          Commit
        </CommitButton>
      </Popconfirm>

      <Separator />

        <ChangeTitle style={{ fontSize: "20px" }}>Changes</ChangeTitle>

        <ChangesContainerWrapper>
            <ChangesContainer>
            <p style={{ textAlign: "left", fontSize: "12px" }}>
                요런식으로 변경 사항을 적으려고 합니다. 네 그렇습니다.
            </p>
            </ChangesContainer>
            <ChangesContainer>
            <p style={{ textAlign: "left", fontSize: "12px" }}>
                요런식으로 변경 사항을 적으려고 합니다. 네 그렇습니다2.
            </p>
            </ChangesContainer>
            <ChangesContainer>
            <p style={{ textAlign: "left", fontSize: "12px" }}>
                요런식으로 변경 사항을 적으려고 합니다. 네 그렇습니다3.
            </p>
            </ChangesContainer>
            <ChangesContainer>
            <p style={{ textAlign: "left", fontSize: "12px" }}>
                스크롤바도 된답니다.
            </p>
            </ChangesContainer>
        </ChangesContainerWrapper>
        </Container>
  );
}
