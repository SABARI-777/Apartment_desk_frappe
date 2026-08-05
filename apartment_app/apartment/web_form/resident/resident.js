
    frappe.ready(function () {
        frappe.web_form.after_save = function () {
            window.location.href = "/desk/resident_dashboard";
        };
    });