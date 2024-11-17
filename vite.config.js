import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { viteMockServe } from "vite-plugin-mock";

export default defineConfig(({ command }) => {
  const isDev = command === "serve"; // 判断是否是开发环境

  return {
    plugins: [
      vue(),
      viteMockServe({
        mockPath: "mock", // Mock 文件夹路径
        localEnabled: isDev, // 开发环境启用 Mock
      }),
    ],
  };
});
