document.addEventListener('DOMContentLoaded', fetchGoals);

document.getElementById('goalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch('/api/goals', { method: 'POST', body: formData });
    e.target.reset();
    fetchGoals();
});

async function fetchGoals() {
    const res = await fetch('/api/goals');
    const goals = await res.json();
    const grid = document.getElementById('goalGrid');
    
    grid.innerHTML = goals.map(goal => {
        const percent = Math.min((goal.current_progress / goal.target_amount) * 100, 100);
        return `
            <div class="goal-card">
                <img src="${goal.image_url || 'https://via.placeholder.com/300'}" alt="Goal">
                <span class="tag">${goal.category}</span>
                <h3>${goal.title}</h3>
                <div class="progress-container"><div class="progress-fill" style="width: ${percent}%"></div></div>
                <p>Saved: ${goal.current_progress} / ${goal.target_amount}</p>
                <p style="color: #38bdf8;">${goal.remaining > 0 ? goal.remaining + ' remaining' : 'Goal Met!'}</p>
                <button onclick="updateProgress(${goal.id})">Update Progress</button>
            </div>`;
    }).join('');
}

async function updateProgress(id) {
    const amount = prompt("Enter progress amount:");
    if (amount && !isNaN(amount)) {
        await fetch(`/api/goals/${id}/progress`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: parseFloat(amount) })
        });
        fetchGoals();
    }
}
