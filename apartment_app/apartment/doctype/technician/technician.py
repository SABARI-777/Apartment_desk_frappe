# Copyright (c) 2026, sabari and contributors

import frappe
from frappe.model.document import Document


class Technician(Document):

    def before_insert(self):
        if "@gmail.com" not in self.email:
            frappe.msgprint("in Valid email plaese enter email with @gmail.com") 

    def after_insert(self):
        frappe.sendmail(
            recipients=[self.email],
            subject="Welcome to Our Apartment Desk",
            message=f"""
                <h3>Welcome, {self.name}!</h3>

                <p>Your Technicians account has been created successfully.</p>

                <p>We wish you all the best in your Life.</p>

                <br>
                <h3>ONCE AGAIN WELCOME OUR TECHNICAIN !!!!! S</h3>
                <p>Regards,<br>
                APARTMENT Administration</p>
            """,
            now=True
        )
        frappe.msgprint("email send successfully")

    def on_update(self):

        for task in self.tasks:

            if not task.resident:
                continue

            res_doc = frappe.get_doc("Resident", task.resident)

            updated = False
            for problem in res_doc.problems:
                if problem.problem_id == task.problem_id:
                    problem.status = task.status
                    problem.completed_date = task.date
                    problem.time_taken = 10
                    updated = True
                    break

            if updated:
                res_doc.save(ignore_permissions=True)
                frappe.msgprint("Complaint Status IN resident")
    
    def on_submit(self):
        frappe.msgprint("Document submited successfully!!")


@frappe.whitelist(allow_guest=True)
def get_Technician_count():
    return frappe.db.count("Technician")
    
@frappe.whitelist(allow_guest=True)
def totalservice():
    meta = frappe.get_meta("Technician")

    field = meta.get_field("category")

    categories = field.options.strip().split("\n")

    return {
        "total_count": len(categories),
        "categories": categories
    }

@frappe.whitelist(allow_guest=True)
def get_category_count():
    return frappe.db.sql("""
        SELECT category, COUNT(name) AS count
        FROM `tabTechnician`
        GROUP BY category
    """, as_dict=True)