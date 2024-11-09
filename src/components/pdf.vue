<!-- 用于重构导出pdf的功能 -->

<!-- html2canvas
jspdf
fileSave -->

<template>
  <div>
    <el-button type="primary">Primary</el-button>

    <div class="pdf_content">
      <div class="pdf_item">
        <div class="item_l">1</div>
        <div class="item_r">2</div>
      </div>
      <div class="pdf_item"></div>
      <div class="pdf_item"></div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
.pdf_content {
  width: 793px;
  .pdf_item {
    width: 100%;
    height: 1122px;
    margin-bottom: 20px;
    background-color: #f5f5f5;
    box-shadow: 2px 2px 8px #d6d6d6;
    display: flex;
    align-items: center;
  }
  .item_l {
    width: 70%;
    height: 100%;
  }
  .item_r {
    width: 30%;
    height: 100%;
    border-left: 1px dashed #ccc;
  }
}
</style>
