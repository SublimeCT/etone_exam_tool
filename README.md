# etone_exam_tool
> 答案取自答卷查看页, 可能不全

## Usage

1. build

```bash
# or npm run build
yarn build
```

2. 复制 `index.dist.js` 到浏览器 `devtool` 中执行
    - 考试页: 填充大部分试题答案
    - 答卷查看页: 爬取试题答案

## 更新试题数据
1. 将试题数据(`json`) 复制到 `exam.input.json` 文件中(不存在时创建此文件)
2. 重新执行 `build` 生成 `index.dist.js`

```bash
# or npm run build
yarn build
```
