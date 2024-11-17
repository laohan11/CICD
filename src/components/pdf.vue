<!-- 用于重构导出pdf的功能 -->

<!-- html2canvas
jspdf
fileSave -->

<template>
  <div>
    <el-button type="primary">Primary</el-button>
    <table v-if="false" style="width: 70%">
      <tr>
        <td style="min-width: 79px" v-for="ite in heads" :key="ite.id">
          {{ ite.prop }}
        </td>
      </tr>
    </table>
    <div v-if="true" class="pdf_content">
      <div class="pdf_item">
        <div class="item_l">
          <div v-for="(items, i) in list" :key="i">
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
            <div v-for="(ite, i) in items" :key="i" class="comment">
              <div v-for="it in ite.comments" :key="i" class="comment_list">
                <div class="comment_head">
                  <span class="comment_time">{{ it.teacher }}</span> |
                  <span class="comment_name">{{ it.date }}</span>
                </div>
                <div class="comment_value">{{ it.content }}</div>
              </div>
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
const newList = ref([[{ table: [], comments: [] }]]);

const computedTrHeight = () => {
  // 计算表头高度
  let MAX_HEIGHT = 1112;
  let PAGE = 0;
  let CURRENT = 0;

  list.value.forEach((item) => {
    item.forEach((ite) => {
      // 先计算表头，实际表头是动态的，但是这里做了静态处理
      const TH_HEIGHT = createVNodeTh(heads.value);
      MAX_HEIGHT -= TH_HEIGHT;
      // 需要分页到下一页
      if (MAX_HEIGHT < 0) {
        MAX_HEIGHT = 1112;
        CURRENT = 0;
        PAGE++;
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
          newList.value[PAGE] = [[{ table: [], comments: [] }]];
        } else {
          console.log(
            H_JSON(newList.value),
            PAGE,
            H_JSON(newList.value[PAGE]),
            "PAGE"
          );
          newList.value[PAGE][CURRENT].table.push(td);
        }
      });
      ite.comments.forEach((com) => {
        // 先减去padding-top
        MAX_HEIGHT -= 13;
        if (MAX_HEIGHT < 0) {
          MAX_HEIGHT = 1112;
          CURRENT = 0;
          PAGE++;
          newList.value[PAGE] = [[{ table: [], comments: [] }]];
        } else {
          // 减去标题宽度
          MAX_HEIGHT -= 23;
          if (MAX_HEIGHT < 0) {
            MAX_HEIGHT = 1112;
            CURRENT = 0;
            PAGE++;
            newList.value[PAGE] = [[{ table: [], comments: [] }]];
          } else {
            // const COMMENTS_HEIGHT = createVNodeComments(com);
            // MAX_HEIGHT -= COMMENTS_HEIGHT;
            const line = calculateLines(com.content);
            console.log(line, "line");
            const COMMENTS = [];
            line.forEach((lin, index) => {
              MAX_HEIGHT -= lin * 15.2;
              if (MAX_HEIGHT < 0) {
                MAX_HEIGHT = 1112;
                CURRENT = 0;
                PAGE++;
                let coms = com;
                coms.content = line.slice(index);
                newList.value[PAGE] = [[{ table: [], comments: [coms] }]];
              } else {
                COMMENTS.push(lin);
              }
            });
            // 需要分页到下一页
            if (MAX_HEIGHT < 0) {
              MAX_HEIGHT = 1112;
              CURRENT = 0;
              PAGE++;
              newList.value[PAGE] = [[{ table: [], comments: [] }]];
            } else {
              newList.value[PAGE][CURRENT].comments.push(com);
              MAX_HEIGHT -= 13;
            }
          }
        }
      });
    });
    if (!PAGE) {
      CURRENT++;
      console.log(H_JSON(newList.value[PAGE]), PAGE, CURRENT, "sssd");

      newList.value[PAGE][CURRENT] = { table: [], comments: [] };
    }
  });
};

//  创建虚拟dom
const createVNodeTd = (td) => {
  const tdList = [];
  for (const key in td) {
    const item = td[key];
    const tds = `<td style="min-width: 79px">${item}</td>`;
    tdList.push(tds);
  }
  const nodes = `
    <table style="width: 555.1px;border-collapse: collapse;">
      <tr style="min-width: 79px" >
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
    const ths = `<th style="min-width: 79px">${ite.prop}</th>`;
    tdList.push(ths);
  });
  const nodes = `
    <table style="width: 555.1px;border-collapse: collapse;">
      <tr style="min-width: 79px" >
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
const createVNodeComments = (com) => {
  const nodes = `<div class="comment_lists"><div class="comment_values" style="width:521px">${com.content}</div></div>`;
  console.log(nodes, "hyy");

  // 创建一个临时的 div 元素
  const tempDiv = document.createElement("div");
  // 设置 innerHTML
  tempDiv.innerHTML = nodes;
  document.body.appendChild(tempDiv);
  const el = document.querySelector(".comment_values");
  console.log(el, "hyy");
  const rects = el.getClientRects();
  console.log(rects, "hyy");
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
.td_hyy {
  z-index: 9999;
  width: 900px;
}
.pdf_content {
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
  }
  .item_l {
    width: 70%;
    height: 100%;
    .comment {
      margin: 5px 0 15px;
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
        }
        .comment_value {
          color: #333333;
          font-weight: 400;
          font-size: 12px;
          margin-top: 5px;
        }
        .comment_values {
          color: #333333;
          font-weight: 400;
          font-size: 12px;
          margin-top: 5px;
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
