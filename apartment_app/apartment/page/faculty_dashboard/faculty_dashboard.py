import frappe
from frappe import _
from frappe.utils import now_datetime

@frappe.whitelist()
def check_faculty():
    faculty = frappe.db.exists(
        "Faculty",
        {"email": frappe.session.user}
    )
    return faculty

@frappe.whitelist()
def get_faculty_details():

    faculty = frappe.get_doc(
        "Faculty",
        {"email": frappe.session.user}
    )

    return faculty


@frappe.whitelist()
def get_problems():

    faculty = frappe.get_doc(
        "Faculty",
        {"email": frappe.session.user}
    )

    assigned = []

    for row in faculty.task:
        assigned.append(row.problem_id)

    data = []

    residents = frappe.get_all("Resident", pluck="name")

    for resident_name in residents:

        resident = frappe.get_doc("Resident", resident_name)

        for row in resident.problems:

            if (
                row.status == "pending"
                and row.problem_id not in assigned
            ):

                data.append({
                    "problem_id": row.problem_id,
                    "resisdents": resident.name,
                    "technicians": "-",
                    "status": row.status
                })

    return data


@frappe.whitelist()
def get_assigned_tasks():

    data = []

    technicians = frappe.get_all("Technician", pluck="name")

    for technician_name in technicians:

        technician = frappe.get_doc("Technician", technician_name)

        for row in technician.tasks:

            if row.status.lower() != "completed":

                data.append({
                    "problem_id": row.problem_id,
                    "resisdents": row.resident,
                    "technicians": technician.name,
                    "status": row.status,
                    "priority": row.priority,
                    "date": row.date
                })

    return data
 
@frappe.whitelist()
def get_problems_completed():

    data = []

    technicians = frappe.get_all("Technician", pluck="name")

    for technician_name in technicians:

        technician = frappe.get_doc("Technician", technician_name)

        for row in technician.tasks:

            if row.status.lower() == "completed":

                data.append({
                    "problem_id": row.problem_id,
                    "resisdents": row.resident,
                    "technicians": technician.name,
                    "status": row.status,
                    "priority":row.priority
                })

    return data


@frappe.whitelist()
def add_announcement(apartment_name,message, from_date, to_date):

    faculty = frappe.get_doc(
        "Faculty",
        {"email": frappe.session.user}
    )

    apartment = frappe.get_doc(
        "apartment_details",
        apartment_name
    )

    row = apartment.append("announcement", {})

    row.message = message
    row.from_date = from_date
    row.to_date = to_date

    apartment.save(ignore_permissions=True)

    return "Announcement Published Successfully"

@frappe.whitelist()
def get_apartments():

    return frappe.get_all(
        "apartment_details",
        fields=["name", "apartment_name"]
    )     

        
@frappe.whitelist()
def get_all_residents():

    return frappe.get_list(
        "Resident",
        fields=[
            "user_name",
            "moble_number",
            "apartment_name",
            "resident_number",
            "block",
            "resident_id"
        ]
    )


@frappe.whitelist()
def get_all_technician():

    return frappe.get_list(
        "Technician",
        fields=[
            "name",
            "name1",
            "technician_id",
            "category",
            "phone",
            "email"
        ]
    )

@frappe.whitelist()
def get_problem_ids():

    faculty = frappe.get_doc(
        "Faculty",
        {"email": frappe.session.user}
    )

    assigned = [row.problem_id for row in faculty.task]

    data = []

    residents = frappe.get_all("Resident", pluck="name")

    for resident_name in residents:

        resident = frappe.get_doc("Resident", resident_name)

        for row in resident.problems:

            if (
                row.status == "pending"
                and row.problem_id not in assigned
            ):

                data.append({
                    "problem_id": row.problem_id,
                    "resident": resident.name,
                    "category": row.category
                })

    return data

@frappe.whitelist()
def assign_technician(problem_id, resident, technician, priority):

      
    technician_doc = frappe.get_doc("Technician", technician)

    row = technician_doc.append("tasks", {})

    row.problem_id = problem_id
    row.resident = resident
    row.date = frappe.utils.now_datetime()
    row.status = "pending"
    row.priority = priority

    technician_doc.save(ignore_permissions=True)

     
    faculty = frappe.get_doc(
        "Faculty",
        {"email": frappe.session.user}
    )

    task = faculty.append("task", {})

    task.problem_id = problem_id
    task.resisdents = resident
    task.technicians = technician
    task.status = "Assign"

    faculty.save(ignore_permissions=True)

    return "Technician Assigned Successfully"

    