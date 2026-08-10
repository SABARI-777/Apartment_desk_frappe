frappe.pages['resident_dashboard'].on_page_load = function (wrapper) {
    let current_page = 1;
    const page_length = 10;
    
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __("Resident Dashboard"),
        single_column: true
    });

    frappe.call({
        method: "apartment_app.apartment.page.resident_dashboard.resident_dashboard.check_resident",
        callback: function (r) {
            if (r.message) {
                show_dashboard(page);
                load_resident_details();
            } else {
                frappe.set_route("resident", "new");
            }
        }
    });

    function show_dashboard(page) {
        $(page.body).html(`
            <div class="resident-dashboard">
                <div id="resident_details"></div>
                <div class="action-box mb-3">
                    <button id="add_problem" class="btn btn-primary">
                        <i class="fa fa-plus"></i> ${__('Add Problem')}
                    </button>
                    <button id="track_problem" class="btn btn-success">
                        <i class="fa fa-list"></i> ${__('Track Problems')}
                    </button>
                </div>
                <div id="problem_list"></div>
            </div>
        `);

        $(page.body).on("click", "#track_problem", function () {
            load_problems();
        });

        $(page.body).on("click", "#add_problem", function () {
            open_add_problem_dialog();
        });
    }

    function open_add_problem_dialog() {
        let d = new frappe.ui.Dialog({
            title: __("Add Problem"),
            fields: [
                {
                    label: __("Problem Description"),
                    fieldname: "problem",
                    fieldtype: "Small Text",
                    reqd: 1
                },
                {
                    label: __("Category"),
                    fieldname: "category",
                    fieldtype: "Select",
                    options: ["Electrical", "Gas", "Plumbing", "Cleaning Services", "Tech", "Other"],
                    reqd: 1
                },
                {
                    label: __("Complaint Image"),
                    fieldname: "complaint_image",
                    fieldtype: "Attach Image"
                }
            ],
            primary_action_label: __("Submit"),
            primary_action(values) {
                d.get_primary_btn().prop('disabled', true);  
                
                frappe.call({
                    method: "apartment_app.apartment.page.resident_dashboard.resident_dashboard.add_problem",
                    args: {
                        problem: values.problem,
                        category: values.category,
                        complaint_image: values.complaint_image || ""
                    },
                    callback: function (r) {
                        d.get_primary_btn().prop('disabled', false);
                        if (r.message) {
                            frappe.show_alert({ message: r.message, indicator: 'green' });
                            d.hide();
                            load_problems();
                        }
                    },
                    error: function() {
                        d.get_primary_btn().prop('disabled', false);
                    }
                });
            }
        });
        d.show();
    }

    function load_problems() {
        frappe.call({
            method: "apartment_app.apartment.page.resident_dashboard.resident_dashboard.get_problems",
            args: {
                start: (current_page - 1) * page_length,
                page_length: page_length
            },
            callback: function (r) {
                if (!r.message) return;

                let problems = r.message.data || [];
                let total = r.message.total || 0;
                let total_pages = Math.ceil(total / page_length) || 1;

                let html = `
                    <h3 class="mt-4">${__('My Problems')}</h3>
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                                <tr>
                                    <th>${__('ID')}</th>
                                    <th>${__('Problem')}</th>
                                    <th>${__('Category')}</th>
                                    <th>${__('Status')}</th>
                                    <th>${__('Date')}</th>
                                    <th>${__('Working Hours')}</th>
                                    <th>${__('Lastupdated Date')}</th>
                                    <th>${__('Overdue')}</th>
                                    <th>${__('Complaint Img')}</th>
                                    <th>${__('Completion Img')}</th>
                                </tr>
                            </thead>
                            <tbody>
                `;

                if (problems.length === 0) {
                    html += `<tr><td colspan="10" class="text-center text-muted">${__('No problems reported yet.')}</td></tr>`;
                } else {
                    problems.forEach(function (p) {
                        let status_class = "";
                        if (p.status === "pending") status_class = "p-pending";
                        else if (p.status === "inprogress") status_class = "p-progress";
                        else if (p.status === "completed") status_class = "p-completed";

                         let overdue_badge = (p.over_due === "YES") 
                            ? `<span class="overdue-yes">${__('YES')}</span>` 
                            : `<span class="overdue-no">${__('NO')}</span>`;

                        let complaint_img_btn = p.complaint_image 
                            ? `<button class="btn btn-xs btn-complaint-img view-img-btn" data-img="${frappe.utils.xss_sanitise(p.complaint_image)}">${__('View')}</button>` 
                            : "-";

                        let completion_img_btn = p.completion_image 
                            ? `<button class="btn btn-xs btn-completion-img view-img-btn" data-img="${frappe.utils.xss_sanitise(p.completion_image)}">${__('View')}</button>` 
                            : "-";

                        html += `
                            <tr>
                                <td>${frappe.utils.xss_sanitise(p.problem_id || "-")}</td>
                                <td>${frappe.utils.xss_sanitise(p.problem || "-")}</td>
                                <td>${frappe.utils.xss_sanitise(p.category || "-")}</td>
                                <td><span class="${status_class}">${frappe.utils.xss_sanitise(p.status || "-")}</span></td>
                                <td>${p.date_time ? frappe.datetime.str_to_user(p.date_time) : "-"}</td>
                                <td>${p.total_time ? p.total_time + ' hrs' : "-"}</td>
                                <td>${p.completed_date ? frappe.datetime.str_to_user(p.completed_date) : "-"}</td>
                                <td>${overdue_badge}</td>
                                <td>${complaint_img_btn}</td>
                                <td>${completion_img_btn}</td>
                            </tr>
                        `;
                    });
                }

                html += `
                            </tbody>
                        </table>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div></div>
                        <div>
                            <button class="btn btn-secondary btn-sm" id="prev_page">${__('Previous')}</button>
                            <span class="mx-3 fw-bold">${__('Page')} ${current_page} ${__('of')} ${total_pages}</span>
                            <button class="btn btn-primary btn-sm" id="next_page">${__('Next')}</button>
                        </div>
                    </div>
                `;

                $("#problem_list").html(html);

                $(".view-img-btn").off("click").on("click", function () {
                    let img_url = $(this).data("img");
                    let img_dialog = new frappe.ui.Dialog({
                        title: __("Image Preview"),
                        fields: [
                            {
                                fieldtype: "HTML",
                                options: `<div class="text-center"><img src="${img_url}" style="max-width: 100%; max-height: 400px; object-fit: contain;"></div>`
                            }
                        ]
                    });
                    img_dialog.show();
                });

                $("#prev_page").prop("disabled", current_page === 1).off("click").on("click", function () {
                    if (current_page > 1) {
                        current_page--;
                        load_problems();
                    }
                });

                $("#next_page").prop("disabled", current_page >= total_pages).off("click").on("click", function () {
                    if (current_page < total_pages) {
                        current_page++;
                        load_problems();
                    }
                });
            }
        });
    }

    function load_resident_details() {
        frappe.call({
            method: "apartment_app.apartment.page.resident_dashboard.resident_dashboard.get_resident_details",
            callback: function (r) {
                if (r.message) {
                    show_resident_details(r.message);
                }
            }
        });
    }

    function show_resident_details(resident) {
        let html = `
            <div class="card mb-4">
                <div class="card-header">
                    <h4>${__('Resident Information')}</h4>
                </div>
                <div class="card-body">
                    <p><b>${__('Name')}:</b> ${frappe.utils.xss_sanitise(resident.user_name || '-')}</p>
                    <p><b>${__('Resident ID')}:</b> ${frappe.utils.xss_sanitise(resident.resident_id || '-')}</p>
                    <p><b>${__('Apartment')}:</b> ${frappe.utils.xss_sanitise(resident.apartment_name || '-')}</p>
                    <p><b>${__('Block')}:</b> ${frappe.utils.xss_sanitise(resident.block || '-')}</p>
                    <p><b>${__('Resident No')}:</b> ${frappe.utils.xss_sanitise(resident.resident_number || '-')}</p>
                    <p><b>${__('Mobile')}:</b> ${frappe.utils.xss_sanitise(resident.mobile_number || resident.moble_number || '-')}</p>
                    <p><b>${__('Email')}:</b> ${frappe.utils.xss_sanitise(resident.email || '-')}</p>
                </div>
            </div>
        `;
        $("#resident_details").html(html);
    }
};