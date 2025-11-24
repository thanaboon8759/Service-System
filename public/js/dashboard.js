// API_URL, getToken, and handleError are defined in app.js

document.addEventListener('DOMContentLoaded', () => {
    loadTickets();

    const ticketForm = document.getElementById('ticket-form');
    if (ticketForm) {
        ticketForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const deviceType = document.getElementById('device-type').value;
            const priority = document.getElementById('priority').value;
            const description = document.getElementById('description').value;

            try {
                const res = await fetch(`${API_URL}/tickets`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${getToken()}`
                    },
                    body: JSON.stringify({ deviceType, priority, description })
                });

                if (!res.ok) throw new Error('Failed to create ticket');

                document.getElementById('ticket-form').reset();
                loadTickets();
                alert('Ticket submitted successfully!');
            } catch (err) {
                handleError(err);
            }
        });
    }
});

async function loadTickets() {
    try {
        const res = await fetch(`${API_URL}/tickets`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const tickets = await res.json();

        const container = document.getElementById('tickets-container');

        // Update Stats
        document.getElementById('stat-total').textContent = tickets.length;
        document.getElementById('stat-progress').textContent = tickets.filter(t => t.status === 'In Progress').length;
        document.getElementById('stat-completed').textContent = tickets.filter(t => t.status === 'Completed' || t.status === 'Closed').length;

        if (tickets.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">No tickets found. Create one to get started!</p>';
            return;
        }

        let html = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Device</th>
                    <th>Issue</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
        `;

        tickets.forEach(ticket => {
            const date = new Date(ticket.createdAt).toLocaleDateString();
            const statusClass = `status-${ticket.status.toLowerCase().replace(' ', '')}`;
            html += `
            <tr>
                <td>${date}</td>
                <td>${ticket.deviceType}</td>
                <td>${ticket.description.substring(0, 30)}...</td>
                <td><span class="status-badge ${statusClass}">${ticket.status}</span></td>
                <td><button onclick="viewTicket('${ticket._id}')" class="btn-sm">View</button></td>
            </tr>
            `;
        });

        html += `
            </tbody>
        </table>`;
        container.innerHTML = html;
    } catch (err) {
        handleError(err);
    }
}

let currentTicketId = null;

async function viewTicket(id) {
    currentTicketId = id;
    try {
        const res = await fetch(`${API_URL}/tickets/${id}`, {
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const ticket = await res.json();

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
        }

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

        const content = `
            ${timelineHtml}
            <div class="ticket-details">
                <p><strong>Device:</strong> ${ticket.deviceType}</p>
                <p><strong>Status:</strong> <span class="status-badge status-${ticket.status.toLowerCase().replace(' ', '')}">${ticket.status}</span></p>
                <p><strong>Description:</strong> ${ticket.description}</p>
                <p><strong>Technician:</strong> ${ticket.technician || 'Unassigned'}</p>
                <p><strong>Est. Cost:</strong> $${ticket.estimatedCost}</p>
            </div>
            ${messagesHtml}
        `;

        document.getElementById('modal-content').innerHTML = content;
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

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            // แสดงข้อความจาก backend ถ้ามี เพื่อจะได้รู้สาเหตุจริง ๆ
            throw new Error(data.message || 'Failed to add note');
        }

        document.getElementById('note-text').value = '';
        viewTicket(currentTicketId); // Refresh modal
    } catch (err) {
        handleError(err);
    }
}
