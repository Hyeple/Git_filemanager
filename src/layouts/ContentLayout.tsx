import React, { useMemo } from "react";
import styled from "styled-components";

const Container = styled.div``;

const OptionsWrapper = styled.div`
  margin-bottom: 16px;
`;

const OptionList = styled.ul`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const OptionItem = styled.li``;

const ChildrenContainer = styled.div``;

interface ContentLayoutProps {
  children: React.ReactNode;
  // NOTE: options props 는 ReactNode 타입의 배열입니다.
  // 웬만하면 UI/UX 통일을 위해 antd <Button /> 컴포넌트를 사용해서 넘겨주세요.
  options?: React.ReactNode[];
}

export default function ContentLayout({ children, options }: ContentLayoutProps) {
  const optionsUI = useMemo(() => {
    if (!options || !options?.length) {
      return;
    }

    return (
      <OptionsWrapper>
        <OptionList>
          {options.map((node) => (
            <OptionItem>{node}</OptionItem>
          ))}
        </OptionList>
      </OptionsWrapper>
    );
  }, [options]);

  return (
    <Container>
      {optionsUI}
      <ChildrenContainer>{children}</ChildrenContainer>
    </Container>
  );
}
