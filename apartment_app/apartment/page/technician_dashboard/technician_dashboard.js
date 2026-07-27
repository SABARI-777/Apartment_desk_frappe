const params = new URLSearchParams(window.location.search);

const technician_name = params.get("name");

frappe.pages['technician_dashboard'].on_page_load = function(wrapper) {

    var page = frappe.ui.make_app_page({
        parent: wrapper,
        title: 'Technician Dashboard',
        single_column: true
    });

	if (technician_name) {
    show_dashboard(page);

} else {

    frappe.call({
        method: "apartment_app.apartment.page.technician_dashboard.technician_dashboard.check_Technician",

        callback: function(r){

            if(r.message){

                show_dashboard(page);

            }else{

                window.location.href="/technician/new";
            }
        }
    });

}

	function show_dashboard(page){
    $(page.body).html(`
        <div class="container mt-4">

            <h1>TECHNICIAN DETAILS</h1>

            <div id="TECHNICIAN_DETAILS"></div>

					${technician_name ? "" : `
			<button id="update_status" class="btn btn-primary">
				Update Status
			</button>
			`}

            <hr>

            <div id="problem_list"></div>

            <hr>

            <h3>Task History</h3>

            <div id="history_list">
                No History
            </div>

        </div>
    `);

    $("#update_status").click(function () {
        open_update_dialog();
    });
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



						
			function show_technician_details(technician) {

				let html = `
					<div class="card mb-4">
						<div class="card-header">
							<h4>Technician Information</h4>
						</div>

						<div class="card-body">
							<p><b>Name:</b> ${technician.name1}</p>
							<p><b>Technician ID:</b> ${technician.technician_id}</p>
 							<p><b>Category :</b> ${technician.category}</p>
							<p><b>Mobile:</b> ${technician.phone }</p>
							<p><b>Email:</b> ${technician.email}</p>
						</div>
					</div>
				`;

				$("#TECHNICIAN_DETAILS").html(html);
			}
			function show_history(history){

    let html = `
        <table class="table table-bordered table-striped">

            <thead>

                <tr>

                    <th>Problem ID</th>
                    <th>Resident</th>
                    <th>Completed Date</th>
                    <th>Status</th>

                </tr>

            </thead>

            <tbody>
    `;

    history.forEach(function(p){

        html += `
            <tr>

                <td>${p.problem_id}</td>
                <td>${p.resident}</td>
                <td>${p.date || "-"}</td>
                <td>${p.status}</td>

            </tr>
        `;

    });

    html += `
            </tbody>

        </table>
    `;

    $("#history_list").html(html);

}


				// function load_problems(page) {

				frappe.call({
					method: "apartment_app.apartment.page.technician_dashboard.technician_dashboard.get_problems",
args: {
        name: technician_name
    },
					callback: function(r) {

						let problems = r.message;
						console.log(problems)

						html = `
						<h3 class="mt-4">My Tasks</h3>

						<table class="table table-bordered table-striped">
							<thead>
								<tr>
									<th>Problem ID</th>
									<th>resident</th>
									<th>Completed Date</th>
									<th>Status</th>
								</tr>
							</thead>
							<tbody>
						`;

						problems.forEach(function(p){

							html += `
								<tr>
									<td>${p.problem_id}</td>
									<td>${p.resident}</td> 
									<td>${p.date || "-"}</td>
									<td>${p.status}</td>
								</tr>`;
						});

						html += `
								</tbody>
							</table>
						`;

						$("#problem_list").html(html);

					}
				});

				frappe.call({
    method: "apartment_app.apartment.page.technician_dashboard.technician_dashboard.get_completed_tasks",
args: {
        name: technician_name
    },
    callback: function(r){

        show_history(r.message);

    }
});
			// }

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
            }
        ],
        primary_action_label: "Submit",
        primary_action(values) {

    frappe.call({
        method: "apartment_app.apartment.page.technician_dashboard.technician_dashboard.update_task",
        args: {
            problem_id: values.problem_id,
            resident: values.resident,
            status: values.status
        },
        callback: function(r) {

            frappe.msgprint(r.message);

            dialog.hide();

             location.reload();

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

							task_data = r.message;

							let options = [];

							task_data.forEach(function(row){
								options.push(row.problem_id);
							});

							dialog.set_df_property(
								"problem_id",
								"options",
								options.join("\n")
							);

							dialog.refresh();
						}
					});
}

}