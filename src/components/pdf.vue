<!-- 用于重构导出pdf的功能 -->

<!-- html2canvas
jspdf
fileSave -->

<template>
  <div class="contents">
    <div class="pdf_content">
      <div class="pdf_item">
        <div class="item_l">
          <div v-for="(items, i) in randomValue.data" :key="i">
            <template v-if="true">
              <el-table
                v-for="(ite, i) in items"
                :key="i"
                :data="ite.table"
                style="width: 100%"
                size="small"
                border
              >
                <el-table-column
                  v-for="item in heads"
                  :label="item.prop"
                  :prop="item.name"
                  :key="item.id"
                />
              </el-table>
            </template>
            <template v-if="true">
              <div v-for="(ite, i) in items" :key="i" class="comment">
                <template v-for="it in ite.comments">
                  <div v-if="it" class="comment_list">
                    <div v-if="it.teacher" class="comment_head">
                      <span class="comment_time">{{ it.teacher }}</span> |
                      <span class="comment_name">{{ it.date }}</span>
                    </div>
                    <div class="comment_value">{{ it.content }}</div>
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
        <div class="item_r">2</div>
      </div>
    </div>
    <div class="pdf_content">
      <div
        v-for="(item, index) in newList"
        :key="index"
        class="pdf_item"
        style="height: 1115px"
      >
        <div class="item_l">
          <div v-for="(items, i) in item" :key="i">
            <div class="comment" v-if="items && items.comment">
              <template v-for="(it, i) in items.comment" :key="i">
                <div v-if="it" class="comment_list">
                  <div v-if="it.teacher" class="comment_head">
                    <span class="comment_time">{{ it?.teacher }}</span> |
                    <span class="comment_name">{{ it?.data }}</span>
                  </div>
                  <div class="comment_value">
                    <div v-for="lin in it?.content">{{ lin }}</div>
                  </div>
                </div>
              </template>
            </div>
            <template v-if="true">
              <el-table
                v-if="items && items.table.length"
                :data="items.table"
                style="width: 100%; margin: 20px 0 15px"
                size="small"
                border
              >
                <el-table-column
                  v-for="item in heads"
                  :label="item.prop"
                  :prop="item.name"
                  :key="item.id"
                />
              </el-table>
            </template>
            <div class="comment" v-if="items && items.comments">
              <template v-for="(it, i) in items.comments" :key="i">
                <div v-if="it" class="comment_list">
                  <div v-if="it.teacher" class="comment_head">
                    <span class="comment_time">{{ it?.teacher }}</span> |
                    <span class="comment_name">{{ it?.data }}</span>
                  </div>
                  <div class="comment_value">
                    <div v-for="lin in it?.content">{{ lin }}</div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
        <div class="item_r">2</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { randomValue } from "../mock/index.js";
import { ref, onMounted } from "vue";
const shows = ref(true);

const list = ref([]);
const heads = ref([
  { name: "course", id: 0, prop: "课程" },
  { name: "totalScore", id: 1, prop: "课堂总得分" },
  { name: "bonus", id: 2, prop: "期末考试分数" },
  { name: "credit", id: 3, prop: "加分" },
  { name: "examScore", id: 4, prop: "学分" },
  { name: "finalExamScore", id: 5, prop: "考试总得分" },
  { name: "gpa", id: 6, prop: "绩点" },
]);
const head = ref([
  { name: "course", id: 0, prop: "课程" },
  { name: "totalScore", id: 1, prop: "课堂总得分" },
  { name: "bonus", id: 2, prop: "期末考试分数" },
  { name: "credit", id: 3, prop: "加分" },
  { name: "examScore", id: 4, prop: "学分" },
  { name: "finalExamScore", id: 5, prop: "考试总得分" },
  { name: "gpa", id: 6, prop: "绩点" },
  { name: "grade", id: 7, prop: "等级" },
  { name: "midTermScore", id: 8, prop: "期中考试分数" },
  { name: "monthlyScore", id: 9, prop: "月考分数" },
]);
onMounted(() => {
  const { data } = randomValue;
  console.log(data, "randomValue");
  list.value = data;
  computedTrHeight();
});

// pdf分页核心思想
/**
 * 计算每一项的数据高度，然后用页面高度 - 当前项的高度，当此页容纳不下某一行时就分页到下一页继续计算
 * 1、如何较为准确的计算出每一行table的高度：注意，在el-table中，可能存在文本换行的情况，所以需要计算出每一行的高度，然后累加
 * 2、目前的难点：如何计算表格每一行实际的高度
 * 3、解决方案;先穿件虚拟dom让字符串按照对应的格式渲染出来，然后渲染这段字符串，再获取这段字符串渲染出来的高度
 */

const MAX_HEIGHT = ref(1112);
const PAGE = ref(0);
const CURRENT = ref(0);
const KEYS = ref(0);
const TOTAL_HEIGHT = ref(0);

const Have_ADD = ref(false);
const SHOULD_NEXT = ref(true);

const newList = ref([[{ table: [], comments: [] }]]);

const computedTrHeight = () => {
  list.value.forEach((item, index) => {
    // 先计算table

    item.forEach((ite) => {
      // 再减去表格项目前，需要先减去表头高度
      SHOULD_NEXT.value = true;
      computedTable(ite, index);
      ite.comments.length > 0 &&
        SHOULD_NEXT.value &&
        computedComment(ite, index);
      // 计算评论
      // PAGE.value++;
    });
    if (Have_ADD.value) {
      CURRENT.value = 0;
    } else {
      CURRENT.value++;
      if (!newList.value[PAGE.value]) {
        newList.value[PAGE.value] = [{ table: [], comments: [] }];
      } else if (!newList.value[PAGE.value][CURRENT.value]) {
        newList.value[PAGE.value][CURRENT.value] = {
          table: [],
          comments: [],
        };
      }
    }
  });
  console.log(H_JSON(newList.value), "jjj");
};

const computedTable = (ite, index) => {
  SHOULD_NEXT.value = false;
  TOTAL_HEIGHT.value += 20;
  if (TOTAL_HEIGHT.value > MAX_HEIGHT.value) {
    PAGE.value++;
    CURRENT.value = 20;
    TOTAL_HEIGHT.value = 0;
    MAX_HEIGHT.value = 1112;
    Have_ADD.value = true;
    newList.value[PAGE.value] = [{ table: [], comments: [] }];
  }

  TOTAL_HEIGHT.value += 55;
  if (TOTAL_HEIGHT.value > MAX_HEIGHT.value) {
    PAGE.value++;
    CURRENT.value = 55;
    TOTAL_HEIGHT.value = 0;
    MAX_HEIGHT.value = 1112;
    Have_ADD.value = true;
    newList.value[PAGE.value] = [{ table: [], comments: [] }];
  }

  for (let i = 0; i < ite.table.length; i++) {
    const td = H_JSON(ite.table[i]);
    // 减去每一项table的高度
    const res = createVNodeTd(td);
    TOTAL_HEIGHT.value += res;
    console.log(H_JSON(TOTAL_HEIGHT.value), res, td, "ssss");

    if (TOTAL_HEIGHT.value > MAX_HEIGHT.value) {
      PAGE.value++;
      CURRENT.value = 0;
      TOTAL_HEIGHT.value = res;
      MAX_HEIGHT.value = 1112;
      Have_ADD.value = true;
      // 组建新的值从新插入到newList中用于下一轮循环
      newList.value[PAGE.value] = [{ table: [], comments: [] }];
      newList.value[PAGE.value][CURRENT.value].table.push(td);
    } else {
      if (!newList.value[PAGE.value]) {
        newList.value[PAGE.value] = [{ table: [], comments: [] }];
      } else if (!newList.value[PAGE.value][CURRENT.value]) {
        newList.value[PAGE.value][CURRENT.value] = { table: [], comments: [] };
      }
      newList.value[PAGE.value][CURRENT.value].table.push(td);
    }
  }
  TOTAL_HEIGHT.value += 10;
  if (TOTAL_HEIGHT.value > MAX_HEIGHT.value) {
    PAGE.value++;
    CURRENT.value = 20;
    TOTAL_HEIGHT.value = 0;
    MAX_HEIGHT.value = 1112;
    Have_ADD.value = true;
    newList.value[PAGE.value] = [{ table: [], comments: [] }];
  }
  SHOULD_NEXT.value = true;
};
const computedComment = (ite, index) => {
  for (let i = 0; i < ite.comments.length; i++) {
    const item = ite.comments[i];
    KEYS.value+=1;
    // 先减去padding-top
    TOTAL_HEIGHT.value += 13;
    if (TOTAL_HEIGHT.value > MAX_HEIGHT.value) {
      totalFunc();
      TOTAL_HEIGHT.value += 13;
      KEYS.value = 0;
    }

    // 再减去评论标题
    TOTAL_HEIGHT.value += 19;
    console.log("还剩多少2", H_JSON(TOTAL_HEIGHT.value), item.teacher);
    if (TOTAL_HEIGHT.value + 13 > MAX_HEIGHT.value) {
      totalFunc();
      TOTAL_HEIGHT.value += 32;
      KEYS.value = 0;
      if (!newList.value[PAGE.value][CURRENT.value]) {
        newList.value[PAGE.value][CURRENT.value] = { table: [], comment: [] };
      }
      if (!newList.value[PAGE.value][CURRENT.value].comment[KEYS.value]) {
        newList.value[PAGE.value][CURRENT.value].comment[KEYS.value] = {};
        newList.value[PAGE.value][CURRENT.value].comment[KEYS.value][
          "content"
        ] = [];
      }
      newList.value[PAGE.value][CURRENT.value].comment[KEYS.value]["data"] =
        item.date;
      newList.value[PAGE.value][CURRENT.value].comment[KEYS.value]["teacher"] =
        item.teacher;
    }else{
      if (!newList.value[PAGE.value][CURRENT.value]) {
        newList.value[PAGE.value][CURRENT.value] = { table: [], comments: [] };
      }
      if (!newList.value[PAGE.value][CURRENT.value].comments[KEYS.value]) {
        newList.value[PAGE.value][CURRENT.value].comments[KEYS.value] = {};
        newList.value[PAGE.value][CURRENT.value].comments[KEYS.value][
          "content"
        ] = [];
      }
      newList.value[PAGE.value][CURRENT.value].comments[KEYS.value]["data"] =
        item.date;
      newList.value[PAGE.value][CURRENT.value].comments[KEYS.value]["teacher"] =
        item.teacher;
    }
    // 减去评论标题的margin-bottom
    TOTAL_HEIGHT.value += 5;
    console.log("还剩多少3", H_JSON(TOTAL_HEIGHT.value));
    if (TOTAL_HEIGHT.value + 8 > MAX_HEIGHT.value) {
      totalFunc();
      TOTAL_HEIGHT.value += 13;
      KEYS.value = 0;
    }
    // 开始裁剪评论内容
    const line = calculateLines(item.content);
    for (let k = 0; k < line.length; k++) {
      if (k == line.length - 1) {
        TOTAL_HEIGHT.value += 1;
      }
      const ln = line[k];
      TOTAL_HEIGHT.value += 16;
      if (TOTAL_HEIGHT.value + 13 > MAX_HEIGHT.value) {
        totalFunc();
        TOTAL_HEIGHT.value += 29;
        KEYS.value = 0;
        if (!newList.value[PAGE.value][CURRENT.value]) {
          newList.value[PAGE.value][CURRENT.value] = {
            table: [],
            comment: [],
          };
        }
        if (!newList.value[PAGE.value][CURRENT.value].comment[KEYS.value]) {
          newList.value[PAGE.value][CURRENT.value].comment[KEYS.value] = {};
          newList.value[PAGE.value][CURRENT.value].comment[KEYS.value][
            "content"
          ] = [];
        }
        newList.value[PAGE.value][CURRENT.value].comment[KEYS.value][
          "content"
        ].push(ln);
      } else {
        if (!newList.value[PAGE.value][CURRENT.value].comments[KEYS.value]) {
          newList.value[PAGE.value][CURRENT.value].comments[KEYS.value] = {};
          newList.value[PAGE.value][CURRENT.value].comments[KEYS.value][
            "content"
          ] = [];
        }
        newList.value[PAGE.value][CURRENT.value].comments[KEYS.value][
          "content"
        ].push(ln);
      }
    }

    TOTAL_HEIGHT.value += 13;
    if (TOTAL_HEIGHT.value + 13 > MAX_HEIGHT.value) {
      totalFunc();
      TOTAL_HEIGHT.value += 13;
      KEYS.value = 0;
    }
  }
};

// 抽离公用函数
const totalFunc = () => {
  PAGE.value++;

  CURRENT.value = 0;
  // MAX_HEIGHT.value = 1112;
  TOTAL_HEIGHT.value = 0;
  Have_ADD.value = true;
  newList.value[PAGE.value] = [{ table: [], comments: [] }];
};
const totalAddVal = () => {};

const computedTrHeights = () => {
  // 计算表头高度
  // 原本高度该为1112，但是中途计算有问题，导致计算会多50-60px，所以就在总长度这里加了一个错误范围
  let MAX_HEIGHT = 1112;
  let PAGE = 0;
  let CURRENT = 0;
  let isChangePage = true;
  list.value.forEach((item) => {
    item.forEach((ite) => {
      isChangePage = true;
      // 先计算表头，实际表头是动态的，但是这里做了静态处理
      // const TH_HEIGHT = createVNodeTh(heads.value);
      MAX_HEIGHT -= TH_HEIGHT;
      // 需要分页到下一页
      if (MAX_HEIGHT < 0) {
        MAX_HEIGHT = 1112;
        CURRENT = 0;
        PAGE++;
        isChangePage = false;
        newList.value[PAGE] = [{ table: [], comments: [] }];
      }
      ite.table.forEach((td) => {
        const TD_HEIGHT = createVNodeTd(td);
        MAX_HEIGHT -= TD_HEIGHT;
        // 需要分页到下一页
        if (MAX_HEIGHT < 0) {
          MAX_HEIGHT = 1112;
          CURRENT = 0;
          PAGE++;
          isChangePage = false;
          newList.value[PAGE] = [{ table: [], comments: [] }];
        } else {
          isChangePage = true;
          newList.value[PAGE][CURRENT].table.push(td);
        }
      });

      // 计算评论
      ite.comments.forEach((com, index) => {
        // 先减去padding-top
        MAX_HEIGHT -= 13;
        if (MAX_HEIGHT < 0) {
          MAX_HEIGHT = 1112;
          CURRENT = 0;
          PAGE++;
          isChangePage = false;
          newList.value[PAGE] = [[{ table: [], comments: [] }]];
        } else {
          isChangePage = true;
          // 减去标题宽度
          MAX_HEIGHT -= 18;
          if (MAX_HEIGHT < 0) {
            MAX_HEIGHT = 1112;
            CURRENT = 0;
            PAGE++;
            isChangePage = false;
            newList.value[PAGE] = [{ table: [], comments: [] }];
            console.log("减去标题宽度");
          } else {
            if (!newList.value[PAGE][CURRENT].comments[index]) {
              newList.value[PAGE][CURRENT].comments[index] = {};
              newList.value[PAGE][CURRENT].comments[index]["content"] = [];
            }
            newList.value[PAGE][CURRENT].comments[index]["data"] = com.date;
            newList.value[PAGE][CURRENT].comments[index]["teacher"] =
              com.teacher;
            MAX_HEIGHT -= 5;
            if (MAX_HEIGHT < 0) {
              MAX_HEIGHT = 1112;
              CURRENT = 0;
              PAGE++;
              isChangePage = false;
              newList.value[PAGE] = [{ table: [], comments: [] }];
              console.log("减去标题宽度2");
            }
            isChangePage = true;
            const line = calculateLines(com.content);
            console.log(line, "line");
            console.log(MAX_HEIGHT, "MAX_HEIGHT1");

            line.forEach((lin, i) => {
              MAX_HEIGHT -= 15.2;
              console.log(MAX_HEIGHT, i, "MAX_HEIGHT2");

              if (MAX_HEIGHT < 0) {
                MAX_HEIGHT = 1112;
                CURRENT = 0;
                PAGE++;
                isChangePage = false;
                let coms = com;
                coms.content = line.slice(i);
                // console.log(coms, "coms");
                console.log(H_JSON(newList.value), PAGE, CURRENT, "coms");
                if (!newList.value[PAGE]) {
                  newList.value[PAGE] = [[{ table: [], comments: [] }]];
                }
                newList.value[PAGE][CURRENT].comments[index] = coms;
              } else {
                console.log(MAX_HEIGHT, "MAX_HEIGHT3");
                console.log(lin, "lin");

                if (!newList.value[PAGE][CURRENT].comments[index]) {
                  newList.value[PAGE][CURRENT].comments[index] = {};
                  newList.value[PAGE][CURRENT].comments[index]["content"] = [];
                }
                newList.value[PAGE][CURRENT].comments[index]["data"] = com.date;
                newList.value[PAGE][CURRENT].comments[index]["teacher"] =
                  com.teacher;
                newList.value[PAGE][CURRENT].comments[index]["content"].push(
                  lin
                );
              }
            });

            MAX_HEIGHT -= 13;
            // 需要分页到下一页
            if (MAX_HEIGHT < 0) {
              MAX_HEIGHT = 1112;
              CURRENT = 0;
              PAGE++;
              newList.value[PAGE] = [{ table: [], comments: [] }];
            }
          }
        }
      });
    });
    if (isChangePage) {
      CURRENT++;
      newList.value[PAGE][CURRENT] = { table: [], comments: [] };
    }
  });
  console.log(H_JSON(newList.value), "newList");
};

//  创建虚拟dom
const createVNodeTd = (td) => {
  const tdList = [];
  for (const key in td) {
    const item = td[key];
    const tds = `<td style="width: 79px;line-height: 23.4px;padding: 4px 8px;box-sizing: border-box;font-size: 12px;">${item}</td>`;
    tdList.push(tds);
  }
  const nodes = `
    <table style="width: 555.1px;border-collapse: collapse;">
      <tr style="width: 79px" >
        ${tdList.join("")}
      </tr>
    </table>
  `;
  // 创建一个临时的 div 元素
  const tempDiv = document.createElement("div");
  // 设置 innerHTML
  tempDiv.innerHTML = nodes;
  // 获取 table 元素，而不是 firstChild
  const tableElement = tempDiv.querySelector("table");
  // 可以在此添加类名
  tableElement.classList.add("td_hyy");
  // 将 table 元素添加到 body 中
  document.body.appendChild(tableElement);
  const el = document.querySelector(".td_hyy");
  const h = el.offsetHeight;
  el.remove();
  return h;
};
const createVNodeTh = (th) => {
  const tdList = [];
  th.forEach((ite) => {
    const ths = `<th style="max-width: 79px">${ite.prop}</th>`;
    tdList.push(ths);
  });
  const nodes = `
    <table style="width: 555.1px;border-collapse: collapse;">
      <tr style="max-width: 79px" >
        ${tdList.join("")}
      </tr>
    </table>
  `;
  // 创建一个临时的 div 元素
  const tempDiv = document.createElement("div");
  // 设置 innerHTML
  tempDiv.innerHTML = nodes;
  // 获取 table 元素，而不是 firstChild
  const tableElement = tempDiv.querySelector("table");
  // 可以在此添加类名
  tableElement.classList.add("td_hyy");
  // 将 table 元素添加到 body 中
  document.body.appendChild(tableElement);
  const el = document.querySelector(".td_hyy");
  const h = el.offsetHeight;
  el.remove();
  return h;
};
// 计算行数
const calculateLines = (
  text,
  containerWidth = 521,
  fontSize = 12,
  fontFamily = "Microsoft YaHei"
) => {
  // 创建一个隐藏的span用于测量字符宽度
  const span = document.createElement("span");
  span.style.position = "absolute";
  span.style.visibility = "hidden";
  span.style.fontSize = `${fontSize}px`;
  span.style.fontFamily = fontFamily;
  document.body.appendChild(span);

  // 递归函数，返回每一行的字符串
  function getLine(text) {
    let start = 0;
    let end = text.length;

    // 二分查找适合的字符长度，确保这一行内容在指定宽度内
    while (start < end) {
      const mid = Math.floor((start + end + 1) / 2);
      span.innerText = text.slice(0, mid);
      if (span.offsetWidth <= containerWidth) {
        start = mid;
      } else {
        end = mid - 1;
      }
    }

    // 返回当前行的文本及剩余文本
    return [text.slice(0, start), text.slice(start)];
  }

  // 主函数体，递归调用
  function splitTextToLines(text, lines = []) {
    if (!text) return lines; // 递归终止条件：文本为空时返回结果
    const [currentLine, remainingText] = getLine(text); // 获取当前行及剩余文本
    lines.push(currentLine); // 将当前行添加到结果数组
    return splitTextToLines(remainingText, lines); // 递归处理剩余文本
  }

  // 开始分行
  const lines = splitTextToLines(text);

  // 移除用于测量的span
  document.body.removeChild(span);

  return lines;
};
const H_JSON = (val) => {
  if (!val) return val;
  return JSON.parse(JSON.stringify(val));
};
</script>

<style lang="scss" scoped>
.contents {
  width: 100%;
  display: flex;
  align-items: flex-start;
}
// .td_hyy {
//   z-index: 9999;
//   width: 900px;
//   td{
//    line-height: 23px;
//     padding: 4px 0;
//     box-sizing: border-box;
//     font-size: 12px;
//   }
// }
.pdf_content {
  margin-right: 40px;
  width: 793px;
  .pdf_item {
    width: 100%;
    // height: 1122px;
    height: 100%;
    margin-bottom: 20px;
    background-color: #f5f5f5;
    box-shadow: 2px 2px 8px #d6d6d6;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    overflow: hidden;
  }
  .item_l {
    width: 70%;
    height: 100%;
    .comment {
      // margin: 5px 0 15px;
      width: 100%;
      border-radius: 8px;
      background: #f9fbfe;
      font-weight: 400;
      font-size: 14px;
      color: #1d2129;
      padding: 0 17px;
      box-sizing: border-box;
      &_list {
        padding: 13px 0;
        border-bottom: 1px dashed #6d6d6d;
        box-sizing: border-box;
        .comment_head {
          display: flex;
          align-items: center;
          color: #1d2129;
          font-weight: 500;
          line-height: 19px;
        }
        .comment_value {
          color: #333333;
          font-weight: 400;
          font-size: 12px;
          margin-top: 5px;
          line-height: 16px;
        }
        .comment_values {
          color: #333333;
          font-weight: 400;
          font-size: 12px;
          margin-top: 5px;
          line-height: 16px;
        }
      }
      &_list:last-child {
        border: none;
      }
    }
  }
  .item_r {
    width: 30%;
    height: 100%;
    border-left: 1px dashed #ccc;
  }
}
.comment_lists {
  z-index: 999;
}
</style>
