import frappe
from frappe.model.document import Document

class Resident(Document):
    pass


@frappe.whitelist()
def get_residents_count():
    return frappe.db.count("Resident")