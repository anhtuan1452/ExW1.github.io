let data02 = [];
let scoreCount = 1;
let editingId = null;
let currentLang = 'vi';

// Khởi tạo i18n
function initI18n(lang = 'vi') {
    return new Promise((resolve, reject) => {
        $.i18n({ locale: lang}).load(`./transl/${lang}.json`, lang).done(function() {
            currentLang = lang;
            resolve();
        }).fail(function() {
            reject();
        });
    });
}

// Hàm dịch text
function translateText(key, defaultText = '') {
    return $.i18n(key) || defaultText;
}

// Cập nhật tất cả text trên trang
function updatePageTranslations() {
    // Dịch các element có data-i18n
    $('[data-i18n]').each(function() {
        const key = $(this).data('i18n');
        $(this).text(translateText(key));
    });
    
    // Dịch placeholder
    $('[data-i18n-placeholder]').each(function() {
        const key = $(this).data('i18n-placeholder');
        $(this).attr('placeholder', translateText(key));
    });
}

// Handlebars helper cho dịch
Handlebars.registerHelper('transl', function(key) {
    return new Handlebars.SafeString(translateText(key));
});

Handlebars.registerHelper('select', function(value, options) {
    var $el = $('<select />').html(options.fn(this));
    $el.find('[value="' + value + '"]').attr({'selected': 'selected'});
    return $el.html();
});

// Load template và hiển thị
var loadTmplAndShow = function(tmplPath, data, divToShow) {
    $.get(tmplPath, function(html) {
        var tmpl = Handlebars.compile(html);
        $(divToShow).html(tmpl(data));
        updatePageTranslations(); // Cập nhật dịch sau khi render
        bindEvents();
    }).fail(function() {
        console.error("Failed to load template:", tmplPath);
    });
};

// Chuyển đổi ngôn ngữ
function switchLanguage(lang) {
    initI18n(lang).then(() => {
        updatePageTranslations();
        loadTmplAndShow("./tmpl02.html", data02, "#div_02");
        $("#language_selector").val(lang);
    }).catch(() => {
        console.error("Failed to load language:", lang);
    });
}

// Load dữ liệu ban đầu
function loadInitialData() {
    $.getJSON('students.json', function(jsonData) {
        if (!Array.isArray(jsonData)) {
            console.error("students.json is not an array");
            loadTmplAndShow("./tmpl02.html", data02, "#div_02");
            return;
        }
        data02 = jsonData.map(item => ({
            ID: item.ID || Math.max(...data02.map(s => s.ID), 0) + 1,
            name: item.name || "Unknown",
            age: item.age || 20,
            mon: Array.isArray(item.mon) ? item.mon : []
        }));
        loadTmplAndShow("./tmpl02.html", data02, "#div_02");
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error("Failed to load students.json:", textStatus, errorThrown);
        loadTmplAndShow("./tmpl02.html", data02, "#div_02");
    });
}

// Tạo score row mới
function createScoreRow(count, selectedSubject = '', score = '') {
    return `
        <div class="score_row mb-3">
            <div class="row">
                <div class="col-md-6">
                    <select class="form-select objData" data-name="note${count}_name">
                        <option value="">${translateText('select_subject')}</option>
                        <option value="Toan" ${selectedSubject === 'Toan' ? 'selected' : ''}>${translateText('mathematics')}</option>
                        <option value="Van" ${selectedSubject === 'Van' ? 'selected' : ''}>${translateText('literature')}</option>
                        <option value="Tieng Anh" ${selectedSubject === 'Tieng Anh' ? 'selected' : ''}>${translateText('english')}</option>
                        <option value="Ly" ${selectedSubject === 'Ly' ? 'selected' : ''}>${translateText('physics')}</option>
                        <option value="Hoa" ${selectedSubject === 'Hoa' ? 'selected' : ''}>${translateText('chemistry')}</option>
                        <option value="Sinh" ${selectedSubject === 'Sinh' ? 'selected' : ''}>${translateText('biology')}</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <div class="input-group">
                        <input type="number" class="form-control objData" 
                               data-name="note${count}_val" placeholder="${translateText('score')} (0-10)" 
                               step="0.1" min="0" max="10" value="${score}">
                        <span class="input-group-text">/10</span>
                    </div>
                </div>
            </div>
        </div>`;
}
// Thêm validation cho InputTool
function setupValidation() {
  // Thêm validation event cho form
  do_gl_add_validation_event({
    dataZone: $("#khoi"),
    event: "blur",
    showError: true,
  })
}
// Gắn sự kiện
function bindEvents() {
    // Thêm môn học
    $("#add_score").off("click").on("click", function() {
        scoreCount++;
        $("#scores_input").append(createScoreRow(scoreCount));
    });

    // Lưu sinh viên
    $("#btn_show").off("click").on("click", function() {
        var data = req_gl_data({ 
            dataZoneDom: $("#khoi"),
            showError: true});
        if (!data.hasError) {
            var student = {
                ID: editingId || (Math.max(...data02.map(s => s.ID), 0) + 1),
                name: data.data.name,
                age: parseInt(data.data.age),
                mon: []
            };
            
            for (let i = 1; i <= scoreCount; i++) {
                if (data.data[`note${i}_name`] && data.data[`note${i}_val`]) {
                    student.mon.push({
                        tenmon: data.data[`note${i}_name`],
                        diem: parseFloat(data.data[`note${i}_val`])
                    });
                }
            }
            
            var index = data02.findIndex(s => s.ID === student.ID);
            if (index !== -1) {
                data02[index] = student;
            } else {
                data02.push(student);
            }
            
            loadTmplAndShow("./tmpl02.html", data02, "#div_02");
            resetForm();
            editingId = null;
        }
    });

    // Hiển thị chi tiết
    $("#bang tr:gt(0)").off("click").on("click", function() {
        var studentId = parseInt($(this).find("#ids").text());
        var student = data02.find(s => s.ID === studentId);
        if (student) {
            var detailsHtml = `<h3>${student.name}</h3><ul>`;
            student.mon.forEach(score => {
                detailsHtml += `<li>${score.tenmon}: ${score.diem}</li>`;
            });
            detailsHtml += `</ul>`;
            $("#details_content").html(detailsHtml);
        }
    });

    // Xóa sinh viên
    $(".delete-btn").off("click").on("click", function(e) {
        e.stopPropagation();
        var studentId = parseInt($(this).data("id"));
        data02 = data02.filter(s => s.ID !== studentId);
        loadTmplAndShow("./tmpl02.html", data02, "#div_02");
        $("#details_content").html("");
    });

    // Sửa sinh viên
    $(".edit-btn").off("click").on("click", function(e) {
        e.stopPropagation();
        var studentId = parseInt($(this).data("id"));
        var student = data02.find(s => s.ID === studentId);
        if (student) {
            editingId = studentId;
            $("#khoi input[data-name='name']").val(student.name);
            $("#khoi input[data-name='age']").val(student.age);
            $("#scores_input").html("");
            scoreCount = 0;
            
            student.mon.forEach((score, index) => {
                scoreCount++;
                $("#scores_input").append(createScoreRow(scoreCount, score.tenmon, score.diem));
            });
        }
    });

    // Chuyển đổi ngôn ngữ
    $("#language_selector").off("change").on("change", function() {
        const lang = $(this).val();
        switchLanguage(lang);
    });
}

// Reset form
function resetForm() {
    $("#khoi input").val("");
    $("#scores_input").html(createScoreRow(1));
    scoreCount = 1;
}

// Khởi tạo ứng dụng
$(document).ready(function() {
    initI18n('vi').then(() => {
        updatePageTranslations();
        loadInitialData();
    });
});