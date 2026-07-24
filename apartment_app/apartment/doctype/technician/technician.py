# Copyright (c) 2026, sabari and contributors

import frappe
from frappe.model.document import Document


class Technician(Document):

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

        frappe.msgprint("Complaint Status Updated")


@frappe.whitelist()
def get_Technician_count():
    return frappe.db.count("Technician")
    
@frappe.whitelist()
def totalservice():
    meta = frappe.get_meta("Technician")

    field = meta.get_field("category")

    categories = field.options.strip().split("\n")

    return {
        "total_count": len(categories),
        "categories": categories
    }

@frappe.whitelist()
def get_category_count():
    return frappe.db.sql("""
        SELECT category, COUNT(name) AS count
        FROM `tabTechnician`
        GROUP BY category
    """, as_dict=True)