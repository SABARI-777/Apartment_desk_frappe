frappe.ready(function() {
	// bind events here


	frappe.web_form.after_save = function () {
            window.location.href = "/technician_dashboard";
        };
})