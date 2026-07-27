frappe.pages['resident_dashboard'].on_page_load = function(wrapper) {

    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "Resident Dashboard",
        single_column: true
    });

    frappe.call({
        method: "apartment_app.apartment.page.resident_dashboard.resident_dashboard.check_resident",

        callback: function(r){

            if(r.message){

                show_dashboard(page);

            }else{

                window.location.href="/resident/new";

            }

        }

    });

	function show_dashboard(page){

    $(page.body).html(`
        <div class="container mt-4">

                    <div id="resident_details"></div>

            <button id="add_problem" class="btn btn-primary">
                Add Problem
            </button>

            <button id="track_problem" class="btn btn-secondary">
                Track Problems
            </button>

            <div id="problem_list"></div>

        </div>
    `);

    $("#track_problem").click(function () {
        load_problems(page);
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
        options: "\nElectrical\nGas\nPlumbing\nCleaning service\nTech\nOther",
        reqd: 1
    },
      
],

        primary_action_label: "Submit",

        primary_action(values) {
                    frappe.call({
            method: "apartment_app.apartment.page.resident_dashboard.resident_dashboard.add_problem",
            args: {
                problem: values.problem,
                category:values.category,
                
            },
            callback: function (r) {
                if (r.message) {
                    frappe.msgprint(r.message);
                    d.hide();
                }
            }
        });
        }
    });

    d.show();
}
   function load_problems(page) {

    frappe.call({
        method: "apartment_app.apartment.page.resident_dashboard.resident_dashboard.get_problems",

        callback: function(r) {

            let problems = r.message;

            html = `
			<h3 class="mt-4">My Problems</h3>

			<table class="table table-bordered table-striped">
				<thead>
					<tr>
						<th>Problem ID</th>
						<th>Problem</th>
                        <th>Category</th>
						<th>Status</th>
						<th>Complaint Date</th>
						<th>Due Date</th>
						<th>Completed Date</th>
 					</tr>
				</thead>
				<tbody>
			`;

            problems.forEach(function(p){

				html += `
					<tr>
						<td>${p.problem_id}</td>
						<td>${p.problem}</td>
                        <td>${p.category}</td>
						<td>${p.status}</td>
						<td>${p.date_time || "-"}</td>
						<td>${p.due_time || "-"}</td>
						<td>${p.completed_date || "-"}</td>
 					</tr>
				`;

			});

            html += `
                    </tbody>
                </table>
            `;

            $("#problem_list").html(html);

        }
    });

}
   frappe.call({
    method: "apartment_app.apartment.page.resident_dashboard.resident_dashboard.get_resident_details",
    callback: function (r) {
        if (r.message) {
            show_resident_details(r.message);
        }
    }
});


function show_resident_details(resident) {

    let html = `
        <div class="card mb-4">
            <div class="card-header">
                <h4>Resident Information</h4>
            </div>

            <div class="card-body">
                <p><b>Name:</b> ${resident.user_name}</p>
                <p><b>Resident ID:</b> ${resident.resident_id}</p>
                <p><b>Apartment:</b> ${resident.apartment_name}</p>
                <p><b>Block:</b> ${resident.block}</p>
                <p><b>Resident No:</b> ${resident.resident_number}</p>
                <p><b>Mobile:</b> ${resident.moble_number }</p>
                <p><b>Email:</b> ${resident.email}</p>
             </div>
        </div>
    `;

    $("#resident_details").html(html);
}
}