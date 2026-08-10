frappe.pages['faculty_dashboard'].on_page_load = function (wrapper) {
    const page_length = 10;
    let resident_page = 1;
    let technician_page = 1;
    let pending_page = 1;
    let assigned_page = 1;
    let completed_page = 1;

     function safe_sanitize(val) {
        if (val === null || val === undefined || val === "") return "-";
        return frappe.utils.xss_sanitise(String(val));
    }

    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: __('Faculty Dashboard'),
        single_column: true
    });

    frappe.call({
        method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.check_faculty",
        callback: function (r) {
            if (r.message) {
                show_dashboard(page);
                load_all_modules();
            } else {
                frappe.set_route("faculty", "new");
            }
        }
    });

    function show_dashboard(page) {
        $(page.body).html(`
            <div class="faculty-dashboard">
                <h1>${__('FACULTY DETAILS')}</h1>
                <div id="faculty_details"></div>
                <hr>
                <div class="action-box mb-3">
                    <button id="assign_technician" class="btn btn-primary">
                        <i class="fa fa-user-plus"></i> ${__('Assign Technicians')}
                    </button>
                    <button id="add_announcement" class="btn btn-success">
                        <i class="fa fa-bullhorn"></i> ${__('Add Announcement')}
                    </button>
                </div>
                <div id="problem_list">${__('Loading Pending Tasks...')}</div>
                <hr>
                <div id="assigned_problem_list">${__('Loading Assigned Tasks...')}</div>
                <hr>
                <div id="completed_problem_list">${__('Loading Completed Tasks...')}</div>
                <h3 class="mt-4">${__('Technicians')}</h3>
                <div id="technician_list">${__('Loading...')}</div>
                <h3 class="mt-4">${__('Residents')}</h3>
                <div id="residents_list">${__('Loading...')}</div>
            </div>
        `);

        $(page.body).off("click", "#assign_technician").on("click", "#assign_technician", function () {
            open_assign_dialog();
        });

        $(page.body).off("click", "#add_announcement").on("click", "#add_announcement", function () {
            open_announcement_dialog();
        });

        $(page.body).off("click", ".assign-btn").on("click", ".assign-btn", function () {
            let problem_id = $(this).data("problem");
            open_assign_dialog(problem_id);
        });
    }

    function load_all_modules() {
        load_faculty_details();
        loadResidents();
        loadTechnicians();
        loadPendingTasks();
        loadAssignedTasks();
        loadCompletedTasks();
    }

    function load_faculty_details() {
        frappe.call({
            method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_faculty_details",
            callback: function (r) {
                if (r.message) {
                    show_faculty_details(r.message);
                }
            }
        });
    }

    function loadResidents() {
        frappe.call({
            method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_all_residents",
            args: {
                start: (resident_page - 1) * page_length,
                page_length: page_length
            },
            callback: function (r) {
                let data = (r.message && r.message.data) ? r.message.data : [];
                let total = (r.message && r.message.total) ? r.message.total : 0;
                show_residents(data, total);
            }
        });
    }

    function show_residents(residents, total) {
        let total_pages = Math.ceil(total / page_length) || 1;
        let html = `
            <div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>${__('User Name')}</th>
                            <th>${__('Mobile Number')}</th>
                            <th>${__('Apartment')}</th>
                            <th>${__('Resident No.')}</th>
                            <th>${__('Block')}</th>
                            <th>${__('Resident ID')}</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (!residents || residents.length === 0) {
            html += `<tr><td colspan="6" class="text-center text-muted">${__('No residents found.')}</td></tr>`;
        } else {
            residents.forEach(function (t) {
                html += `
                    <tr>
                        <td>${safe_sanitize(t.user_name)}</td>
                        <td>${safe_sanitize(t.mobile_number || t.moble_number)}</td>
                        <td>${safe_sanitize(t.apartment_name)}</td>
                        <td>${safe_sanitize(t.resident_number)}</td>
                        <td>${safe_sanitize(t.block)}</td>
                        <td>${safe_sanitize(t.resident_id)}</td>
                    </tr>
                `;
            });
        }

        html += `
                    </tbody>
                </table>
            </div>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <button class="btn btn-secondary btn-sm" id="prev_resident_page">${__('Previous')}</button>
                <span>${__('Page')} ${resident_page} ${__('of')} ${total_pages}</span>
                <button class="btn btn-primary btn-sm" id="next_resident_page">${__('Next')}</button>
            </div>
        `;
        $("#residents_list").html(html);

        $("#prev_resident_page").prop("disabled", resident_page === 1).off("click").on("click", function () {
            if (resident_page > 1) {
                resident_page--;
                loadResidents();
            }
        });

        $("#next_resident_page").prop("disabled", resident_page >= total_pages).off("click").on("click", function () {
            if (resident_page < total_pages) {
                resident_page++;
                loadResidents();
            }
        });
    }

    function loadTechnicians() {
        frappe.call({
            method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_all_technician",
            args: {
                start: (technician_page - 1) * page_length,
                page_length: page_length
            },
            callback: function (r) {
                let data = (r.message && r.message.data) ? r.message.data : (r.message || []);
                let total = (r.message && r.message.total) ? r.message.total : (data.length || 0);
                show_technicians(data, total);
            }
        });
    }

    function show_technicians(technicians, total) {
        let total_pages = Math.ceil(total / page_length) || 1;
        let html = `
            <div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>${__('Name')}</th>
                            <th>${__('Technician ID')}</th>
                            <th>${__('Category')}</th>
                            <th>${__('Phone')}</th>
                            <th>${__('Email')}</th>
                            <th>${__('Action')}</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (!technicians || technicians.length === 0) {
            html += `<tr><td colspan="6" class="text-center text-muted">${__('No technicians found.')}</td></tr>`;
        } else {
            technicians.forEach(function (t) {
                html += `
                    <tr>
                        <td>${safe_sanitize(t.name1)}</td>
                        <td>${safe_sanitize(t.technician_id)}</td>
                        <td>${t.category.map(c => c.skill).join(", ")}</td>
                        <td>${safe_sanitize(t.phone)}</td>
                        <td>${safe_sanitize(t.email)}</td>
                        <td>
                            <button class="btn btn-primary btn-xs view-tech" data-name="${safe_sanitize(t.name)}">
                                ${__('View Dashboard')}
                            </button>
                        </td>
                    </tr>
                `;
            });
        }

        html += `
                    </tbody>
                </table>
            </div>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <button class="btn btn-secondary btn-sm" id="prev_tech_page">${__('Previous')}</button>
                <span>${__('Page')} ${technician_page} ${__('of')} ${total_pages}</span>
                <button class="btn btn-primary btn-sm" id="next_tech_page">${__('Next')}</button>
            </div>
        `;
        $("#technician_list").html(html);

        $(".view-tech").off("click").on("click", function () {
            let technician = $(this).data("name");
            window.open("/app/technician_dashboard?name=" + encodeURIComponent(technician), "_blank");
        });

        $("#prev_tech_page").prop("disabled", technician_page === 1).off("click").on("click", function () {
            if (technician_page > 1) {
                technician_page--;
                loadTechnicians();
            }
        });

        $("#next_tech_page").prop("disabled", technician_page >= total_pages).off("click").on("click", function () {
            if (technician_page < total_pages) {
                technician_page++;
                loadTechnicians();
            }
        });
    }

    function loadPendingTasks() {
        frappe.call({
            method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_problems",
            args: {
                start: (pending_page - 1) * page_length,
                page_length: page_length
            },
            callback: function (r) {
                let data = (r.message && r.message.data) ? r.message.data : [];
                let total = (r.message && r.message.total) ? r.message.total : 0;
                show_pending_tasks(data, total);
            }
        });
    }

    function show_pending_tasks(problems, total) {
        let total_pages = Math.ceil(total / page_length) || 1;
        let html = `
            <h3 class="mt-4">${__('Pending Tasks')}</h3>
            <div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>${__('Problem ID')}</th>
                            <th>${__('Resident')}</th>
                            <th>${__('Technician')}</th>
                            <th>${__('Status')}</th>
                            <th>${__('Priority')}</th>
                            <th>${__('Complaint Image')}</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (!problems || problems.length === 0) {
            html += `<tr><td colspan="6" class="text-center text-muted">${__('No pending tasks.')}</td></tr>`;
        } else {
            problems.forEach(function (p) {
                let status_class = (p.status === "pending") ? "p-pending" : "";
                let img_btn = p.complaint_image 
                    ? `<button class="btn btn-xs btn-primary view-image-btn" data-image="${safe_sanitize(p.complaint_image)}">${__('View Image')}</button>` 
                    : "-";

                html += `
                    <tr>
                        <td>
                            ${safe_sanitize(p.problem_id)}
                            <button class="btn btn-xs btn-outline-primary assign-btn ml-2" data-problem="${safe_sanitize(p.problem_id)}">
                                ${__('Assign')}
                            </button>
                        </td>
                        <td>${safe_sanitize(p.residents || p.resisdents)}</td>
                        <td>${__('Not Assigned')}</td>
                        <td><span class="${status_class}">${safe_sanitize(p.status)}</span></td>
                        <td>${__('Not Assigned')}</td>
                        <td>${img_btn}</td>
                    </tr>
                `;
            });
        }

        html += `
                    </tbody>
                </table>
            </div>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <button class="btn btn-secondary btn-sm" id="prev_pending_page">${__('Previous')}</button>
                <span>${__('Page')} ${pending_page} ${__('of')} ${total_pages}</span>
                <button class="btn btn-primary btn-sm" id="next_pending_page">${__('Next')}</button>
            </div>
        `;
        $("#problem_list").html(html);

        $(".view-image-btn").off("click").on("click", function () {
            let image = $(this).data("image");
            let d = new frappe.ui.Dialog({
                title: __("Complaint Image"),
                size: "large",
                fields: [
                    {
                        fieldtype: "HTML",
                        options: `<div class="text-center"><img src="${image}" style="max-width:100%; max-height:400px; object-fit:contain;"></div>`
                    }
                ]
            });
            d.show();
        });

        $("#prev_pending_page").prop("disabled", pending_page === 1).off("click").on("click", function () {
            if (pending_page > 1) {
                pending_page--;
                loadPendingTasks();
            }
        });

        $("#next_pending_page").prop("disabled", pending_page >= total_pages).off("click").on("click", function () {
            if (pending_page < total_pages) {
                pending_page++;
                loadPendingTasks();
            }
        });
    }

    function loadAssignedTasks() {
        frappe.call({
            method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_assigned_tasks",
            args: {
                start: (assigned_page - 1) * page_length,
                page_length: page_length
            },
            callback: function (r) {
                let data = (r.message && r.message.data) ? r.message.data : [];
                let total = (r.message && r.message.total) ? r.message.total : 0;
                show_assigned_tasks(data, total);
            }
        });
    }

    function show_assigned_tasks(problems, total) {
        let total_pages = Math.ceil(total / page_length) || 1;

        let html = `
            <h3 class="mt-4">${__('Assigned and In Progress Tasks')}</h3>
            <div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>${__('Problem ID')}</th>
                            <th>${__('Resident')}</th>
                            <th>${__('Technician')}</th>
                            <th>${__('Status')}</th>
                            <th>${__('Priority')}</th>
                            <th>${__('Due Date')}</th>
                            <th>${__('Last Updated Date')}</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (!problems || problems.length === 0) {
            html += `<tr><td colspan="7" class="text-center text-muted">${__('No assigned tasks.')}</td></tr>`;
        } else {
            problems.forEach(function (p) {
                let priority_class = "";
                if (p.priority === "High") priority_class = "status-pending";
                else if (p.priority === "Medium") priority_class = "status-progress";
                else if (p.priority === "Low") priority_class = "status-completed";

                let status_class = "";
                if (p.status === "pending") status_class = "p-pending";
                else if (p.status === "inprogress") status_class = "p-progress";
                else if (p.status === "completed") status_class = "p-completed";

                const dueDate = p.due_date ? new Date(p.due_date) : null;
                const now = new Date();
                const dueClass = (dueDate && dueDate < now) ? "text-danger fw-bold" : "text-success";

                html += `
                    <tr>
                        <td>${safe_sanitize(p.problem_id)}</td>
                        <td>${safe_sanitize(p.residents || p.resisdents)}</td>
                        <td>${safe_sanitize(p.technicians)}</td>
                        <td><span class="${status_class}">${safe_sanitize(p.status)}</span></td>
                        <td><span class="${priority_class}">${safe_sanitize(p.priority)}</span></td>
                        <td class="${dueClass}">${p.due_date ? frappe.datetime.str_to_user(p.due_date) : "-"}</td>
                        <td>${p.date ? frappe.datetime.str_to_user(p.date) : "-"}</td>
                    </tr>
                `;
            });
        }

        html += `
                    </tbody>
                </table>
            </div>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <button class="btn btn-secondary btn-sm" id="prev_assigned_page">${__('Previous')}</button>
                <span>${__('Page')} ${assigned_page} ${__('of')} ${total_pages}</span>
                <button class="btn btn-primary btn-sm" id="next_assigned_page">${__('Next')}</button>
            </div>
        `;
        $("#assigned_problem_list").html(html);

        $("#prev_assigned_page").prop("disabled", assigned_page === 1).off("click").on("click", function () {
            if (assigned_page > 1) {
                assigned_page--;
                loadAssignedTasks();
            }
        });

        $("#next_assigned_page").prop("disabled", assigned_page >= total_pages).off("click").on("click", function () {
            if (assigned_page < total_pages) {
                assigned_page++;
                loadAssignedTasks();
            }
        });
    }

    function loadCompletedTasks() {
        frappe.call({
            method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_problems_completed",
            args: {
                start: (completed_page - 1) * page_length,
                page_length: page_length
            },
            callback: function (r) {
                let data = (r.message && r.message.data) ? r.message.data : [];
                let total = (r.message && r.message.total) ? r.message.total : 0;
                show_completed_tasks(data, total);
            }
        });
    }

    function show_completed_tasks(problems, total) {
        let total_pages = Math.ceil(total / page_length) || 1;
        let html = `
            <h3 class="mt-4">${__('Completed Tasks')}</h3>
            <div class="table-responsive">
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>${__('Problem ID')}</th>
                            <th>${__('Resident')}</th>
                            <th>${__('Technician')}</th>
                            <th>${__('Status')}</th>
                            <th>${__('Priority')}</th>
                            <th>${__('Completed Image')}</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        if (!problems || problems.length === 0) {
            html += `<tr><td colspan="6" class="text-center text-muted">${__('No completed tasks.')}</td></tr>`;
        } else {
            problems.forEach(function (p) {
                let priority_class = "";
                if (p.priority === "High") priority_class = "status-pending";
                else if (p.priority === "Medium") priority_class = "status-progress";
                else if (p.priority === "Low") priority_class = "status-completed";

                let status_class = (p.status === "completed") ? "p-completed" : "";

                let img_btn = p.completion_image 
                    ? `<button class="btn btn-xs btn-primary view-image-btn" data-image="${safe_sanitize(p.completion_image)}">${__('View Image')}</button>` 
                    : "-";

                html += `
                    <tr>
                        <td>${safe_sanitize(p.problem_id)}</td>
                        <td>${safe_sanitize(p.residents || p.resisdents)}</td>
                        <td>${safe_sanitize(p.technicians)}</td>
                        <td><span class="${status_class}">${safe_sanitize(p.status)}</span></td>
                        <td><span class="${priority_class}">${safe_sanitize(p.priority)}</span></td>
                        <td>${img_btn}</td>
                    </tr>
                `;
            });
        }

        html += `
                    </tbody>
                </table>
            </div>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <button class="btn btn-secondary btn-sm" id="prev_completed_page">${__('Previous')}</button>
                <span>${__('Page')} ${completed_page} ${__('of')} ${total_pages}</span>
                <button class="btn btn-primary btn-sm" id="next_completed_page">${__('Next')}</button>
            </div>
        `;
        $("#completed_problem_list").html(html);

        $(".view-image-btn").off("click").on("click", function () {
            let image = $(this).data("image");
            let d = new frappe.ui.Dialog({
                title: __("Completion Image"),
                size: "large",
                fields: [
                    {
                        fieldtype: "HTML",
                        options: `<div class="text-center"><img src="${image}" style="max-width:100%; max-height:400px; object-fit:contain;"></div>`
                    }
                ]
            });
            d.show();
        });

        $("#prev_completed_page").prop("disabled", completed_page === 1).off("click").on("click", function () {
            if (completed_page > 1) {
                completed_page--;
                loadCompletedTasks();
            }
        });

        $("#next_completed_page").prop("disabled", completed_page >= total_pages).off("click").on("click", function () {
            if (completed_page < total_pages) {
                completed_page++;
                loadCompletedTasks();
            }
        });
    }

    function show_faculty_details(faculty) {
        let html = `
            <div class="card mb-4">
                <div class="card-header">
                    <h4>${__('Faculty Information')}</h4>
                </div>
                <div class="card-body">
                    <p><b>${__('Name')}:</b> ${safe_sanitize(faculty.name1)}</p>
                    <p><b>${__('FACULTY ID')}:</b> ${safe_sanitize(faculty.faculty_id)}</p>
                    <p><b>${__('Email')}:</b> ${safe_sanitize(faculty.email)}</p>
                </div>
            </div>
        `;
        $("#faculty_details").html(html);
            }

        function open_assign_dialog(selected_problem = null) {
            let problem_data = [];
            let technician_data = [];

             function update_technician_dropdown() {
                let problem = dialog.get_value("problem_id");
                if (!problem) return;

                let row = problem_data.find(d => d.problem_id == problem);
                if (row) {
                    dialog.set_value("resident", row.resident || "");
                    dialog.set_value("category", row.category || "");

                     let technicians = technician_data
                        .filter(t => {
                            if (!t.category) return false;
                            
                            if (typeof t.category === "string") {
                                return t.category.toLowerCase() === (row.category || "").toLowerCase();
                            }
                            if (Array.isArray(t.category)) {
                                return t.category.some(c => (c.skill || c.category || "").toLowerCase() === (row.category || "").toLowerCase());
                            }
                            return false;
                        })
                        .map(t => t.name || t.technician_name);

                    if (technicians.length > 0) {
                        dialog.set_df_property("technician", "options", technicians);
                        dialog.set_value("technician", technicians[0]);
                    } else {
                        dialog.set_df_property("technician", "options", [__("No Technician Available")]);
                        dialog.set_value("technician", __("No Technician Available"));
                        frappe.msgprint(__("No Technician Available for {0} category.", [row.category]));
                    }
                }
            }

            let dialog = new frappe.ui.Dialog({
                title: __("Assign Technician"),
                fields: [
                    {
                        label: __("Problem ID"),
                        fieldname: "problem_id",
                        fieldtype: "Select",
                        options: [],
                        reqd: 1,
                        onchange() {
                            update_technician_dropdown();
                        }
                    },
                    { label: __("Resident"), fieldname: "resident", fieldtype: "Data", read_only: 1 },
                    { label: __("Category"), fieldname: "category", fieldtype: "Data", read_only: 1 },
                    { label: __("Technician"), fieldname: "technician", fieldtype: "Select", options: [], reqd: 1 },
                    { label: __("Due Date"), fieldname: "due_date", fieldtype: "Date", reqd: 1 },
                    { label: __("Priority"), fieldname: "priority", fieldtype: "Select", options: ["High", "Medium", "Low"], reqd: 1 }
                ],
                primary_action_label: __("Assign"),
                primary_action(values) {
                    if (values.technician === __("No Technician Available")) {
                        frappe.msgprint(__("Please add a technician for this category."));
                        return;
                    }

                    dialog.get_primary_btn().prop("disabled", true);

                    frappe.call({
                        method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.assign_technician",
                        args: {
                            problem_id: values.problem_id,
                            resident: values.resident,
                            technician: values.technician,
                            priority: values.priority,
                            due_date: values.due_date
                        },
                        callback: function (r) {
                            dialog.get_primary_btn().prop("disabled", false);
                            if (r.message) {
                                frappe.show_alert({ message: r.message, indicator: "green" });
                                dialog.hide();
                                load_all_modules();
                            }
                        },
                        error: function() {
                            dialog.get_primary_btn().prop("disabled", false);
                        }
                    });
                }
            });

            dialog.show();

           
            let p1 = frappe.call({
                method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_problem_ids"
            });

            let p2 = frappe.call({
                method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_all_technician",
                args: { start: 0, page_length: 1000 }
            });

            Promise.all([p1, p2]).then(([res1, res2]) => {
                problem_data = res1.message || [];
                technician_data = (res2.message && res2.message.data) ? res2.message.data : (res2.message || []);

                let problems = problem_data.map(d => d.problem_id);
                dialog.set_df_property("problem_id", "options", problems);

               
                if (selected_problem) {
                    dialog.set_value("problem_id", selected_problem);
                    update_technician_dropdown(); 
                }
            });
        }

    function open_announcement_dialog() {
        let dialog = new frappe.ui.Dialog({
            title: __("Add Announcement"),
            fields: [
                { label: __("Apartment Name"), fieldname: "apartment_name", fieldtype: "Select", options: [], reqd: 1 },
                { label: __("Message"), fieldname: "message", fieldtype: "Small Text", reqd: 1 },
                { label: __("From Date"), fieldname: "from_date", fieldtype: "Datetime", default: frappe.datetime.now_datetime(), reqd: 1 },
                { label: __("To Date"), fieldname: "to_date", fieldtype: "Datetime", reqd: 1 }
            ],
            primary_action_label: __("Publish"),
            primary_action(values) {
                dialog.get_primary_btn().prop("disabled", true);
                frappe.call({
                    method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.add_announcement",
                    args: values,
                    callback: function (r) {
                        dialog.get_primary_btn().prop("disabled", false);
                        if (r.message) {
                            frappe.show_alert({ message: r.message, indicator: "green" });
                            dialog.hide();
                        }
                    },
                    error: function() {
                        dialog.get_primary_btn().prop("disabled", false);
                    }
                });
            }
        });
        dialog.show();

        frappe.call({
            method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_apartments",
            callback: function (r) {
                let apartment_data = r.message || [];
                let apartments = apartment_data.map(a => a.name);
                dialog.set_df_property("apartment_name", "options", apartments);
            }
        });
    }
};