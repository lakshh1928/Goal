document.addEventListener("DOMContentLoaded", () => {
    fetchGoals();

    const form = document.getElementById("goalForm");
    const categorySelect = document.getElementById("categorySelect");
    const dynamicLabel = document.getElementById("dynamicLabel");
    const dynamicInput = document.getElementById("dynamicInput");

    // Change input type based on category
    categorySelect.addEventListener("change", (e) => {
        if (e.target.value === "Personal") {
            dynamicLabel.innerText = "Description";
            dynamicInput.type = "text";
            dynamicInput.placeholder = "Enter your personal goal...";
        } else {
            dynamicLabel.innerText = "Target Amount";
            dynamicInput.type = "number";
            dynamicInput.placeholder = "Enter amount";
        }
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        try {
            const res = await fetch("/api/goals", { method: "POST", body: formData });
            if (!res.ok) throw new Error("Failed to create");
            form.reset();
            fetchGoals();
        } catch (err) { alert(err.message); }
    });
});

async function fetchGoals() {
    try {
        const res = await fetch("/api/goals");
        const goals = await res.json();
        const grid = document.getElementById("goalGrid");

        grid.innerHTML = goals.map(goal => {
            const isFinancial = goal.category === "Financial";
            const percent = isFinancial ? Math.min((goal.current_progress / goal.target_amount) * 100, 100) : 0;

            return `
            <div class="goal-card">
                <div class="card-actions">
                    <button class="edit-btn" onclick="openEditModal(${JSON.stringify(goal).replace(/"/g, '&quot;')})">✎</button>
                    <button class="delete-btn" onclick="deleteGoal(${goal.id})">✖</button>
                </div>
                <img src="${goal.image_url || 'https://via.placeholder.com/300'}" alt="goal">
                <span class="tag">${goal.category}</span>
                <h3>${goal.title}</h3>
                
                ${isFinancial ? `
                    <div class="progress-container">
                        <div class="progress-fill" style="width:${percent}%"></div>
                    </div>
                    <p>Saved: ${goal.current_progress} / ${goal.target_amount}</p>
                    <button onclick="updateProgress(${goal.id})">Update Progress</button>
                ` : `<p class="desc-text">${goal.description || 'No description'}</p>`}
            </div>`;
        }).join("");
    } catch (err) { console.error(err); }
}

// EDIT LOGIC
function openEditModal(goal) {
    document.getElementById('editId').value = goal.id;
    document.getElementById('editTitle').value = goal.title;
    document.getElementById('editCategory').value = goal.category;
    document.getElementById('editModal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const payload = {
        title: document.getElementById('editTitle').value,
        category: document.getElementById('editCategory').value
    };

    const res = await fetch(`/api/goals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (res.ok) {
        closeEditModal();
        fetchGoals();
    }
});

async function deleteGoal(id) {
    if (confirm("Delete this goal?")) {
        await fetch(`/api/goals/${id}`, { method: "DELETE" });
        fetchGoals();
    }
}

async function updateProgress(id) {
    const amount = prompt("Enter amount to add:");
    if (!amount) return;
    await fetch(`/api/goals/${id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount) })
    });
    fetchGoals();
}
