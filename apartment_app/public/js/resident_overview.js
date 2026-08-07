document.addEventListener("DOMContentLoaded", function () {
    
        frappe.call({
            method: "apartment_app.www.api.get_dashboard_data",
            callback: function (r) {
                if (!r.message) return;
                const data = r.message;

                document.getElementById("count1").textContent = data.resident_count;
                document.getElementById("count2").textContent = data.technician_count;
                document.getElementById("count3").textContent = data.faculty_count;
                document.getElementById("total_count").textContent = data.service_count.length;
                
                document.getElementById("category_list").innerHTML = data.service_count
                    .map(item => `<li>${item.service}</li>`)
                    .join("");

                let html = "";
                Object.entries(data.announcements).forEach(([apartment, announcements]) => {
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