let data02 = []; // Mảng lưu danh sách sinh viên
let scoreCount = 1; // Đếm số môn học trong form
let editingId = null; // Lưu ID sinh viên đang sửa

// Load dữ liệu từ students.json
$.getJSON('students.json', function(jsonData) {
    if (!Array.isArray(jsonData)) {
        console.error("students.json is not an array");
        loadTmplAndShow("./tmpl02.html", data02, "#div_02");
        return;
    }
    data02 = jsonData.map(item => ({
        ID: item.ID || Math.max(...data02.map(s => s.ID), 0) + 1, // Tạo ID nếu thiếu
        name: item.name || "Unknown", // Mặc định nếu thiếu name
        age: item.age || 20, // Mặc định tuổi là 20 nếu không có
        mon: Array.isArray(item.mon) ? item.mon : [] // Mảng rỗng nếu mon không hợp lệ
    }));
    loadTmplAndShow("./tmpl02.html", data02, "#div_02");
}).fail(function(jqXHR, textStatus, errorThrown) {
    console.error("Failed to load students.json:", textStatus, errorThrown);
    loadTmplAndShow("./tmpl02.html", data02, "#div_02"); // Hiển thị bảng rỗng nếu lỗi
});

// Helper Handlebars
Handlebars.registerHelper('select', function(value, options) {
    var $el = $('<select />').html(options.fn(this));
    $el.find('[value="' + value + '"]').attr({'selected': 'selected'});
    return $el.html();
});

// Load và hiển thị template
var loadTmplAndShow = function(tmplPath, data, divToShow) {
    $.get(tmplPath, function(html) {
        var tmpl = Handlebars.compile(html);
        $(divToShow).html(tmpl(data));
        bindEvents();
    }).fail(function() {
        console.error("Failed to load template:", tmplPath);
    });
};

// Gắn các sự kiện
function bindEvents() {
    $("#add_score").off("click").on("click", function() {
        scoreCount++;
        var scoreRow = `
            <div class="col-md-6">
                            <select class="form-select objData" data-name="note${scoreCount}_name">
                                <option value="">Select Subject</option>
                                <option value="Toan">Mathematics</option>
                                <option value="Van">Literature</option>
                                <option value="Tieng Anh">English</option>
                                <option value="Ly">Physics</option>
                                <option value="Hoa">Chemistry</option>
                                <option value="Sinh">Biology</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="number" class="form-control objData" 
                                        data-name="note${scoreCount}_val" placeholder="Score (0-10)" 
                                        step="0.1" min="0" max="10">
                                <span class="input-group-text">/10</span>
                            </div>
                        </div>`;
        $("#scores_input").append(scoreRow);
    });

    // Thêm hoặc cập nhật sinh viên
    $("#btn_show").off("click").on("click", function() {
        var data = req_gl_data({ dataZoneDom: $("#khoi") });
        if (!data.hasError) {
            var student = {
                ID: editingId || (Math.max(...data02.map(s => s.ID), 0) + 1), // Tạo ID mới
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

    // Hiển thị chi tiết điểm
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
                var scoreRow = `
                    <div class="mb-3">
                                <div id="scores_input">
                                    <div class="score_row mb-3">
                                        <div class="row">
                                            <div class="col-md-6">
                                                    <select id="input" data-name="note${scoreCount}_name" class="form-select objData">
                                                        <option value="Toan" ${score.tenmon === "Toan" ? "selected" : ""}>Toan</option>
                                                        <option value="Van" ${score.tenmon === "Van" ? "selected" : ""}>Van</option>
                                                        <option value="Tieng Anh" ${score.tenmon === "Tieng Anh" ? "selected" : ""}>Tieng Anh</option>
                                                        <option value="Ly" ${score.tenmon === "Ly" ? "selected" : ""}>Ly</option>
                                                        <option value="Hoa" ${score.tenmon === "Hoa" ? "selected" : ""}>Hoa</option>
                                                        <option value="Sinh" ${score.tenmon === "Sinh" ? "selected" : ""}>Sinh</option>
                                                    </select>
                                                    <div class="input-group">
                                                        <input id="input" data-name="note${scoreCount}_val" class="form-control objData" placeholder="Score" type="number" step="0.1" min="0" max="10" value="${score.diem}">
                                                        <span class="input-group-text">/10</span>
                                                    </div>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                $("#scores_input").append(scoreRow);
            });
        }
    });
}

// Reset form
function resetForm() {
    $("#khoi input").val("");
    $("#scores_input").html(`
        <div class="mb-3">
            <div id="scores_input">
                <div class="score_row mb-3">
                    <div class="row">
                        <div class="col-md-6">
                            <select class="form-select objData" data-name="note1_name">
                                <option value="">Select Subject</option>
                                <option value="Toan">Mathematics</option>
                                <option value="Van">Literature</option>
                                <option value="Tieng Anh">English</option>
                                <option value="Ly">Physics</option>
                                <option value="Hoa">Chemistry</option>
                                <option value="Sinh">Biology</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <div class="input-group">
                                <input type="number" class="form-control objData" 
                                        data-name="note1_val" placeholder="Score (0-10)" 
                                        step="0.1" min="0" max="10">
                                <span class="input-group-text">/10</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>`);
    scoreCount = 1;
}