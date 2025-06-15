
const DATA02 = [];
let SCORE_COUNT = 1; // Biến đếm số lượng điểm
let EDITING_ID = null; // Biến lưu ID đang chỉnh sửa
let CURRENT_LANG = 'vi';

function can_lc_initI18n(lang = 'vi') {
    return new Promise((resolve, reject) => {
        $.i18n({ locale: lang }).load(`./transl/${lang}.json`, lang).done(function () {
            CURRENT_LANG = lang;
            resolve();
        }).fail(function () {
            reject();
        });
    });
}

function do_lc_translateText(key, defaultText = '') {
    return $.i18n(key) || defaultText;
}

function do_lc_updatePageTranslations() {
    // Dịch các element có data-i18n
    $('[data-i18n]').each(function () {
        const key = $(this).data('i18n');
        $(this).text(do_lc_translateText(key));
    });
    // Dịch placeholder
    $('[data-i18n-placeholder]').each(function () {
        const key = $(this).data('i18n-placeholder');
        $(this).attr('placeholder', do_lc_translateText(key));
    });
}

Handlebars.registerHelper('transl', function (key) {
    return new Handlebars.SafeString(do_lc_translateText(key));
});

// Hàm load template và hiển thị (local - thực thi tải và hiển thị)
function do_lc_loadTmplAndShow(tmplPath, data, divToShow) {
    $.get(tmplPath, function (html) {
        const tmpl = Handlebars.compile(html);
        $(divToShow).html(tmpl(data));
        do_lc_updatePageTranslations(); 
        can_lc_bindEvents();
    }).fail(function () {
        console.error("Failed to load template:", tmplPath);
    });
}

// Hàm chuyển đổi ngôn ngữ (local - thực thi chuyển đổi)
function do_lc_switchLanguage(lang) {
    can_lc_initI18n(lang).then(() => {
        do_lc_updatePageTranslations();
        do_lc_loadTmplAndShow("./tmpl02.html", DATA02, "#div_USERstudent_list_main");
        $("#sel_USERstudent_lang_switch").val(lang);
    }).catch(() => {
        console.error("Failed to load language:", lang);
    });
}

function do_lc_loadInitialData() {
    $.getJSON('students.json', function (jsonData) {
        if (!Array.isArray(jsonData)) {
            console.error("students.json is not an array");
            do_lc_loadTmplAndShow("./tmpl02.html", DATA02, "#div_USERstudent_list_main");
            return;
        }
        DATA02.length = 0;
        DATA02.push(...jsonData.map(item => ({
            ID: item.ID || Math.max(...DATA02.map(s => s.ID), 0) + 1,
            name: item.name || "Unknown",
            age: item.age || 20,
            mon: Array.isArray(item.mon) ? item.mon : []
        })));
        do_lc_loadTmplAndShow("./tmpl02.html", DATA02, "#div_USERstudent_list_main");
    }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error("Failed to load students.json:", textStatus, errorThrown);
        do_lc_loadTmplAndShow("./tmpl02.html", DATA02, "#div_USERstudent_list_main");
    });
}

function do_lc_createScoreRow(count, selectedSubject = '', score = '') {
    return `
        <div class="score_row mb-3">
            <div class="row">
                <div class="col-md-6">
                    <select class="form-select objData" data-name="note${count}_name">
                        <option value="">${do_lc_translateText('select_subject')}</option>
                        <option value="Toan" ${selectedSubject === 'Toan' ? 'selected' : ''}>${do_lc_translateText('mathematics')}</option>
                        <option value="Van" ${selectedSubject === 'Van' ? 'selected' : ''}>${do_lc_translateText('literature')}</option>
                        <option value="Tieng Anh" ${selectedSubject === 'Tieng Anh' ? 'selected' : ''}>${do_lc_translateText('english')}</option>
                        <option value="Ly" ${selectedSubject === 'Ly' ? 'selected' : ''}>${do_lc_translateText('physics')}</option>
                        <option value="Hoa" ${selectedSubject === 'Hoa' ? 'selected' : ''}>${do_lc_translateText('chemistry')}</option>
                        <option value="Sinh" ${selectedSubject === 'Sinh' ? 'selected' : ''}>${do_lc_translateText('biology')}</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <div class="input-group">
                        <input type="number" class="form-control objData" 
                               data-name="note${count}_val" placeholder="${do_lc_translateText('score')} (0-10)" 
                               step="0.1" min="0" max="10" value="${score}">
                        <span class="input-group-text">/10</span>
                    </div>
                </div>
            </div>
        </div>`;
}

function do_lc_setupValidation() {
    // Thêm validation event cho form
    do_gl_add_validation_event({
        dataZone: $("#div_USERstudent_form_main"),
        showError: true,
    });
}

function can_lc_bindEvents() {
    // Thêm môn học
    $("#btn_USERstudent_form_score_add").off("click").on("click", function () {
        SCORE_COUNT++;
        $("#div_USERstudent_form_scores_input").append(do_lc_createScoreRow(SCORE_COUNT));
    });

    
    $("#btn_USERstudent_form_save").off("click").on("click", function () {
        const data = req_gl_data({
            dataZoneDom: $("#div_USERstudent_form_main"),
            showError: true
        });
        if (!data.hasError) {
            const student = {
                ID: EDITING_ID || (Math.max(...DATA02.map(s => s.ID), 0) + 1),
                name: data.data.name,
                age: parseInt(data.data.age),
                mon: []
            };
            console.error("data.data", data.data);
            for (let i = 1; i <= SCORE_COUNT; i++) {
                if (data.data[`note${i}_name`] && data.data[`note${i}_val`]) {
                    student.mon.push({
                        tenmon: data.data[`note${i}_name`],
                        diem: parseFloat(data.data[`note${i}_val`])
                    });
                }
            }

            const index = DATA02.findIndex(s => s.ID === student.ID);
            if (index !== -1) {
                DATA02[index] = student;
            } else {
                DATA02.push(student);
            }
            do_lc_loadTmplAndShow("./tmpl02.html", DATA02, "#div_USERstudent_list_main");
            do_lc_resetForm();
            EDITING_ID = null;
        }
    });

    // Student list click event
    $("#tab_USERstudent_list_table tr:gt(0)").off("click").on("click", function () {
        const studentId = parseInt($(this).find("#td_USERstudent_list_id").text());
        const student = DATA02.find(s => s.ID === studentId);
        if (student) {
            let detailsHtml = `<h3>${student.name}</h3><ul>`;
            student.mon.forEach(score => {
                detailsHtml += `<li>${score.tenmon}: ${score.diem}</li>`;
            });
            detailsHtml += `</ul>`;
            $("#div_USERstudent_details_content").html(detailsHtml);
        }
    });

    // Student Delete click event
    $(".delete-btn").off("click").on("click", function (e) {
        e.stopPropagation();
        const studentId = parseInt($(this).data("id"));
        DATA02 = DATA02.filter(s => s.ID !== studentId);
        do_lc_loadTmplAndShow("./tmpl02.html", DATA02, "#div_USERstudent_list_main");
        $("#div_USERstudent_details_content").html("");
    });

    // Student Edit click event
    $(".edit-btn").off("click").on("click", function (e) {
        e.stopPropagation();
        const studentId = parseInt($(this).data("id"));
        const student = DATA02.find(s => s.ID === studentId);
        if (student) {
            EDITING_ID = studentId;
            $("#div_USERstudent_form_main input[data-name='name']").val(student.name);
            $("#div_USERstudent_form_main input[data-name='age']").val(student.age);
            $("#div_USERstudent_form_scores_input").html("");
            SCORE_COUNT = 0;

            student.mon.forEach((score, index) => {
                SCORE_COUNT++;
                $("#div_USERstudent_form_scores_input").append(do_lc_createScoreRow(SCORE_COUNT, score.tenmon, score.diem));
            });
        }
    });

    $("#sel_USERstudent_lang_switch").off("change").on("change", function () {
        const lang = $(this).val();
        do_lc_switchLanguage(lang);
    });
}

function do_lc_resetForm() {
    $("#div_USERstudent_form_main input").val("");
    $("#div_USERstudent_form_scores_input").html(do_lc_createScoreRow(1));
    SCORE_COUNT = 1;
}

$(document).ready(function () {
    can_lc_initI18n('vi').then(() => {
        do_lc_loadInitialData();
        do_lc_updatePageTranslations();
    });
});
