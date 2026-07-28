document.addEventListener("DOMContentLoaded", function () {

    frappe.call({
        method: "apartment_app.apartment.doctype.resident.resident.get_residents_count",
        callback: function (r) {
            document.getElementById("count1").textContent = r.message;
        }
    });

    frappe.call({
        method: "apartment_app.apartment.doctype.technician.technician.get_Technician_count",
        callback: function (r) {
            document.getElementById("count2").textContent = r.message;
        }
    });

    frappe.call({
        method: "apartment_app.apartment.doctype.faculty.faculty.get_faculty_count",
        callback: function (r) {
            document.getElementById("count3").textContent = r.message;
        }
    });

    frappe.call({
        method: "apartment_app.apartment.doctype.technician.technician.totalservice",
        callback: function (r) {

            document.getElementById("total_count").textContent = r.message.total_count;

            let html = "";

            r.message.categories.forEach(function (category) {

                html += `<li>${category}</li>`;

            });

            document.getElementById("category_list").innerHTML = html;

        }
    });

    frappe.call({
        method: "apartment_app.apartment.doctype.announcement.announcement.get_announcement_details",
        callback: function (r) {

            let html = "";

            Object.entries(r.message).forEach(([apartment, announcements]) => {

                html += `
                    <div class="announce-card">

                        <div class="announce-header">
                            ${apartment} APARTMENT
                        </div>

                        <div class="announce-body">

                            ${announcements.map(item => `
                                <div class="announce-item">
                                    <p>${item.message}</p>
                                    <small>${item.from_date} - ${item.to_date}</small>
                                </div>
                            `).join("")}

                        </div>

                    </div>
                `;

            });

            document.getElementById("announce2").innerHTML = html;

        }
    });

});