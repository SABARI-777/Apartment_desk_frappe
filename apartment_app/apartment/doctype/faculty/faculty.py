import frappe
from frappe.model.document import Document


class Faculty(Document):

    def on_update(self):
        for row in self.task:

            if not row.technicians or not row.resisdents:
                continue

            if not frappe.db.exists("Technician", row.technicians):
                continue

            tech_doc = frappe.get_doc("Technician", row.technicians)
            
         

            found = False

            for task in tech_doc.tasks:
                if task.problem_id == row.problem_id:
                    found = True
                    break

            if not found and row.status == "NotAssign":
                tech_doc.append("tasks", {
                "problem_id": row.problem_id,
                "resident": row.resisdents
                })
            
            row.status = "Assign"
            tech_doc.save(ignore_permissions=True)
            frappe.msgprint("datas saved!!!!!")



@frappe.whitelist()
def get_faculty_count():
    return frappe.db.count("Faculty")