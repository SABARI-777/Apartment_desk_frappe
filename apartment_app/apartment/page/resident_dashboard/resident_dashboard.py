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
            "total_time": (
            round((row.completed_date - row.date_time).total_seconds() / 3600,2)
            if row.completed_date else None
            ),
            "completed_date": row.completed_date,
            "complaint_image":row.complaint_image,
            "completion_image":row.completion_image,
            "over_due":row.over_due
        })

    start = int(start)
    page_length = int(page_length)

    total = len(data)

    data.reverse(); 

    return {
        "data": data[start:start + page_length],
        "total": total
    }

    

@frappe.whitelist()
def add_problem(problem,category,complaint_image):

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
    row.complaint_image = complaint_image
    row.status = "pending"
    row.date_time = now_datetime()
    row.over_due = "NO"
   
    resident.save(ignore_permissions=True)


    # faculty_doc = frappe.get_doc("Faculty","FTY-0063")

    # faculty_doc.add_comment(
    # "Edit",
    # f"RESIDNET {resident_name} ADD problem{row.problem_id} go and assign technicians."
    # )

    faculty_doc.save(ignore_permissions=True)

    faculty_list = frappe.get_all("Faculty", limit=1, pluck="name")
    if faculty_list:
        faculty_doc = frappe.get_doc("Faculty", faculty_list[0])
        faculty_doc.add_comment(
            "Edit",
            f"RESIDENT {resident.user_name or resident_name} added problem {row.problem_id}. Please assign a technician."
        )
        faculty_doc.save(ignore_permissions=True)

    return _("Problem Added Successfully!")

    # return "Problem Added Successfully!"