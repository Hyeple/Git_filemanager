import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import IndexPage from "./pages";
import { ConfigProvider } from "antd";
import { THEME } from "./utils/theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import BaseLayout from "./layouts/BaseLayout";

const queryClient = new QueryClient();

export default function App() {

  return (
    <ConfigProvider theme={THEME}>
      <QueryClientProvider client={queryClient}>
        <BaseLayout>
          <BrowserRouter>
            <Routes>
            <Route path="/*" element={<IndexPage />} />
            </Routes>
          </BrowserRouter>
        </BaseLayout>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ConfigProvider>
  );
}