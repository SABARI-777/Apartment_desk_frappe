# Copyright (c) 2026, sabari and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class problems(Document):
	def after_insert(self):
		frappe.msgprint("problem added successfully!!!")
