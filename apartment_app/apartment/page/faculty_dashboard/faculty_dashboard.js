frappe.pages['faculty_dashboard'].on_page_load = function (wrapper) {
    const page_length = 10;
    let resident_page = 1;
    let technician_page = 1;
    let pending_page = 1;
    let assigned_page = 1;
    let completed_page = 1;

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Faculty Dashboard',
        single_column: true
    });

    frappe.call({
        method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.check_faculty",
        callback: function (r) {
            if (r.message) {
                show_dashboard(page);
                load_all_modules();
            } else {
                window.location.href = "/faculty/new";
            }
        }
    });

    function show_dashboard(page) {
        $(page.body).html(`
            <div class="faculty-dashboard">
                <h1>FACULTY DETAILS</h1>
                <div id="faculty_details"></div>
                <hr>
                <button id="assign_technician" class="btn btn-primary mb-3">
                    Assign Technicians
                </button>
                <button id="add_announcement" class="btn btn-success mb-3">
                    Add Announcement
                </button>
                <div id="problem_list">Loading Pending Tasks...</div>
                <hr>
                <div id="assigned_problem_list">Loading Assigned Tasks...</div>
                <hr>
                <div id="completed_problem_list">Loading Completed Tasks...</div>
                <h3 class="mt-4">Technicians</h3>
                <div id="technician_list">Loading...</div>
                <h3 class="mt-4">Residents</h3>
                <div id="residents_list">Loading...</div>
            </div>
        `);

        $("#assign_technician").click(function () {
            open_assign_dialog();
        });
        $("#add_announcement").click(function () {
            open_announcement_dialog();
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
                show_residents(r.message.data, r.message.total);
            }
        });
    }

    function show_residents(residents, total) {
        let total_pages = Math.ceil(total / page_length) || 1;
        let html = `
            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>user_name</th>
                        <th>moble_number</th>
                        <th>apartment_name</th>
                        <th>Resident_number</th>
                        <th>block</th>
                        <th>resident_id</th>
                    </tr>
                </thead>
                <tbody>
        `;
        residents.forEach(function (t) {
            html += `
                <tr>
                    <td>${t.user_name}</td>
                    <td>${t.moble_number}</td>
                    <td>${t.apartment_name}</td>
                    <td>${t.resident_number}</td>
                    <td>${t.block}</td>
                    <td>${t.resident_id}</td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <button class="btn btn-secondary" id="prev_resident_page">Previous</button>
                <span>Page ${resident_page} of ${total_pages}</span>
                <button class="btn btn-primary" id="next_resident_page">Next</button>
            </div>
        `;
        $("#residents_list").html(html);

        $("#prev_resident_page").prop("disabled", resident_page === 1).click(function () {
            if (resident_page > 1) {
                resident_page--;
                loadResidents();
            }
        });

        $("#next_resident_page").prop("disabled", resident_page >= total_pages).click(function () {
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
                show_technicians(r.message.data, r.message.total);
            }
        });
    }

    function show_technicians(technicians, total) {
        let total_pages = Math.ceil(total / page_length) || 1;
        let html = `
            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Technician ID</th>
                        <th>Category</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;
        technicians.forEach(function (t) {
            html += `
                <tr>
                    <td>${t.name1}</td>
                    <td>${t.technician_id}</td>
                    <td>${t.category}</td>
                    <td>${t.phone}</td>
                    <td>${t.email}</td>
                    <td>
                        <button class="btn btn-primary btn-sm view-tech" data-name="${t.name}">
                            View Dashboard
                        </button>
                    </td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <button class="btn btn-secondary" id="prev_tech_page">Previous</button>
                <span>Page ${technician_page} of ${total_pages}</span>
                <button class="btn btn-primary" id="next_tech_page">Next</button>
            </div>
        `;
        $("#technician_list").html(html);

        $(".view-tech").click(function () {
            let technician = $(this).data("name");
            window.open("/app/technician_dashboard?name=" + technician, "_blank");
        });

        $("#prev_tech_page").prop("disabled", technician_page === 1).click(function () {
            if (technician_page > 1) {
                technician_page--;
                loadTechnicians();
            }
        });

        $("#next_tech_page").prop("disabled", technician_page >= total_pages).click(function () {
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
                show_pending_tasks(r.message.data, r.message.total);
            }
        });
    }

    function show_pending_tasks(problems, total) {
        let total_pages = Math.ceil(total / page_length) || 1;
        let html = `
            <h3 class="mt-4">Pending Tasks</h3>
            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>Problem ID</th>
                        <th>Resident</th>
                        <th>Technician</th>
                        <th>Status</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
        `;
        problems.forEach(function (p) {
            let status_class = "";
            if (p.status === "pending") {
                status_class = "status-pending";
            }

            html += `
                <tr>
                    <td>${p.problem_id}</td>
                    <td>${p.resisdents}</td>
                    <td>Not-Assign</td>
                     <td><span class="${status_class}">${p.status}</span></td>
                    <td>Not-Assign</td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <button class="btn btn-secondary" id="prev_pending_page">Previous</button>
                <span>Page ${pending_page} of ${total_pages}</span>
                <button class="btn btn-primary" id="next_pending_page">Next</button>
            </div>
        `;
        $("#problem_list").html(html);

        $("#prev_pending_page").prop("disabled", pending_page === 1).click(function () {
            if (pending_page > 1) {
                pending_page--;
                loadPendingTasks();
            }
        });

        $("#next_pending_page").prop("disabled", pending_page >= total_pages).click(function () {
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
                show_assigned_tasks(r.message.data, r.message.total);
            }
        });
    }

    function show_assigned_tasks(problems, total) {
        let total_pages = Math.ceil(total / page_length) || 1;
        
        
        
        let html = `
        <h3 class="mt-4">Assigned and In Progress Tasks</h3>
        <table class="table table-bordered table-striped">
        <thead>
        <tr>
        <th>Problem ID</th>
        <th>Resident</th>
        <th>Technician</th>
        <th>Status</th>
        <th>Priority</th>
        <th>Due Date</th>
        <th>Last Updated Date</th>
        </tr>
        </thead>
        <tbody>
                        `;
        problems.forEach(function (p) {
            let status_class = "";
    
            if (p.priority === "High") {
                status_class = "status-pending";
            } else if (p.priority === "Medium") {
                status_class = "status-progress";
            } else if (p.priority === "Low") {
                status_class = "status-completed";
            }
             let status_classs = "";
              if (p.status === "pending") {
                status_classs = "p-pending";
            } else if (p.status === "inprogress") {
                status_classs = "p-progress";
            } else if (p.status === "completed") {
                status_classs = "p-completed";
            }
            const dueDate = new Date(p.due_date);
            const now = new Date();
            const dueClass = dueDate < now ? "overdue" : "ontime";

            html += `
            <tr>
            <td>${p.problem_id}</td>
            <td>${p.resisdents}</td>
            <td>${p.technicians}</td>
            <td><span class="${status_classs}">${p.status}</span></td>
            <td><span class="${status_class}">${p.priority}</span></td>
            <td class="${dueClass}">${p.due_date}</td>
            <td>${p.date || "-"}</td>
            </tr>
            `;
        });
        html += `
                </tbody>
            </table>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <button class="btn btn-secondary" id="prev_assigned_page">Previous</button>
                <span>Page ${assigned_page} of ${total_pages}</span>
                <button class="btn btn-primary" id="next_assigned_page">Next</button>
            </div>
        `;
        $("#assigned_problem_list").html(html);

        $("#prev_assigned_page").prop("disabled", assigned_page === 1).click(function () {
            if (assigned_page > 1) {
                assigned_page--;
                loadAssignedTasks();
            }
        });

        $("#next_assigned_page").prop("disabled", assigned_page >= total_pages).click(function () {
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
                show_completed_tasks(r.message.data, r.message.total);
            }
        });
    }

    function show_completed_tasks(problems, total) {
        let total_pages = Math.ceil(total / page_length) || 1;
        let html = `
            <h3 class="mt-4">Completed Tasks</h3>
            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th>Problem ID</th>
                        <th>Resident</th>
                        <th>Technician</th>
                        <th>Status</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
        `;
        problems.forEach(function (p) {
             let status_class = "";
    
            if (p.priority === "High") {
                status_class = "status-pending";
            } else if (p.priority === "Medium") {
                status_class = "status-progress";
            } else if (p.priority === "Low") {
                status_class = "status-completed";
            }
                let status_classs = "";
              if (p.status === "pending") {
                status_classs = "p-pending";
            } else if (p.status === "inprogress") {
                status_classs = "p-progress";
            } else if (p.status === "completed") {
                status_classs = "p-completed";
            }
            html += `
                <tr>
                    <td>${p.problem_id}</td>
                    <td>${p.resisdents}</td>
                    <td>${p.technicians}</td>
                    <td><span class="${status_classs}">${p.status}</span></td>
                    <td><span class="${status_class}">${p.priority}</span></td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
            <div class="mt-3 d-flex justify-content-between align-items-center">
                <button class="btn btn-secondary" id="prev_completed_page">Previous</button>
                <span>Page ${completed_page} of ${total_pages}</span>
                <button class="btn btn-primary" id="next_completed_page">Next</button>
            </div>
        `;
        $("#completed_problem_list").html(html);

        $("#prev_completed_page").prop("disabled", completed_page === 1).click(function () {
            if (completed_page > 1) {
                completed_page--;
                loadCompletedTasks();
            }
        });

        $("#next_completed_page").prop("disabled", completed_page >= total_pages).click(function () {
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
                    <h4>Faculty Information</h4>
                </div>
                <div class="card-body">
                    <p><b>Name:</b> ${faculty.name1}</p>
                    <p><b>FACULTY ID:</b> ${faculty.faculty_id}</p>
                    <p><b>Email:</b> ${faculty.email}</p>
                </div>
            </div>
        `;
        $("#faculty_details").html(html);
    }

    function open_assign_dialog() {
        let problem_data = [];
        let technician_data = [];
        let dialog = new frappe.ui.Dialog({
            title: "Assign Technician",
            fields: [
                {
                    label: "Problem ID",
                    fieldname: "problem_id",
                    fieldtype: "Select",
                    options: "",
                    reqd: 1,
                    onchange() {
                        let problem = dialog.get_value("problem_id");
                        let row = problem_data.find(d => d.problem_id == problem);
                        if (row) {
                            dialog.set_value("resident", row.resident);
                            dialog.set_value("category", row.category);

                            let technicians = technician_data
                                .filter(t => t.category == row.category)
                                .map(t => t.name);

                            if (technicians.length > 0) {
                                dialog.set_df_property("technician", "options", technicians);
                            } else {
                                dialog.set_df_property("technician", "options", ["No Technician Available"]);
                                dialog.set_value("technician", "No Technician Available");
                                frappe.msgprint("No Technician Available for " + row.category + " category.");
                            }
                        }
                    }
                },
                { label: "Resident", fieldname: "resident", fieldtype: "Data", read_only: 1 },
                { label: "Category", fieldname: "category", fieldtype: "Data", read_only: 1 },
                { label: "Technician", fieldname: "technician", fieldtype: "Select", options: "", reqd: 1 },
                { label: "Due Date", fieldname: "due_date", fieldtype: "Date",reqd: 1 },
                { label: "Status", fieldname: "status", fieldtype: "Select", options: "\nAssign\nNotAssign", reqd: 1 },
                { label: "Priority", fieldname: "priority", fieldtype: "Select", options: "\nHigh\nMedium\nLow", reqd: 1 }
            ],
            primary_action_label: "Assign",
            primary_action(values) {
                if (values.technician === "No Technician Available") {
                    frappe.msgprint("Please add a technician for this category.");
                    return;
                }

                frappe.call({
                    method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.assign_technician",
                    args: {
                        problem_id: values.problem_id,
                        resident: values.resident,
                        technician: values.technician,
                        priority: values.priority,
                        due_date:values.due_date
                    },
                    callback: function (r) {
                        frappe.msgprint(r.message);
                        dialog.hide();
                        location.reload();
                    }
                });
            }
        });
        dialog.show();

        frappe.call({
            method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_problem_ids",
            callback: function (r) {
                problem_data = r.message;
                let problems = problem_data.map(d => d.problem_id);
                dialog.set_df_property("problem_id", "options", problems);
            }
        });

        frappe.call({
            method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_all_technician",
            args: { start: 0, page_length: 1000 },
            callback: function (r) {
                technician_data = r.message.data || r.message;
                let technicians = technician_data.map(t => t.name);
                dialog.set_df_property("technician", "options", technicians);
            }
        });
    }

    function open_announcement_dialog() {
        let dialog = new frappe.ui.Dialog({
            title: "Add Announcement",
            fields: [
                { label: "Apartment Name", fieldname: "apartment_name", fieldtype: "Select", options: "", reqd: 1 },
                { label: "Message", fieldname: "message", fieldtype: "Small Text", reqd: 1 },
                { label: "From Date", fieldname: "from_date", fieldtype: "Datetime", default: frappe.datetime.now_datetime(), reqd: 1 },
                { label: "To Date", fieldname: "to_date", fieldtype: "Datetime", reqd: 1 }
            ],
            primary_action_label: "Publish",
            primary_action(values) {
                frappe.call({
                    method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.add_announcement",
                    args: values,
                    callback: function (r) {
                        frappe.msgprint(r.message);
                        dialog.hide();
                        location.reload();
                    }
                });
            }
        });
        dialog.show();

        frappe.call({
            method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_apartments",
            callback: function (r) {
                let apartment_data = r.message;
                let apartments = apartment_data.map(a => a.name);
                dialog.set_df_property("apartment_name", "options", apartments);
            }
        });
    }
};