import frappe
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist()
def check_resident():

    resident = frappe.db.exists(
        "Resident",
        {"email": frappe.session.user}
    )

    return resident



@frappe.whitelist()
def get_resident_details():
    return frappe.get_doc(
        "Resident",
        {"email": frappe.session.user}
    )
    
@frappe.whitelist()
def get_problems(start=0, page_length=10):
    resident = frappe.get_doc(
    "Resident",
    {"email": frappe.session.user}
    )

    data = []

    for row in resident.problems:

        data.append({
            "problem_id": row.problem_id,
            "problem": row.problem,
            "category": row.category,
            "status": row.status,
            "date_time": row.date_time,
            "due_time": row.due_time,
            "completed_date": row.completed_date
        })

    start = int(start)
    page_length = int(page_length)

    total = len(data)

    return {
        "data": data[start:start + page_length],
        "total": total
    }

    

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