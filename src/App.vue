<template>
  <router-view />
</template>

<script setup lang="ts">
// 不需要额外的逻辑
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* Element Plus 样式覆盖 */
.el-button {
  font-weight: normal;
}

.el-card {
  border: none;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-input__wrapper,
.el-textarea__wrapper {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.el-input__wrapper:hover,
.el-textarea__wrapper:hover {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.el-input__wrapper.is-focus,
.el-textarea__wrapper.is-focus {
  box-shadow: 0 0 0 1px #409eff inset;
}
</style>
