import frappe
from frappe import _
from frappe.utils import now_datetime
from frappe.utils import getdate, today

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
def get_problems(start=0, page_length=10,name=None):

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
                "status": row.status,
                "due_date":row.due_date,
                "priority":row.priority
            })
    
    start = int(start)
    page_length = int(page_length)

    total = len(data)

    return {
        "data": data[start:start + page_length],
        "total": total
    }

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
                "status": row.status,
               
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
            row.date = now_datetime()
            if row.date:
                if getdate(row.date) > getdate(row.due_date):
                    row.late_count += 1
            elif row.due_date and getdate(today()) > getdate(row.due_date):
                row.late_count += 1

            break

    technician.save(ignore_permissions=True)

  
    resident_doc = frappe.get_doc("Resident", resident)           

    for row in resident_doc.problems:

        if row.problem_id == problem_id:

            row.status = status
            row.completed_date = now_datetime()
            row.total_time =  (row.completed_date - row.date_time).total_seconds() / 3600

            break

    resident_doc.save(ignore_permissions=True)

    return "Task Updated Successfully"


@frappe.whitelist()
def get_completed_tasks(start=0, page_length=10,name=None):

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
                "status": row.status,
                "priority":row.priority
            })

    start = int(start)
    page_length = int(page_length)

    total = len(completed)

    return {
        "data": completed[start:start + page_length],
        "total": total
    }

@frappe.whitelist()
def get_latecount(name=None):
    count =0;
    if name:
        technician = frappe.get_doc("Technician", name)
    else:
        technician = frappe.get_doc(
        "Technician",
        {"email": frappe.session.user}
    )

    for row in technician.tasks:
        if row.late_count>0:
            count+=1
    
    return count

