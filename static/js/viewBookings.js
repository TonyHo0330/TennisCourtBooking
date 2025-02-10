document.addEventListener("DOMContentLoaded", function () {
    let dateInput = document.getElementById("date");
    let bookingsTable = document.getElementById("bookingsTable");

    // 設定日期只能從當日起
    let today = new Date();
    let offset = today.getTimezoneOffset() * 60000; // 調整時區偏移量
    let localISODate = new Date(today.getTime() - offset).toISOString().split("T")[0];
    dateInput.min = localISODate;

    // 載入所有未來的預約
    fetchBookings();

    // 監聽日期變化
    dateInput.addEventListener("change", function () {
        fetchBookings(this.value);
    });

    function fetchBookings(selectedDate = "") {
        dateInput.value = '';
        fetch("/get-user-bookings")
            .then(response => response.json())
            .then(data => {
                console.log(data)
                bookingsTable.innerHTML = ""; // 清空表格
                let filteredData = selectedDate
                    ? data.filter(b => b.reservation_date === selectedDate)
                    : data;
                if (filteredData.length === 0) {
                    bookingsTable.innerHTML = `<tr><td colspan='3'>${selectedDate} 無預約紀錄</td></tr>`
                    return;
                }
                filteredData.forEach(booking => {
                    let row = document.createElement("tr");

                    let dateCell = document.createElement("td");
                    dateCell.textContent = booking.reservation_date;
                    row.appendChild(dateCell);

                    let contentCell = document.createElement("td");
                    let contentBtn = document.createElement("button");
                    contentBtn.textContent = "內容";
                    contentBtn.classList.add("btn-info");
                    contentCell.appendChild(contentBtn);
                    row.appendChild(contentCell);
                    contentBtn.addEventListener("click", function () {
                        alert(
                            `📅 預約日期：${booking.reservation_date}\n` +
                            `⏰ 時段：${booking.reservation_time.split("、").join("\n")}\n` +
                            `📍 場地：${booking.court_id}號場地`
                        );
                    });

                    let actionCell = document.createElement("td");
                    let cancelButton = document.createElement("button");
                    cancelButton.textContent = "取消";
                    cancelButton.classList.add("cancel-btn");

                    if (booking.reservation_date === today) {
                        cancelButton.disabled = true;
                    }

                    cancelButton.addEventListener("click", function () {
                        if (confirm("確定要取消預約嗎？")) {
                            cancelBooking(booking.id);
                        }
                    });

                    actionCell.appendChild(cancelButton);
                    row.appendChild(actionCell);

                    bookingsTable.appendChild(row);
                });
            })
            .catch(error => console.error("無法載入預約資料:", error));
    }

    function cancelBooking(bookingId) {
        fetch("/cancel-booking", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ booking_id: bookingId })
        })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                fetchBookings(); // 重新載入資料
            })
            .catch(error => console.error("取消預約失敗:", error));
    }
});
