import Mock from "mockjs";

export const randomValue = Mock.mock({
  "data|5-10": [
    // 生成5到10个外层数组
    [
      {
        "table|6": [
          // 每个内层数组包含1到3个table
          {
            course: "@ctitle(3, 5)",
            grade: "@integer(1, 100)",
            gpa: "@float(0, 4, 1, 2)",
            credit: "@float(0.5, 5, 1, 1)",
            totalScore: "@integer(60, 100)",
            examScore: "@integer(60, 100)",
            monthlyScore: "@integer(60, 100)",
            midTermScore: "@integer(60, 100)",
            finalExamScore: "@integer(60, 100)",
            bonus: "@integer(0, 10)",
            time: '@datetime("yyyy-MM-dd")',
          },
        ],
        "comments|4": [
          // 每个table对应1到2个评论
          {
            date: '@datetime("yyyy-MM-dd")',
            teacher: "@cname",
            content: "@cparagraph(3, 5)",
          },
        ],
      },
    ],
  ],
});
