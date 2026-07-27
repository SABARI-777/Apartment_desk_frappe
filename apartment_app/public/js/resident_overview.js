frappe.ready(function () {

    frappe.call({
        method: "apartment_app.apartment.doctype.resident.resident.get_residents_count",
        callback: function (r) {
            $("#count1").text(r.message);
        }
    });

    frappe.call({
        method: "apartment_app.apartment.doctype.technician.technician.get_Technician_count",
        callback: function (r) {
            $("#count2").text(r.message);
        }
    });

    frappe.call({
        method: "apartment_app.apartment.doctype.faculty.faculty.get_faculty_count",
        callback: function (r) {
            $("#count3").text(r.message);
        }
    });

    frappe.call({
        method: "apartment_app.apartment.doctype.technician.technician.totalservice",
        callback: function (r) {

            $("#total_count").text(r.message.total_count);

            let html = "";

            r.message.categories.forEach(function(category){

                html += `
                    <div class="category-item">
                        ${category}
                    </div>
                `;

            });

            $("#category_list").html(html);

        }
    });

    frappe.call({

        method:"apartment_app.apartment.doctype.announcement.announcement.get_announcement_details",

        callback:function(r){

            let html="";

            Object.entries(r.message).forEach(([apartment,announcements])=>{

                html += `
                    <div class="card mb-3">

                        <div class="card-header">

                            <strong>${apartment} APARTMENT</strong>

                        </div>

                        <div class="card-body">

                            <h5>Announcements</h5>

                            ${announcements.map(item=>`

                                <div class="mb-2">

                                    <p>${item.message}</p>

                                    <small class="text-muted">

                                        ${item.from_date}
                                        -
                                        ${item.to_date}

                                    </small>

                                </div>

                            `).join("")}

                        </div>

                    </div>
                `;

            });

            $("#announce2").html(html);

        }

    });

});