frappe.pages['resident-overview'].on_page_load = function (wrapper) {

    let page = frappe.ui.make_app_page({
        parent: wrapper,
        title: "Resident Overview",
        single_column: true
    });

    $(page.body).html(`

<style>

.overview-container{
    padding:20px;
}

.summary-table{
    width:100%;
    border-collapse:collapse;
    margin-bottom:30px;
    background:#fff;
}

.summary-table th{
    background:#f5f5f5;
    padding:12px;
    text-align:left;
    border:1px solid #ddd;
}

.summary-table td{
    padding:12px;
    border:1px solid #ddd;
    font-size:16px;
}

.summary-table td:last-child{
    font-weight:bold;
    color:#0a58ca;
}

.category-card{
    background:#fff;
    border:1px solid #ddd;
    padding:15px;
    border-radius:6px;
}

.category-card h4{
    margin-bottom:15px;
}

.category-list{
    margin:0;
    padding-left:20px;
}

.category-list li{
    padding:6px 0;
}

</style>

<div class="overview-container">

    <h3>Resident Overview</h3>

    <table class="summary-table">
        <thead>
            <tr>
                <th>Details</th>
                <th>Count</th>
            </tr>
        </thead>

        <tbody>
            <tr>
                <td>Total Residents</td>
                <td id="count1">Loading...</td>
            </tr>

            <tr>
                <td>Total Technicians</td>
                <td id="count2">Loading...</td>
            </tr>

            <tr>
                <td>Total Faculties</td>
                <td id="count3">Loading...</td>
            </tr>
        </tbody>
    </table>

    <div class="category-card">
        <h4>Service Providing (<span id="total_count">0</span>)</h4>

        <ul id="category_list" class="category-list"></ul>
    </div>

	<div class="mt-3">
    <h3> Apartment Announcements</h3>
    <h4 id="announce2"></h4>
 </div>

</div>

`);
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

            r.message.categories.forEach(function (category) {
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
    method: "apartment_app.apartment.doctype.announcement.announcement.get_announcement_details",
    callback: function(r) {

        let html = "";

        Object.entries(r.message).forEach(([apartment, announcements]) => {

            html += `
                <div class="card mb-3">
                    <div class="card-header">
                        <strong>${apartment} APARTMENT</strong>
                    </div>
                    <div class="card-body">
					<h5>announcements</h5>
                        ${announcements.map(item => `
                            <div class="mb-2">
                                <p>${item.message}</p>
                                <small class="text-muted">${item.from_date} - ${item.to_date} </small>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;

        });

        $("#announce2").html(html);
    }
});
};