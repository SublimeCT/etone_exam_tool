# etone_exam_tool
> 此项目用于填充 **标准答案**

## 使用
进入答题页面, 按 `F12` 打开浏览器(**请使用 Chrome**)的 `devtool`, 点击 `Console`, 将以下代码复制到输入框并按回车执行

```javascript
const ExamScript = document.createElement('script');
ExamScript.src="https://cdn.jsdelivr.net/gh/SublimeCT/etone_exam_tool/dist.js";
document.body.appendChild(ExamScript);
```
