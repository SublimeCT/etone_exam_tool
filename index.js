/**
 * 考试
 */
class Exam {
    /** 题目 */
    title = ''
    /**
     * 单选题
     * @type {{[title: string]: Array<string>}}
     */
    radioExamItems = {}
    /**
     * 多选题
     * @type {{[title: string]: Array<string>}}
     */
    checkboxExamItems = {}
    /**
     * 判断题
     * @type {{[title: string]: Array<string>}}
     */
    judgingExamItems = {}
    /**
     * 题型配置
     * @returns {{[type: string]: {label: string, field: string}}}
     */
    static EXAM_TYPE = {
        RADIO: {
            label: '单选题',
            field: 'radioExamItems',
        },
        CHECKBOX: {
            label: '多选题',
            field: 'checkboxExamItems',
        },
        JUDGING: {
            label: '判断题',
            field: 'judgingExamItems',
        },
    }
    /** 全部试题数据, 由 `build.js` 替换 */
    static DEFAULT_EXAM_DATA = '{}'
    static _DEFAULT_EXAM = null
    static get DEFAULT_EXAM() { return Exam._DEFAULT_EXAM || (Exam._DEFAULT_EXAM = JSON.parse(decodeURI(Exam.DEFAULT_EXAM_DATA))) }
    static _exams = null
    /**
     * 获取本地保存的考试数据
     * @returns {{[examTitle: string]: Exam}}
     */
    static get exams() {
        if (Exam._exams) return Exam._exams
        let localExams = localStorage.getItem('exams')
        if (!localExams) {
            const defaultExam = {}
            for (const title in Exam.DEFAULT_EXAM) {
                defaultExam[title] = new Exam(Exam.DEFAULT_EXAM[title])
            }
            return defaultExam
        }
        localExams = JSON.parse(localExams)
        for (const examTitle in localExams) {
            localExams[examTitle] = new Exam(localExams[examTitle])
        }
        return Exam._exams = localExams
    }
    static set exams(exams) {
        return localStorage.setItem('exams', JSON.stringify(exams))
    }
    /**
     * 保存试题数据
     * @param {Exam} exam 考试
     */
    static saveExam(exam) {
        if (!exam instanceof Exam) throw new TypeError('Invalid Exam')
        const localExams = Exam.exams
        const existsExam = localExams[exam.title]
        if (existsExam) {
            existsExam.merge(exam)
        } else {
            localExams[exam.title] = exam
        }
        Exam.exams = localExams
    }
    constructor(data) { Object.assign(this, data) }
    merge(exam) {
        for (const type in Exam.EXAM_TYPE) {
            const field = Exam.EXAM_TYPE[type].field
            Object.assign(this[field], exam[field])
        }
    }
    /**
     * 根据题型元素获取题型
     * @param {HTMLDivElement} el
     * @returns {Exam.EXAM_TYPE}
     */
    getExamType(el) {
        for (const name in Exam.EXAM_TYPE) {
            if (el.innerText.indexOf(Exam.EXAM_TYPE[name].label) !== -1) return Exam.EXAM_TYPE[name]
        }
    }
    /**
     * 根据题型元素获取题目
     * @param {HTMLDivElement} el
     * @returns {string}
     */
    getExamItemTitle(el) {
        for (const child of Array.from(el.childNodes)) {
            if (child.nodeType === 3) return child.nodeValue
        }
        console.log(el.childNodes.length)
    }
}

class Tool {
    /**
     * 考试
     * @type {Exam}
     */
    exam = undefined
    /**
     * 当前是否是考试明细页面
     */
    static get isPreviewPage() { return location.pathname === '/exam/exam/UserPaperPreview.aspx' }
    /**
     * 考试试题父级元素
     * @returns {HTMLDivElement}
     */
    static get EXAM_WRAPPER_EL() { return document.getElementById('divPaper') }
    /**
     * 考试名称
     * @returns {string}
     */
    static get EXAM_TITLE() { return document.getElementById('lblTitle').innerText }
    constructor(exam) { this.exam = exam }
    init() {
        if (Tool.isPreviewPage) {
            this.getExamData().save()
        } else {
            console.log('答题 ...')
        }
    }
    getExamData() {
        this.exam.title = Tool.EXAM_TITLE
        let currentExamType = Exam.EXAM_TYPE.RADIO // 当前题型
        for (const examItemEl of Tool.EXAM_WRAPPER_EL.children) {
            let examItemTitle = '' // 当前试题题目
            let examItem = [] // 当前试题答案
            if (this.isExamListEl(examItemEl)) {
                // 便利每个题型下的所有题
                for (const examItemRowItem of examItemEl.children) {
                    if (examItemRowItem.matches('.tableheadtitle')) { // 题目
                        examItemTitle = this.exam.getExamItemTitle(examItemRowItem)
                    } else if (examItemRowItem.matches('table')) {
                        if (examItemRowItem.matches('.exam_operation')) { // 所有选项 table
                            const options = examItemRowItem.querySelectorAll('tr > td > span')
                            for (const optEl of options) {
                                const checked = !!optEl.querySelector('input[checked]')
                                const optText = optEl.querySelector('span').innerText
                                if (checked) {
                                    examItem.push(optText)
                                }
                            }
                        } else if (examItemRowItem.innerText.indexOf('得分') > 0) { // 得分
                            const fontEl = examItemRowItem.querySelector('font')
                            const isRight = fontEl && fontEl.outerHTML.toLowerCase().indexOf('blue') > 0
                            if (isRight) {
                                this.exam[currentExamType.field][examItemTitle] = examItem
                            }
                            examItem = []
                        }
                    }
                }
            } else {
                currentExamType = this.exam.getExamType(examItemEl)
            }
        }
        return this
    }
    save() {
        console.warn(this.exam)
        Exam.saveExam(this.exam)
    }
    /**
     * 当前元素是否是包含试题的元素
     * @param {HTMLDivElement} el
     * @returns {boolean}
     */
    isExamListEl(el) { return el.id.indexOf('divContentListForType') === 0 }
}

window._$Exam = new Exam()
window._$ExamTool = new Tool(window._$Exam)
window._$ExamTool.init()
