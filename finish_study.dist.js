/**
 * 课程学习信息
 */
class LessonStudyData {
    webroot = ''
    hidTrainUid = ''
    hidLessonUid = ''
    hidUserUid = ''
    hidDomain = ''
    hidLessonName = ''
    hidServerTime = ''
    hidLocationUid = ''
    recordSaveWeb = ''
}

class Lesson {
    /** 时间点 key, 对应时间为 2021/10/19 19:25:29 */
    static OLD_TIME_KEY = 'bhcRimtaRj5KvIZReBlgEuK0E6h lVGIrRRLVnuPVxF6SJTjy/c3wAx8rwZ8B76oS0GSlg1J8BnSSbsTOf5QC4clEu8rr1r63/Qy2ukxl26EFHQbduPEGVyNkOb6Be7Iq3W35P7KQmVoqQsl0gjhXu08EdEIKOwAN8riOIsQNYQ='
    /**
     * 所有课程图片
     * @type {Array<HTMLDivElement>}
     */
    static get DOM_LESSON_ITEMS() { return Array.from(document.querySelectorAll('.weui-media-box_appmsg')) }
    static getLessonInfo(lessonEl) {
        const imgEl = lessonEl.querySelector('img[data-lessonuid]')
        const [trainUid, lessonUid] = imgEl.getAttribute('onclick').match(/\('([\d\w-]+)','([\d\w-]+)',/)
        const info = {
            trainUid,
            lessonUid,
        }
        return info
    }
    /**
     * 保存课程进度
     * @param {LessonStudyData} Sdata 课程学习信息
     */
    static toFinished(Sdata) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: location.protocol + '//' + location.host + "/gate/LessonStudyAction.ashx",
                data: "action=CloseStudyRecord&trainUid=" + Sdata.hidTrainUid +
                    "&lessonUid=" + Sdata.hidLessonUid +
                    "&userUid=" + Sdata.hidUserUid +
                    "&beginTime=" + Lesson.OLD_TIME_KEY +
                    "&locationUid=" + Sdata.hidLocationUid +
                    "&locationOrder=" + 1 + // 暂时仅考虑只有一节的情况
                    "&realTime=" + '0' +
                    "&rnd=" + Math.random(),
                dataType: "jsonp",
                jsonp: "callback=?",
                jsonpCallback: "callback",
                success: function (data) {
                    resolve(data)
                },
                error: function () {
                    $(".item-save-result").text("保存失败!请重试!");
                    reject()
                }
            });
        })
    }

}

class Tool {
    lessonList = {}
    finishAll() {
        const images = Lesson.DOM_LESSON_ITEMS
        if (images.length === 0) alert('Error: Lesson not found')
        this.rewriteLessonLearnCheck2()
        for (const lesson of Lesson.DOM_LESSON_ITEMS) {
            const finished = lesson.querySelector('.weui-media-box__desc em').innerText === '100%'
            if (finished) continue
            const img = lesson.querySelector('img[data-lessonuid]')
            this.lessonList[img.getAttribute('data-lessonuid')]
            img.click()
        }
    }
    rewriteLessonLearnCheck2() {
        window._$LessonLearnCheck2 = window.LessonLearnCheck2
        window.LessonLearnCheck2 = (Sdata) => {
            if (typeof Sdata === 'string') Sdata = JSON.stringify(Sdata)
            Lesson.toFinished(Sdata).then(() => {
                Reflect.deleteProperty(this.lessonList, Sdata)
                this.checkFinished()
            })
        }
    }
    checkFinished() {
        if (Object.keys(this.lessonList).length > 0) return
        alert('已结束所有课程')
        Colse();
        location.reload()
    }
}

window._$Lesson = new Lesson()
window._$LessonTool = new Tool(window._$Lesson)
window._$LessonTool.finishAll()