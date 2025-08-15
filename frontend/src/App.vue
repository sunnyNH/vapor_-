<template>
  <router-view />
</template>

<script setup lang="ts">
// Vue 3 + TypeScript 入口组件
</script>

<style>
/* 全局样式 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

#app {
  height: 100%;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #99a9bf;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: #f0f2f5;
}

/* Element Plus 组件样式覆盖 */
.el-breadcrumb__inner {
  color: #606266 !important;
}

.el-breadcrumb__item:last-child .el-breadcrumb__inner {
  color: #303133 !important;
  font-weight: 500;
}

.el-button + .el-button {
  margin-left: 10px;
}

.el-form--inline .el-form-item {
  margin-right: 20px;
}

.el-form--inline .el-form-item:last-child {
  margin-right: 0;
}
</style>
