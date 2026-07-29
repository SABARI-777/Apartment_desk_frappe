# Copyright (c) 2026, sabari and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class apartment_details(Document):
	def after_insert(self):
		frappe.msgprint("New Apartment Added!!")
	def on_update(self):
		frappe.msgprint("Document updated successfully!!")
	def after_submit(self):
		msgprint("Document submited successfully")


# @frappe.whitelist()
# def get_announcement_details():
#     apart = frappe.get_single("apartment_details")

#     messages = []

#     for d in apart.announcement:
#         messages.append(d.message)

#     return {
#         "name": apart.apartment_name,
#         "message": messages
#     }