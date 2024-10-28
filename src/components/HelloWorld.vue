<template>
  <div class="list" ref="container">
    <div v-show="showLeft" class="left" @click="moveLeft"><</div>
    <div class="lists" :style="{ transform: `translateX(${offset}px)` }">
      <div class="item" v-for="(ite, i) in list" :key="i" :ref="addTargetRef">
        {{ ite.name }}
      </div>
    </div>
    <div v-show="showRight" class="right" @click="moveRight">></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

const list = ref([
  { name: "模考作业", id: 1 },
  { name: "期末作业", id: 1 },
  { name: "阅读作业", id: 1 },
  { name: "打卡作业", id: 1 },
  { name: "测试作业", id: 1 },
  { name: "体育作业", id: 1 },
  { name: "视频作业", id: 1 },
]);

const showLeft = ref(false);
const showRight = ref(false);

const offset = ref(0);
const moveRight = () => {
  offset.value -= 30;
  showLeft.value = true;
};
const moveLeft = () => {
  offset.value += 30;
};
const container = ref(null); // 容器元素
const targetElements = ref([]); // 存放所有目标元素的引用
let observer = null;
const addTargetRef = (el) => {
  if (el) targetElements.value.push(el);
};
const showTotal = ref(0);

const handleIntersect = (entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      console.log(`元素 ${entry.target.innerText} 进入视口`);
      showTotal.value++;
    } else {
      console.log(`元素 ${entry.target.innerText} 离开视口`);
      showTotal.value--;
    }
  });
};

onMounted(() => {
  console.log(targetElements.value.length, "sss");

  observer = new IntersectionObserver(handleIntersect, {
    root: container.value,
    threshold: 0.1,
  });

  targetElements.value.forEach((el) => {
    observer.observe(el);
  });
  if (showTotal.value < targetElements.value.length) {
    showRight.value = true;
  }
});

onUnmounted(() => {
  if (observer) {
    targetElements.value.forEach((el) => observer.unobserve(el));
  }
});
</script>

<style scoped>
.list {
  width: 100%;
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
}
.lists {
  display: flex;
  align-items: center;
  transition: all 0.3s ease-in-out;
}
.item {
  margin-right: 10px;
  padding: 6px 7px;
  background: #e7eeff;
  border-radius: 4px;
}
.left {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 999;
  width: 20px;
  height: 100%;
  line-height: 1;
  background-color: rgba(244, 244, 244, 0.7);
  cursor: pointer;
}
.right {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 999;
  width: 20px;
  height: 100%;
  line-height: 1;
  background-color: rgba(244, 244, 244, 0.7);
  cursor: pointer;
}
</style>
