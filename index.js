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
     * 多选题(包含全部选项)
     * @description 由于实际考试时多选题的选项可能与保存的答案选项不同, 所有选项 > 显示的选项, 所以保存的答案信息并不完全正确, 可能存在漏选的情况
     * @description 此数据的意义在于计算多选题选项的覆盖率
     * @type {{[title: string]: Array<string>}}
     */
    allCheckboxExamItems = {}
    /**
     * 判断题
     * @type {{[title: string]: Array<string>}}
     */
    judgingExamItems = {}
    /**
     * 题型配置
     * @returns {{[type: string]: {label: string, field: string, concatOptions: boolean}}}
     */
    static EXAM_TYPE = {
        RADIO: {
            label: '单选题',
            field: 'radioExamItems',
            /** 在 merge 时是否将所有选项混合 */
            concatOptions: false,
            /** 需要保存所有 option 的字段, 若为空则不保存 */
            saveAllOptionsField: null,
        },
        CHECKBOX: {
            label: '多选题',
            field: 'checkboxExamItems',
            /** 在 merge 时是否将所有选项混合 */
            concatOptions: true,
            /** 需要保存所有 option 的字段, 若为空则不保存 */
            saveAllOptionsField: 'allCheckboxExamItems',
        },
        JUDGING: {
            label: '判断题',
            field: 'judgingExamItems',
            /** 在 merge 时是否将所有选项混合 */
            concatOptions: false,
            /** 需要保存所有 option 的字段, 若为空则不保存 */
            saveAllOptionsField: null,
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
        return localExams[exam.title]
    }
    static filterExamName(name) {
        return name
            .replace(/^\s+\d+[\.|．]\s+/, '') // .e.g '  1． '
            .replace(/\s+（.*）\s?$/, '') // .e.g '     （5 分）'
    }
    static filterDetailsPageExamName(name) {
        return name
            .replace(/^\s+/, '') // .e.g ' '
            .replace(/\s+（.*）\s?$/, '') // .e.g '     （5 分）'
    }
    static filterAttendExamOptionName(name) {
        return name.replace(/^\w．\s*/, '')
    }
    constructor(data) { Object.assign(this, data) }
    merge(exam) {
        for (const typeKey in Exam.EXAM_TYPE) {
            // 合并试题数据
            const type = Exam.EXAM_TYPE[typeKey]
            if (type.concatOptions) { // 将每个题的 options 合并
                this.mergeOption(exam, type.field)
                // const allExamItem = {...exam[type.field]} // 保存合并后的所有题目
                // for (const examItemTitle in this[type.field]) { // 遍历所有题
                //     // 已存在的题
                //     const existsExamItem = allExamItem[examItemTitle]
                //     // 若传入的 exam 存在此题, 则将选项与已存在的选项合并
                //     allExamItem[examItemTitle] = existsExamItem
                //         ? [...new Set(existsExamItem.concat(this[type.field][examItemTitle]))]
                //         : this[type.field][examItemTitle]
                // }
                // this[type.field] = allExamItem
                console.log(this[type.field])
            } else {
                Object.assign(this[type.field], exam[type.field])
            }
            // 若保存了此题型的试题的全部 option, 则将选项也进行合并
            if (type.saveAllOptionsField) this.mergeOption(exam, type.saveAllOptionsField)
        }
    }
    mergeOption(newExamItem, field) {
        const allExamItem = { ...newExamItem[field] } // 保存合并后的所有题目
        for (const examItemTitle in this[field]) { // 遍历所有题
            // 已存在的题
            const existsExamItem = allExamItem[examItemTitle]
            // 若传入的 exam 存在此题, 则将选项与已存在的选项合并
            allExamItem[examItemTitle] = existsExamItem
                ? [...new Set(existsExamItem.concat(this[field][examItemTitle]))]
                : this[field][examItemTitle]
        }
        this[field] = allExamItem
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
            if (child.nodeType === 3) return Exam.filterDetailsPageExamName(child.nodeValue)
        }
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
     * 考试试题父级元素(考试答题页)
     * @returns {HTMLDivElement}
     */
    static get ATTEND_EXAM_WRAPPER_EL() { return document.getElementById('divPaperContent') }
    /**
     * 考试名称(详情页)
     * @returns {string}
     */
    static get EXAM_TITLE() { return document.getElementById('lblTitle').innerText }
    /**
     * 考试名称(考试答题页)
     * @returns {string}
     */
    static get ATTEND_EXAM_TITLE() { return document.getElementById('divExamName').innerText }
    constructor(exam) { this.exam = exam }
    init() {
        this.printHelpMessage()
        if (Tool.isPreviewPage) {
            this.getExamData().save()
        } else {
            this.fillExam()
        }
    }
    printHelpMessage() {
        console.log('%c[etone_exam_tool] %c考试答案填充/解析脚本', 'color: black;padding: 3px;background-color: pink;border-radius: 3px;', 'color: white;padding: 3px;background-color: black;border-radius: 3px;')
        console.log('usage: %cwindow._$ExamTool.init();%c\t // 重新执行脚本(填充考试答案或解析答案);', 'color: teal;', '')
    }
    fillExam() {
        // 1. 获取考题数据
        const exam = this.getCurrentExam()
        // 2. 填充已知考题答案
        let currentExamType = Exam.EXAM_TYPE.RADIO // 当前题型
        for (const examItemEl of Tool.ATTEND_EXAM_WRAPPER_EL.children) {
            // let examItemTitle = '' // 当前试题题目
            // let examItem = [] // 当前试题答案
            if (this.isAttendExamListEl(examItemEl)) {
                // 便利每个题型下的所有题(子元素为 table, 每个题一个 table)
                for (const examItemRowItem of examItemEl.children) {
                    // 获取题目
                    const examItemTitle = this.getAttendExamTitle(examItemRowItem)
                    // 查找已知试题中是否存在此题
                    const existsExamItem = exam[currentExamType.field][examItemTitle]
                    if (!existsExamItem) {
                        console.warn('当前题目答案未知: ', examItemTitle)
                        continue
                    }
                    // 遍历所有选项并选中正确选项
                    const examItemElOptions = this.getAttendExamElOptionSpanList(examItemRowItem)
                    if (examItemElOptions.length === 0) console.warn('Internal Erorr: 未获取到选项')
                    for (const option of examItemElOptions) {
                        const optionName = Exam.filterAttendExamOptionName(option.innerText)
                        if (existsExamItem.includes(optionName)) {
                            option.click()
                        }
                    }
                }
            } else {
                currentExamType = this.exam.getExamType(examItemEl)
            }
        }
        return this
    }
    getAttendExamElOptionSpanList(el) {
        const multipleSpanList = el.querySelectorAll('table.Nsb_exam_xuanxiang tr > td > span')
        if (multipleSpanList.length > 0) return multipleSpanList 
        return el.querySelectorAll('tr')[1].querySelectorAll('span')
    }
    /**
     * 获取题目(答题页)
     * @param {HTMLTableElement} el
     * @returns {string}
     */
    getAttendExamTitle(el) {
        const td = el.querySelector('tr.Nsb_exam_sttitle_small > td')
        return Exam.filterExamName(td.innerText)
    }
    getCurrentExam() {
        for (const examTitle in Exam.exams) {
            if (Tool.ATTEND_EXAM_TITLE.indexOf(examTitle) !== -1) return Exam.exams[examTitle]
        }
        alert('[Tool Warning]: 当前考题数据不存在')
    }
    getExamData() {
        this.exam.title = Tool.EXAM_TITLE
        let currentExamType = Exam.EXAM_TYPE.RADIO // 当前题型
        for (const examItemEl of Tool.EXAM_WRAPPER_EL.children) {
            let examItemTitle = '' // 当前试题题目
            let examItem = [] // 当前试题答案
            let saveAllOptionsField = [] // 所有选项
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
                                saveAllOptionsField.push(optText)
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
                            // 保存所有 options 以计算考试时已保存的答案是否准确
                            if (currentExamType.saveAllOptionsField) this.exam[currentExamType.saveAllOptionsField][examItemTitle] = saveAllOptionsField
                            saveAllOptionsField = []
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
        this.exam = Exam.saveExam(this.exam)
        console.warn('考题数据: ', this.exam)
    }
    /**
     * 当前元素是否是包含试题的元素
     * @param {HTMLDivElement} el
     * @returns {boolean}
     */
    isExamListEl(el) { return el.id.indexOf('divContentListForType') === 0 }
    /**
     * 当前元素是否是包含试题的元素(答题页)
     * @param {HTMLDivElement} el
     * @returns {boolean}
     */
    isAttendExamListEl(el) { return el.matches('.Nsb_exam_stcontent') }
}

window._$Exam = new Exam()
window._$ExamTool = new Tool(window._$Exam)
window._$ExamTool.init()
