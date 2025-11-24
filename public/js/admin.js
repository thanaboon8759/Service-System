// API_URL, getToken, and handleError are defined in app.js

// Store tickets globally for filtering
let allTickets = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAllTickets();

    // Search and Filter Listeners
    document.getElementById('search-input').addEventListener('input', filterTickets);
    document.getElementById('filter-status').addEventListener('change', filterTickets);
    document.getElementById('sort-tickets').addEventListener('change', filterTickets);

    const updateForm = document.getElementById('update-form');
    if (updateForm) {
        updateForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentTicketId) return;

            const status = document.getElementById('update-status').value;
            const technician = document.getElementById('update-tech').value;
            const estimatedCost = document.getElementById('update-cost').value;

            try {
                const res = await fetch(`${API_URL}/tickets/${currentTicketId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({ status, technician, estimatedCost })
                });

                if (!res.ok) throw new Error('Failed to update ticket');

                showToast('Ticket updated successfully', 'success');
                loadAllTickets(); // Refresh list
                closeModal();
            } catch (err) {
                handleError(err);
            }
        });
    }
});

async function loadAllTickets() {
    try {
        const res = await fetch(`${API_URL}/tickets/all/list`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });

        if (res.status === 401) {
            window.location.href = '/index.html';
            return;
        }

        allTickets = await res.json();

        // Update Stats
        document.getElementById('stat-total').textContent = allTickets.length;
        document.getElementById('stat-active').textContent = allTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
        document.getElementById('stat-resolved').textContent = allTickets.filter(t => t.status === 'Completed' || t.status === 'Closed').length;

        renderTickets(allTickets);
    } catch (err) {
        handleError(err);
    }
}

function filterTickets() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterStatus = document.getElementById('filter-status').value;
    const sortBy = document.getElementById('sort-tickets').value;

    let filtered = allTickets.filter(ticket => {
        const matchesSearch = (ticket.description && ticket.description.toLowerCase().includes(searchTerm)) ||
            (ticket.user && ticket.user.name.toLowerCase().includes(searchTerm)) ||
            (ticket.deviceType && ticket.deviceType.toLowerCase().includes(searchTerm));
        const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Sorting Logic
    filtered.sort((a, b) => {
        if (sortBy === 'newest') {
            return new Date(b.createdAt) - new Date(a.createdAt);
        } else if (sortBy === 'oldest') {
            return new Date(a.createdAt) - new Date(b.createdAt);
        } else if (sortBy === 'priority') {
            const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
            return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
        }
        return 0;
    });

    renderTickets(filtered);
}

function renderTickets(tickets) {
    const container = document.getElementById('tickets-container');

    if (tickets.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No tickets found.</p>';
        return;
    }

    let html = `
    <table>
        <thead>
            <tr>
                <th>User</th>
                <th>Device</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Tech</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
    `;

    tickets.forEach(ticket => {
        const statusClass = `status-${ticket.status.toLowerCase().replace(' ', '')}`;
        const userName = ticket.user ? ticket.user.name : 'Unknown';
        html += `
        <tr>
            <td>${userName}</td>
            <td>${ticket.deviceType}</td>
            <td>${ticket.description.substring(0, 20)}...</td>
            <td><span class="status-badge ${statusClass}">${ticket.status}</span></td>
            <td>${ticket.technician || '-'}</td>
            <td><button onclick="manageTicket('${ticket._id}')" class="btn-sm">Manage</button></td>
        </tr>
        `;
    });

    html += `
        </tbody>
    </table>`;
    container.innerHTML = html;
}

let currentTicketId = null;

async function manageTicket(id) {
    currentTicketId = id;
    try {
        const res = await fetch(`${API_URL}/tickets/${id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const ticket = await res.json();

        // Populate form
        document.getElementById('update-status').value = ticket.status;
        document.getElementById('update-tech').value = ticket.technician || '';
        document.getElementById('update-cost').value = ticket.estimatedCost || 0;

        // Timeline Logic
        const steps = ['Open', 'In Progress', 'Completed', 'Closed'];
        const currentStepIndex = steps.indexOf(ticket.status);

        let timelineHtml = '<div class="timeline">';
        steps.forEach((step, index) => {
            let className = 'timeline-step';
            if (index < currentStepIndex) className += ' completed';
            if (index === currentStepIndex) className += ' active';

            timelineHtml += `
            <div class="${className}">
                <div class="step-icon">
                    <i class="fa-solid ${index <= currentStepIndex ? 'fa-check' : 'fa-circle'}"></i>
                </div>
                <div class="step-label">${step}</div>
            </div>
            `;
        });
        timelineHtml += '</div>';

        // Show details
        const content = `
            ${timelineHtml}
            <div class="ticket-details">
                <p><strong>User:</strong> ${ticket.user ? ticket.user.name : 'Unknown'} (${ticket.user ? ticket.user.email : ''})</p>
                <p><strong>Device:</strong> ${ticket.deviceType}</p>
                <p><strong>Priority:</strong> <span class="priority-${ticket.priority.toLowerCase()}">${ticket.priority}</span></p>
                <p><strong>Description:</strong> ${ticket.description}</p>
            </div>
        `;
        document.getElementById('modal-content').innerHTML = content;

        // Show messages
        let messagesHtml = '';
        if (ticket.messages && ticket.messages.length > 0) {
            messagesHtml = '<div class="messages-container">';
            ticket.messages.forEach(msg => {
                messagesHtml += `
                <div class="message">
                    <strong class="message-sender">${msg.sender}:</strong> ${msg.text}
                    <div class="message-time">${new Date(msg.createdAt).toLocaleString()}</div>
                </div>
                `;
            });
            messagesHtml += '</div>';
        } else {
            messagesHtml = '<p>No messages.</p>';
        }
        document.getElementById('messages-list').innerHTML = messagesHtml;

        document.getElementById('ticket-modal').style.display = 'block';
        document.getElementById('modal-backdrop').style.display = 'block';
    } catch (err) {
        handleError(err);
    }
}

function closeModal() {
    document.getElementById('ticket-modal').style.display = 'none';
    document.getElementById('modal-backdrop').style.display = 'none';
    currentTicketId = null;
}

async function addNote() {
    if (!currentTicketId) return;
    const text = document.getElementById('note-text').value;
    if (!text) return;

    try {
        const res = await fetch(`${API_URL}/tickets/${currentTicketId}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ text })
        });

        if (!res.ok) throw new Error('Failed to add note');

        document.getElementById('note-text').value = '';
        manageTicket(currentTicketId); // Refresh modal
    } catch (err) {
        handleError(err);
    }
}
