import frappe
from frappe.model.document import Document


class Faculty(Document):
    def before_insert(self):
        if "@gmail.com" not in self.email:
            frappe.msgprint("in Valid email plaese enter email with @gmail.com") 

    def after_insert(self):
        frappe.sendmail(
            recipients=[self.email],
            subject="Welcome to Our Apartment Desk",
            message=f"""
                <h3>Welcome, {self.name}!</h3>

                <p>Your Faculty account has been created successfully.</p>

                <p>We wish you all the best in your Life.</p>

                <br>
                <h3>ONCE AGAIN WELCOME OUR FACULTY !!!!! S</h3>
                <p>Regards,<br>
                APARTMENT Administration</p>
            """,
            now=True
        )
        frappe.msgprint("email send successfully")

    def on_submit(self):
        frappe.msgprint("Document submited successfully!!")



@frappe.whitelist(allow_guest=True)
def get_faculty_count():
    return frappe.db.count("Faculty")