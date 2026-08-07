frappe.pages['resident_dashboard'].on_page_load = function (wrapper) {
    let current_page = 1;
    const page_length = 10;
    
    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "Resident Dashboard",
        single_column: true
    });

    frappe.require("/apartment_app/apartment/page/resident_dashboard/resident_dashboard.css");
    frappe.require("/apartment_app/apartment/page/resident_dashboard/resident_dashboard.html");

    frappe.call({
        method: "apartment_app.apartment.page.resident_dashboard.resident_dashboard.check_resident",
        callback: function (r) {
            if (r.message) {
                show_dashboard(page);
                load_resident_details();
            } else {
                window.location.href = "/resident/new";
            }
        }
    });

    function show_dashboard(page) {
        $(page.body).html(`
            <div class="resident-dashboard">
                <div id="resident_details"></div>
                <div class="action-box mb-3">
                    <button id="add_problem" class="btn btn-primary">
                        <i class="fa fa-plus"></i> Add Problem
                    </button>
                    <button id="track_problem" class="btn btn-success">
                        <i class="fa fa-list"></i> Track Problems
                    </button>
                </div>
                <div id="problem_list"></div>
            </div>
        `);

        $("#track_problem").click(function () {
            load_problems();
        });

        $("#add_problem").click(function () {
            open_add_problem_dialog();
        });
    }

    function open_add_problem_dialog() {
        let d = new frappe.ui.Dialog({
            title: "Add Problem",
            fields: [
                {
                    label: "Problem",
                    fieldname: "problem",
                    fieldtype: "Data",
                    reqd: 1
                },
                {
                    label: "Category",
                    fieldname: "category",
                    fieldtype: "Select",
                    options: "\nElectrical\nGas\nPlumbing\nCleaning Services\nTech\nOther",
                    reqd: 1
                },
                {
                    label: "Complaint Image",
                    fieldname: "complaint_image",
                    fieldtype: "Attach Image"
                }
            ],
            primary_action_label: "Submit",
            primary_action(values) {
                frappe.call({
                    method: "apartment_app.apartment.page.resident_dashboard.resident_dashboard.add_problem",
                    args: {
                        problem: values.problem,
                        category: values.category,
                        complaint_image: values.complaint_image || ""
                    },
                    callback: function (r) {
                        if (r.message) {
                            frappe.msgprint(r.message);
                            d.hide();
                            load_problems();
                        }
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
                    <h3 class="mt-4">My Problems</h3>
                    <table class="table table-bordered table-striped">
                        <thead>
                            <tr>
                                <th>Problem ID</th>
                                <th>Problem</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Complaint Date</th>
                                <th>Working Hours</th>
                                <th>Completed Date</th>
                                <th>Overdue</th>
                                <th>Complaint Image</th>
                                <th>Completion Image</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                if (problems.length === 0) {
                    html += `<tr><td colspan="10" class="text-center">No problems reported yet.</td></tr>`;
                } else {
                    problems.forEach(function (p) {
                        let status_classs = "";
                        if (p.status === "pending") {
                            status_classs = "p-pending";
                        } else if (p.status === "inprogress") {
                            status_classs = "p-progress";
                        } else if (p.status === "completed") {
                            status_classs = "p-completed";
                        }

                        let status_class = (p.over_due === "YES") ? "status-pending" : "status-completed";

                        let complaint_img_btn = p.complaint_image 
                            ? `<button class="btn btn-sm btn-info view-img-btn" data-img="${p.complaint_image}">View</button>` 
                            : "-";
                        
                        let completion_img_btn = p.completion_image 
                            ? `<button class="btn btn-sm btn-success view-img-btn" data-img="${p.completion_image}">View</button>` 
                            : "-";

                        html += `
                            <tr>
                                <td>${p.problem_id || "-"}</td>
                                <td>${p.problem || "-"}</td>
                                <td>${p.category || "-"}</td>
                                <td><span class="${status_classs}">${p.status || "-"}</span></td>
                                <td>${p.date_time || "-"}</td>
                                <td>${p.total_time ? p.total_time + ' hrs' : "-"}</td>
                                <td>${p.completed_date || "-"}</td>
                                <td><span class="${status_class}">${p.over_due || "NO"}</span></td>
                                <td>${complaint_img_btn}</td>
                                <td>${completion_img_btn}</td>
                            </tr>
                        `;
                    });
                }

                html += `
                        </tbody>
                    </table>
                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div></div>
                        <div>
                            <button class="btn btn-secondary btn-sm" id="prev_page">Previous</button>
                            <span class="mx-3 fw-bold">Page ${current_page} of ${total_pages}</span>
                            <button class="btn btn-primary btn-sm" id="next_page">Next</button>
                        </div>
                    </div>
                `;

                $("#problem_list").html(html);

                 $(".view-img-btn").click(function () {
                    let img_url = $(this).data("img");
                    let img_dialog = new frappe.ui.Dialog({
                        title: "Image Preview",
                        fields: [
                            {
                                fieldtype: "HTML",
                                options: `<div class="text-center"><img src="${img_url}" style="max-width: 100%; height: 300px; object-fit: contain;"></div>`
                            }
                        ]
                    });
                    img_dialog.show();
                });

                $("#prev_page").prop("disabled", current_page === 1).click(function () {
                    if (current_page > 1) {
                        current_page--;
                        load_problems();
                    }
                });

                $("#next_page").prop("disabled", current_page >= total_pages).click(function () {
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
                    <h4>Resident Information</h4>
                </div>
                <div class="card-body">
                    <p><b>Name:</b> ${resident.user_name || '-'}</p>
                    <p><b>Resident ID:</b> ${resident.resident_id || '-'}</p>
                    <p><b>Apartment:</b> ${resident.apartment_name || '-'}</p>
                    <p><b>Block:</b> ${resident.block || '-'}</p>
                    <p><b>Resident No:</b> ${resident.resident_number || '-'}</p>
                    <p><b>Mobile:</b> ${resident.moble_number || '-'}</p>
                    <p><b>Email:</b> ${resident.email || '-'}</p>
                </div>
            </div>
        `;
        $("#resident_details").html(html);
    }
};