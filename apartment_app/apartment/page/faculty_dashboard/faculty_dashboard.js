frappe.pages['faculty_dashboard'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: 'Faculty Dashboard',
		single_column: true
	});

	frappe.call({
        method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.check_faculty",

        callback: function(r){

            if(r.message){

                show_dashboard(page);

            }else{
                window.location.href="/faculty/new";
            }
        }
    });

	function show_dashboard(page){
    $(page.body).html(`
        <div class="container mt-4">

            <h1>FACULTY DETAILS</h1>

            <div id="faculty_details"></div>
            <hr>
			 <button id="assign_technician" class="btn btn-primary mb-3">
                Assign Technicians 
            </button>
			<button id="add_announcement" class="btn btn-success mb-3">
			Add Announcement
		</button>

            <div id="problem_list"></div>

			<hr>
			<div id="assigned_problem_list"></div>



            <hr>
 			 <div id="completed_problem_list"></div>

			<h3 class="mt-4">Technicians</h3>
			<div id="technician_list">
				Loading...
			</div>

			<h3 class="mt-4">Residents</h3>
			<div id="residents_list">
				Loading...
			</div>
 

        </div>
    `);

				$("#assign_technician").click(function () {
					open_assign_dialog();
				});
				$("#add_announcement").click(function () {
					open_announcement_dialog();
				});
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

                    if(row){
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
                label: "Technician",
                fieldname: "technician",
                fieldtype: "Select",
                options: "",
                reqd: 1
            },

            {
                label: "Status",
                fieldname: "status",
                fieldtype: "Select",
                options: "\Assign\nNotAssign",
                reqd: 1
            },
			{
                label: "Priority",
                fieldname: "priority",
                fieldtype: "Select",
                options: "\nHigh\nMedium\nLow",
                reqd: 1
            }

        ],

        primary_action_label: "Assign",

        primary_action(values) {

    frappe.call({
        method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.assign_technician",

        args: {
            problem_id: values.problem_id,
            resident: values.resident,
            technician: values.technician,
			priority:values.priority
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

			frappe.call({
			method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_problem_ids",

			callback: function(r){

				problem_data = r.message;

				let problems = problem_data.map(d => d.problem_id);

				dialog.set_df_property("problem_id", "options", problems);

			}
		});

		frappe.call({
    method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_all_technician",

    callback: function(r){

        technician_data = r.message;

        let technicians = technician_data.map(t => t.name);

        dialog.set_df_property(
            "technician",
            "options",
            technicians
        );

    }
});




}     

	frappe.call({
				method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_faculty_details",
				callback: function (r) {
					if (r.message) {
						show_faculty_details(r.message);
					}
				}
			});

	

		



		frappe.call({
			method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_all_residents",

			callback: function(r){

				show_residents(r.message);

			}
		});

		 

			function show_residents(residents){

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

				residents.forEach(function(t){

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
				`;

				$("#residents_list").html(html);
			}







		frappe.call({
			method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_all_technician",

			callback: function(r){

				show_technicians(r.message);

			}
		});
				function show_technicians(technicians){

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
						</thead>

						<tbody>
				`;

				technicians.forEach(function(t){

				html += `
					<tr>
						<td>${t.name1}</td>
						<td>${t.technician_id}</td>
						<td>${t.category}</td>
						<td>${t.phone}</td>
						<td>${t.email}</td>

						<td>
							<button
								class="btn btn-primary btn-sm view-tech"
								data-name="${t.name}">
								View Dashboard
							</button>
						</td>
					</tr>
				`;
			});

				html += `
						</tbody>
					</table>
				`;

				$("#technician_list").html(html);

				$(".view-tech").click(function () {

				let technician = $(this).data("name");

				window.open(
					"/app/technician_dashboard?name=" + technician,
					"_blank"
				);

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

					frappe.call({
					method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_problems",

					callback: function(r) {

						let problems = r.message;
						console.log(problems)

						html = `
						<h3 class="mt-4">Pending Tasks</h3>

						<table class="table table-bordered table-striped">
							<thead>
								<tr>
									<th>Problem ID</th>
									<th>resident</th>
									<th>Technician </th>
									<th>Status</th>
									<th>Priority</th>
								</tr>
							</thead>
							<tbody>
						`;

						problems.forEach(function(p){

							html += `
								<tr>
									<td>${p.problem_id}</td>
									<td>${p.resisdents}</td> 
									<td>${p.technicians}</td> 
									<td>${p.status}</td>
									<td>${p.priority}</td>
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
					method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_problems_completed",

					callback: function(r) {

						let problems = r.message;
						console.log(problems)

						html = `
						<h3 class="mt-4">Compled Tasks</h3>

						<table class="table table-bordered table-striped">
							<thead>
								<tr>
									<th>Problem ID</th>
									<th>resident</th>
									<th>Technician </th>
									<th>Status</th>
									<th>Priority</th>
								</tr>
							</thead>
							<tbody>
						`;

						problems.forEach(function(p){

							html += `
								<tr>
									<td>${p.problem_id}</td>
									<td>${p.resisdents}</td> 
									<td>${p.technicians}</td> 
									<td>${p.status}</td>
									<td>${p.priority}</td>
								</tr>`;
						});

						html += `
								</tbody>
							</table>
						`;

						$("#completed_problem_list").html(html);

					}
				});

frappe.call({
    method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_assigned_tasks",

    callback: function(r) {

        let problems = r.message;

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
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        problems.forEach(function(p){

            html += `
                <tr>
                    <td>${p.problem_id}</td>
                    <td>${p.resisdents}</td>
                    <td>${p.technicians}</td>
                    <td>${p.status}</td>
                    <td>${p.priority}</td>
                    <td>${p.date || "-"}</td>
                </tr>
            `;

        });

        html += `
                </tbody>
            </table>
        `;

        $("#assigned_problem_list").html(html);

    }
});

function open_announcement_dialog() {

    let dialog = new frappe.ui.Dialog({

        title: "Add Announcement",

        fields: [
						{
				label: "Apartment Name",
				fieldname: "apartment_name",
				fieldtype: "Select",
				options: "",
				reqd: 1
			},

            {
                label: "Message",
                fieldname: "message",
                fieldtype: "Small Text",
                reqd: 1
            },

            {
                label: "From Date",
                fieldname: "from_date",
                fieldtype: "Datetime",
                default: frappe.datetime.now_datetime(),
                reqd: 1
            },

            {
                label: "To Date",
                fieldname: "to_date",
                fieldtype: "Datetime",
                reqd: 1
            }

        ],

        primary_action_label: "Publish",

        primary_action(values){

            frappe.call({

                method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.add_announcement",

                args: values,

                callback: function(r){

                    frappe.msgprint(r.message);

                    dialog.hide();

                    location.reload();

                }

            });

        }

    });

    dialog.show();

	let apartment_data = [];

frappe.call({
    method: "apartment_app.apartment.page.faculty_dashboard.faculty_dashboard.get_apartments",

    callback: function(r){

        apartment_data = r.message;

        let apartments = apartment_data.map(a => a.name);

        dialog.set_df_property(
            "apartment_name",
            "options",
            apartments
        );

    }
});

}
	
}