const params = new URLSearchParams(window.location.search);
const technician_name = params.get("name");

frappe.pages['technician_dashboard'].on_page_load = function (wrapper) {
    let current_page = 1;
    const page_length = 10;

    let history_page = 1;
    const history_page_length = 10;

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Technician Dashboard',
        single_column: true
    });


    frappe.require("/apartment_app/apartment/page/technician_dashboard/technician_dashboard.css");
    frappe.require("/apartment_app/apartment/page/technician_dashboard/technician_dashboard.html");

    if (technician_name) {
        show_dashboard(page);
        loadProblems();
        loadHistory();
    } else {
        frappe.call({
            method: "apartment_app.apartment.page.technician_dashboard.technician_dashboard.check_Technician",
            callback: function (r) {
                if (r.message) {
                    show_dashboard(page);
                    loadProblems();
                    loadHistory();
                } else {
                    window.location.href = "/technician/new";
                }
            }
        });
    }

    function show_dashboard(page) {
        $(page.body).html(`
            <div class="technician-dashboard">
                <div class="dashboard-header">
                    <h1>Technician Dashboard</h1>
                </div>

                <div id="TECHNICIAN_DETAILS"></div>

                <div class="action-box" id="action_box">
                    ${technician_name ? "" : `
                        <button id="update_status" class="btn btn-primary">
                            <i class="fa fa-edit"></i> Update Status
                        </button>
                    `}
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h3>My Tasks</h3>
                    </div>
                    <div id="problem_list"></div>
                </div>

                <div class="section-card">
                    <div class="section-header">
                        <h3>Task History</h3>
                    </div>
                    <div id="history_list">
                        <div class="empty-state">No History Available</div>
                    </div>
                </div>
            </div>
        `);

        if (!technician_name) {
            $("#update_status").click(function () {
                open_update_dialog();
                 loadProblems();
                loadHistory();
            });
        }
    }

    frappe.call({
        method: "apartment_app.apartment.page.technician_dashboard.technician_dashboard.get_technician_details",
        args: {
            name: technician_name
        },
        callback: function (r) {
            if (r.message) {
                show_technician_details(r.message);
            }
        }
    });
    let tot = 0;
    frappe.call({
        method: "apartment_app.apartment.page.technician_dashboard.technician_dashboard.get_latecount",
        args: { name: technician_name },
        callback: function (r) {
            tot = r.message;
        }
    });

    function show_technician_details(technician) {
        console.log(technician);
        
        let html = `
            <div class="card mb-4">
                <div class="card-header">
                    <h4>Technician Information</h4>
                </div>
                <div class="card-body">
                    <p><b>Name:</b> ${technician.name1}</p>
                    <p><b>Technician ID:</b> ${technician.technician_id}</p>
                 <p><b>Category:</b> ${technician.category.map(c => c.skill).join(", ")}</p>
                    <p><b>Mobile:</b> ${technician.phone}</p>
                    <p><b>Email:</b> ${technician.email}</p>
                     <p><b>Late count:</b> ${tot}</p>
                </div>
            </div>
        `;
        $("#TECHNICIAN_DETAILS").html(html);
    }

    function show_history(history, total) {

        if (!history || history.length === 0) {
            $("#history_list").html(`<div class="empty-state">No History Available</div>`);
            return;
        }
        let total_pages = Math.ceil(total / history_page_length);

        let start_record =
            (history_page - 1) * history_page_length + 1;

        let end_record =
            Math.min(history_page * history_page_length, total);

        let html = `
            <table class="table">
                <thead>
                    <tr>
                        <th>Problem ID</th>
                        <th>Resident</th>
                        <th>LastUpdated Date</th>
                        <th>Status</th>
                        <th>Priority</th>
                    </tr>
                </thead>
                <tbody>
        `;
        history.forEach(function (p) {
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
                    <td>${p.resident}</td>
                    <td>${p.date || "-"}</td>
                    <td><span class="${status_classs}">${p.status}</span></td>
                    <td><span class="${status_class}">${p.priority}</span></td>
                </tr>
            `;
        });
        html += `
                </tbody>
            </table>
        `;
        html += `
<div class="d-flex justify-content-between align-items-center mt-3">

    <div>
        
    </div>

    <div>

        <button class="btn btn-secondary btn-sm" id="history_prev">
            Previous
        </button>

        <span class="mx-3">
            Page ${history_page} of ${total_pages}
        </span>

        <button class="btn btn-primary btn-sm" id="history_next">
            Next
        </button>

    </div>

</div>
`;
        $("#history_list").html(html);
        $("#history_prev").click(function () {

            if (history_page > 1) {

                history_page--;

                loadHistory();

            }

        });

        $("#history_next").click(function () {

            if (history_page < total_pages) {

                history_page++;

                loadHistory();

            }

        });

        $("#history_prev").prop(
            "disabled",
            history_page == 1
        );

        $("#history_next").prop(
            "disabled",
            history_page == total_pages
        );
    }

    function loadProblems() {

        frappe.call({
            method: "apartment_app.apartment.page.technician_dashboard.technician_dashboard.get_problems",

            args: {
                start: (current_page - 1) * page_length,
                page_length: page_length,
                name: technician_name
            },

            callback: function (r) {

                showProblems(
                    r.message.data,
                    r.message.total
                );

            }
        });

        function showProblems(problems, total) {

            let total_pages = Math.ceil(total / page_length);

            let start_record =
                (current_page - 1) * page_length + 1;

            let end_record =
                Math.min(current_page * page_length, total);

            let html = `
        <table class="table">
            <thead>
                <tr>
                    <th>Problem ID</th>
                    <th>Resident</th>
                    <th>Last Updated</th>
                    <th>Status</th>
                     <th>Due Date</th>
                    <th>Priority</th>
                      <th>Complaint image</th>
                </tr>
            </thead>
            <tbody>
    `;

            if (problems.length == 0) {

                html += `
            <tr>
                <td colspan="4" class="text-center">
                    No active tasks found
                </td>
            </tr>
        `;

            } else {

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
                    <td>${p.resident}</td>
                    <td>${p.date || "-"}</td>
                     <td><span class="${status_classs}">${p.status}</span></td>
                    <td class="${dueClass}">${p.due_date}</td>
                     <td><span class="${status_class}">${p.priority}</span></td>
                   <td>
                    <button class="btn btn-sm btn-primary view-image-btn"
                        data-image="${p.complaint_image}">
                        View Image
                    </button>
                </td>
                </tr>
            `;
            

                });

            }
            html += `
            </tbody>
        </table>

        <div class="d-flex justify-content-between align-items-center mt-3">

            <div>
                
            </div>

            <div>

                <button
                    class="btn btn-secondary btn-sm"
                    id="prev_page">
                    Previous
                </button>

                <span class="mx-3 fw-bold">
                    Page ${current_page} of ${total_pages}
                </span>

                <button
                    class="btn btn-primary btn-sm"
                    id="next_page">
                    Next
                </button>

            </div>

        </div>
    `;

            $("#problem_list").html(html);
                 

                $(".view-image-btn").click(function () {
                    let image = $(this).data("image");

                    let d = new frappe.ui.Dialog({
                        title: "Complaint Image",
                        size: "large",
                        fields: [
                            {
                                fieldtype: "HTML",
                                options: `
                                    <div style="text-align:center;">
                                        <img src="${image}"
                                            style="width:300px;height:300px;">
                                    </div>
                                `
                            }
                        ]
                    });

                    d.show();
                });

            $("#prev_page").click(function () {

                if (current_page > 1) {

                    current_page--;

                    loadProblems();

                }

            });

            $("#next_page").click(function () {

                if (current_page < total_pages) {

                    current_page++;

                    loadProblems();

                }

            });

            $("#prev_page").prop(
                "disabled",
                current_page == 1
            );

            $("#next_page").prop(
                "disabled",
                current_page == total_pages
            );

        }

    }
   

    function loadHistory() {

        frappe.call({
            method: "apartment_app.apartment.page.technician_dashboard.technician_dashboard.get_completed_tasks",

            args: {
                start: (history_page - 1) * history_page_length,
                page_length: history_page_length,
                name: technician_name
            },

            callback: function (r) {

                show_history(
                    r.message.data,
                    r.message.total
                );

            }
        });

    }

    function open_update_dialog() {
        let dialog = new frappe.ui.Dialog({
            title: "Update Task",
            fields: [
                {
                    label: "Problem ID",
                    fieldname: "problem_id",
                    fieldtype: "Select",
                    options: "",
                    reqd: 1,
                    onchange() {
                        let problem = dialog.get_value("problem_id");
                        let row = task_data.find(d => d.problem_id === problem);
                        if (row) {
                            dialog.set_value("resident", row.resident);
                        }
                    }
                },
                {
                    label: "Resident",
                    fieldname: "resident",
                    fieldtype: "Data",
                    read_only: 1
                },
                {
                    label: "Date",
                    fieldname: "date",
                    fieldtype: "Datetime",
                    default: frappe.datetime.now_datetime(),
                    read_only: 1
                },
                {
                    label: "Status",
                    fieldname: "status",
                    fieldtype: "Select",
                    options: "\npending\ninprogress\ncompleted",
                    reqd: 1
                },
                {
                    label: "Completion Image",
                    fieldname: "completion_image",
                    fieldtype: "Attach",
                    reqd:1
                }
            ],
            primary_action_label: "Submit",
            primary_action(values) {
                frappe.call({
                    method: "apartment_app.apartment.page.technician_dashboard.technician_dashboard.update_task",
                    args: {
                        problem_id: values.problem_id,
                        resident: values.resident,
                        status: values.status,
                        completion_image:values.completion_image,
                    },
                    callback: function (r) {
                        frappe.msgprint(r.message);
                        dialog.hide();
                     }
                });
            }
        });

        dialog.show();

        let task_data = [];
        frappe.call({
            method: "apartment_app.apartment.page.technician_dashboard.technician_dashboard.get_problem_ids",
            args: {
                name: technician_name
            },
            callback: function (r) {
                task_data = r.message || [];
                let options = [];
                task_data.forEach(function (row) {
                    options.push(row.problem_id);
                });
                dialog.set_df_property("problem_id", "options", options.join("\n"));
                
            }
        });
        
    }
};
