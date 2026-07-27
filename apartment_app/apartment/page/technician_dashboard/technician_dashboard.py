import frappe
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist()
def check_Technician():
    technician = frappe.db.exists(
        "Technician",
        {"email": frappe.session.user}
    )
    return technician
    
@frappe.whitelist()
def get_technician_details(name=None):

    if name:
        return frappe.get_doc("Technician", name)

    return frappe.get_doc(
        "Technician",
        {"email": frappe.session.user}
    )
@frappe.whitelist()
def get_problems(name=None):

    if name:
        technician = frappe.get_doc("Technician", name)
    else:
        technician = frappe.get_doc(
            "Technician",
            {"email": frappe.session.user}
        )

    data = []

    for row in technician.tasks:

        if row.status.lower() != "completed":

            data.append({
                "problem_id": row.problem_id,
                "resident": row.resident,
                "date": row.date,
                "status": row.status
            })

    return data

@frappe.whitelist()
def get_problem_ids(name=None):

    if name:
        technician = frappe.get_doc("Technician", name)
    else:
        technician = frappe.get_doc(
            "Technician",
            {"email": frappe.session.user}
        )

    data = []

    for row in technician.tasks:

        if row.status.lower() != "completed":

            data.append({
                "problem_id": row.problem_id,
                "resident": row.resident,
                "date": row.date,
                "status": row.status
            })

    return data

@frappe.whitelist()
def update_task(problem_id, resident, status):

   
    technician = frappe.get_doc(
        "Technician",
        {"email": frappe.session.user}
    )

    for row in technician.tasks:

        if row.problem_id == problem_id and row.resident == resident:

            row.status = status

            if status == "completed":
                row.date = now_datetime()

            break

    technician.save(ignore_permissions=True)

  
    resident_doc = frappe.get_doc("Resident", resident)

    for row in resident_doc.problems:

        if row.problem_id == problem_id:

            row.status = status

            if status == "completed":
                row.completed_date = now_datetime()

            break

    resident_doc.save(ignore_permissions=True)

    return "Task Updated Successfully"


@frappe.whitelist()
def get_completed_tasks(name=None):

    if name:
        technician = frappe.get_doc("Technician", name)
    else:
        technician = frappe.get_doc(
            "Technician",
            {"email": frappe.session.user}
        )

    completed = []

    for row in technician.tasks:

        if row.status.lower() == "completed":

            completed.append({
                "problem_id": row.problem_id,
                "resident": row.resident,
                "date": row.date,
                "status": row.status
            })

    return completed