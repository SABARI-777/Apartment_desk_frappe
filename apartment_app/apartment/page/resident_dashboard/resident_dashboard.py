import frappe
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist()
def check_resident():
    frappe.errprint(f"Logged in user: {frappe.session.user}")

    resident = frappe.db.exists(
        "Resident",
        {"email": frappe.session.user}
    )

    frappe.errprint(f"Resident found: {resident}")

    return resident
@frappe.whitelist()
def get_resident_details(name=None):

    if name:
        return frappe.db.get_value(
            "Resident",
            name,
            [
                "user_name",
                "moble_number",
                "apartment_name",
                "resident_number",
                "block",
                "resident_id"
            ],
            as_dict=True
        )

    return frappe.get_doc(
        "Resident",
        {"email": frappe.session.user}
    )
    
@frappe.whitelist()
def get_problems():

    resident = frappe.get_doc(
        "Resident",
        {"email": frappe.session.user}
    )
    return resident.problems

@frappe.whitelist()
def add_problem(problem,category):

    resident_name = frappe.db.get_value(
        "Resident",
        {"email": frappe.session.user}
    )

    if not resident_name:
        frappe.throw("Resident not found.")

    resident = frappe.get_doc("Resident", resident_name)

    row = resident.append("problems", {})

    count = len(resident.problems) + 1
    row.problem_id = resident.email +" "+f"P{count:03d}"
    
    row.problem = problem
    row.category = category
 
    row.status = "pending"
    row.date_time = now_datetime()

    resident.save(ignore_permissions=True)

    return "Problem Added Successfully!"