import frappe
from frappe.model.document import Document

class Resident(Document):
    pass


@frappe.whitelist(allow_guest=True)
def get_residents_count():
    return frappe.db.count("Resident")