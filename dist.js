class Exam {
    /** 标准答案 ID 前缀 */
    static STANDARD_ANSWER_ID_PREFIX = 'hidStandardAnswer'
    /**
     * 所有标准答案 input 元素集合
     * @type {NodeList}
     */
    static get ALL_STANDARD_ANSWER_EL() { return document.querySelectorAll(`input[id^=${Exam.STANDARD_ANSWER_ID_PREFIX}]`) }
    /**
     * PaperViewUtil instance
     */
    static _newvUtil = null
    /**
     * PaperViewUtil
     */
    static get newvUtil() {
        const util = Exam._newvUtil || (Exam._newvUtil = new newv.exam.paperViewUtil())
        util.paperVersion = '2.0'
        return util
    }
}

class Tool {
    constructor(exam) { this.exam = exam }
    /**
     * 填充标准答案
     */
    fillStandardAnswer() {
        // 所有考题标准答案
        for (const answerInputEl of Exam.ALL_STANDARD_ANSWER_EL) {
            const questionID = this.getQuestionIDByAnswerInput(answerInputEl)
            const answerList = this.getAnswerByAnswerInput(answerInputEl)
            // 选中所有标准答案
            for (const answerItem of answerList) {
                const answerEl = document.querySelector(`#Answer_${questionID}[value="${answerItem}"]`)
                answerEl.click()
            }
        }
    }
    /**
     * 从答案 <input> 中获取 question ID
     * @param {HTMLInputElement} el input
     * @returns {string}
     */
    getQuestionIDByAnswerInput(el) {
        return el.id.substr(Exam.STANDARD_ANSWER_ID_PREFIX.length + 1)
    }
    /**
     * 从答案 input 中获取标准答案
     * @param {HTMLInputElement} el input
     * @return {Array<string>}
     */
    getAnswerByAnswerInput(el) {
        const answerList = Exam.newvUtil.GetStandardAnswerByPaperVersion(el.value)
        return answerList.split('|')
    }
}

window._$Exam = new Exam()
window._$ExamTool = new Tool(window._$Exam)
window._$ExamTool.fillStandardAnswer()
