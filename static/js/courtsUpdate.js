document.addEventListener("DOMContentLoaded", function () {
    fetchCourts(); // 初始化時載入球場狀態
});

// 獲取所有球場並顯示開關按鈕
function fetchCourts() {
    fetch("/get-allcourts")
        .then(response => response.json())
        .then(data => {
            const tableBody = document.getElementById("courtsTableBody");
            tableBody.innerHTML = ""; // 清空表格內容
            console.log(data)
            data.forEach(court => {

                const row = document.createElement("tr");

                // 球場名稱
                const nameCell = document.createElement("td");
                nameCell.textContent = court.name;
                row.appendChild(nameCell);

                // 開關按鈕
                const switchCell = document.createElement("td");
                switchCell.innerHTML = `
                    <label class="switch">
                        <input type="checkbox" ${court.availability === 1 ? "checked" : ""} 
                            onchange="toggleCourtStatus(${court.id}, this.checked)">
                        <span class="slider"></span>
                    </label>
                `;
                row.appendChild(switchCell);

                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error("無法載入球場資訊:", error));
}

// 切換球場開放狀態
function toggleCourtStatus(courtId, isChecked) {
    const availability = isChecked ? 1 : 0;

    fetch("/update-court-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ court_id: courtId, availability: availability })
    })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error("更新球場狀態失敗:", error));
}
