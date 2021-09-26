const fs = require('fs')
const path = require('path')
const EXAM_DATA_PATH = path.join(__dirname, 'EXAM_DATA')
const SCRIPT_FILE_PATH = path.join(__dirname, 'index.js')
const INPUT_FILE_PATH = path.join(__dirname, 'exam.input.json')
const DIST_FILE_PATH = path.join(__dirname, 'index.dist.js')

class Builder {
    run() {
        const content = fs.readFileSync(SCRIPT_FILE_PATH).toString()
        fs.writeFileSync(DIST_FILE_PATH, this.handleContent(content))
        return this
    }
    /**
     * 处理脚本文件内容
     * @param {string} content 原文件数据
     * @returns {string}
     */
    handleContent(content) {
        const examData = fs.readFileSync(EXAM_DATA_PATH)
        // const outputData = JSON.stringify(JSON.parse(decodeURI(examData)))
        const outputData = `'${examData}'`
        return content.replace(/static\sDEFAULT_EXAM_DATA\s=\s.*/, 'static DEFAULT_EXAM_DATA = ' + outputData)
    }
    /**
     * 若存在自定义的试题数据, 则编码后保存到 EXAM_DATA
     * @returns {this}
     */
    encodeInputFile() {
        try {
            const inputFileContent = fs.readFileSync(INPUT_FILE_PATH).toString()
            if (!inputFileContent) return this
            fs.writeFileSync(EXAM_DATA_PATH, encodeURI(inputFileContent))
        } catch(err) {}
        return this
    }
}

const builder = new Builder()
builder.encodeInputFile()
    .run()
