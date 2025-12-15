import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ticketApi } from '../api/ticketApi';

const AdminPage = () => {
    const [allTickets, setAllTickets] = useState([]);
    const [filteredTickets, setFilteredTickets] = useState([]);
    const [stats, setStats] = useState({ total: 0, active: 0, resolved: 0 });
    const [loading, setLoading] = useState(true);

    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [sortBy, setSortBy] = useState('newest');

    // Modal State
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [updateData, setUpdateData] = useState({ status: '', technician: '', estimatedCost: 0 });
    const [messageText, setMessageText] = useState('');

    useEffect(() => {
        loadAllTickets();
    }, []);

    useEffect(() => {
        filterTickets();
    }, [allTickets, searchTerm, filterStatus, sortBy]);

    const loadAllTickets = async () => {
        try {
            setLoading(true);
            const data = await ticketApi.getAllTickets();
            setAllTickets(data);

            // Stats
            setStats({
                total: data.length,
                active: data.filter(t => ['Open', 'In Progress'].includes(t.status)).length,
                resolved: data.filter(t => ['Completed', 'Closed'].includes(t.status)).length
            });
        } catch (err) {
            console.error('Failed to load tickets', err);
        } finally {
            setLoading(false);
        }
    };

    const filterTickets = () => {
        let result = allTickets.filter(ticket => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                (ticket.description && ticket.description.toLowerCase().includes(term)) ||
                (ticket.user && ticket.user.name && ticket.user.name.toLowerCase().includes(term)) ||
                (ticket.deviceType && ticket.deviceType.toLowerCase().includes(term));

            const matchesStatus = filterStatus === 'All' || ticket.status === filterStatus;

            return matchesSearch && matchesStatus;
        });

        // Sort
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'priority') {
                const map = { 'High': 3, 'Medium': 2, 'Low': 1 };
                return (map[b.priority] || 0) - (map[a.priority] || 0);
            }
            return 0;
        });

        setFilteredTickets(result);
    };

    const handleManageTicket = async (id) => {
        try {
            const data = await ticketApi.getTicket(id);
            setSelectedTicket(data);
            setUpdateData({
                status: data.status,
                technician: data.technician || '',
                estimatedCost: data.estimatedCost || 0
            });
            setMessageText('');
            setShowModal(true);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateTicket = async (e) => {
        e.preventDefault();
        try {
            await ticketApi.updateTicket(selectedTicket._id, updateData);
            // Refresh
            loadAllTickets();
            setShowModal(false);
            // Could show toast success
        } catch (err) {
            alert('Failed to update ticket');
        }
    };

    const handleAddNote = async () => {
        if (!messageText.trim() || !selectedTicket) return;
        try {
            await ticketApi.addMessage(selectedTicket._id, messageText);
            // Refresh detailed view inside modal
            const updated = await ticketApi.getTicket(selectedTicket._id);
            setSelectedTicket(updated);
            setMessageText('');
        } catch (err) {
            alert('Failed to add note');
        }
    };

    // Timeline Helper (Same as Dashboard but with 'Submitted')
    const steps = ['Submitted', 'In Progress', 'Awaiting Parts', 'Completed'];
    // Wait, Legacy Admin.js says: ['Submitted', 'In Progress', 'Awaiting Parts', 'Completed'] 
    // But Ticket creation creates 'Open'. 
    // Legacy Admin.js line 160: const steps = ['Submitted', 'In Progress', 'Awaiting Parts', 'Completed'];
    // And logic: if (currentStepIndex !== -1 && index <= currentStepIndex) className += ' completed';
    // 'Open' probably maps to 'Submitted' visually or is distinct. 
    // In legacy, ticket.status could be 'Open'. 
    // If ticket.status is 'Open', currentStepIndex is -1 if not found.
    // Let's check filter options in HTML: Open, In Progress, Completed, Closed.
    // Let's stick to the steps defined in legacy admin.js for visual consistency, but be aware 'Open' might not highlight anything or highlight 'Submitted'?
    // Actually, 'Submitted' is likely the UI term for 'Open'. 
    // Let's normalize visual steps: 
    // If ticket.status === 'Open', effectively 'Submitted'.

    const getVisualStepIndex = (status) => {
        if (status === 'Open') return steps.indexOf('Submitted');
        if (status === 'Closed') return steps.indexOf('Completed'); // ?
        return steps.indexOf(status);
    };

    const currentStepIndex = selectedTicket ? getVisualStepIndex(selectedTicket.status) : -1;

    return (
        <>
            <Navbar isAdmin={true} />
            <div className="container main-content">
                {/* Stats */}
                <div className="stats-grid">
                    <div className="card stat-card">
                        <div className="stat-icon bg-blue"><i className="fa-solid fa-users"></i></div>
                        <div className="stat-info"><h3>Total Tickets</h3><p>{stats.total}</p></div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon bg-yellow"><i className="fa-solid fa-spinner"></i></div>
                        <div className="stat-info"><h3>Active</h3><p>{stats.active}</p></div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon bg-green"><i className="fa-solid fa-check-double"></i></div>
                        <div className="stat-info"><h3>Resolved</h3><p>{stats.resolved}</p></div>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="card">
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            style={{ flex: 1, minWidth: '200px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            style={{ width: '200px' }}
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="All">All Status</option>
                            <option value="Submitted">Submitted</option> {/* Maybe Open? Legacy had Submitted */}
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Closed">Closed</option>
                        </select>
                        <select
                            style={{ width: '200px' }}
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                            <option value="priority">Priority (High-Low)</option>
                        </select>
                    </div>

                    <div id="tickets-container">
                        {loading ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</p>
                        ) : filteredTickets.length === 0 ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No tickets found.</p>
                        ) : (
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
                                    {filteredTickets.map(ticket => (
                                        <tr key={ticket._id}>
                                            <td>{ticket.user?.name || 'Unknown'}</td>
                                            <td>{ticket.deviceType}</td>
                                            <td>{ticket.description.substring(0, 20)}...</td>
                                            <td><span className={`status-badge status-${ticket.status.toLowerCase().replace(' ', '')}`}>{ticket.status}</span></td>
                                            <td>{ticket.technician || '-'}</td>
                                            <td><button onClick={() => handleManageTicket(ticket._id)} className="btn-sm">Manage</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Manage Modal */}
            {showModal && selectedTicket && (
                <>
                    <div className="modal-backdrop" style={{ display: 'block' }} onClick={() => setShowModal(false)}></div>
                    <div className="modal" style={{ display: 'block' }}>
                        <div className="modal-header">
                            <h2>Manage Ticket</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>

                        <form onSubmit={handleUpdateTicket}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                                {/* Left: Details & Chat */}
                                <div>
                                    {/* Timeline */}
                                    <div className="timeline">
                                        {steps.map((step, idx) => {
                                            let className = 'timeline-step';
                                            if (currentStepIndex !== -1 && idx <= currentStepIndex) className += ' completed';
                                            if (idx === currentStepIndex) className += ' active';

                                            return (
                                                <div key={step} className={className}>
                                                    <div className="step-icon">
                                                        <i className={`fa-solid ${currentStepIndex !== -1 && idx <= currentStepIndex ? 'fa-check' : 'fa-circle'}`}></i>
                                                    </div>
                                                    <div className="step-label">{step}</div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="ticket-details">
                                        <p><strong>User:</strong> {selectedTicket.user?.name} ({selectedTicket.user?.email})</p>
                                        <p><strong>Device:</strong> {selectedTicket.deviceType}</p>
                                        <p><strong>Priority:</strong> <span className={`priority-${selectedTicket.priority?.toLowerCase()}`}>{selectedTicket.priority}</span></p>
                                        <p><strong>Description:</strong> {selectedTicket.description}</p>
                                    </div>

                                    <div className="messages-container" style={{ maxHeight: '200px' }}>
                                        {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                                            selectedTicket.messages.map((msg, i) => (
                                                <div key={i} className="message">
                                                    <strong className="message-sender">{msg.sender}:</strong> {msg.text}
                                                    <div className="message-time">{new Date(msg.createdAt).toLocaleString()}</div>
                                                </div>
                                            ))
                                        ) : <p>No messages.</p>}
                                    </div>

                                    <div style={{ marginTop: '1rem' }}>
                                        <textarea
                                            rows="2"
                                            placeholder="Add a note..."
                                            value={messageText}
                                            onChange={(e) => setMessageText(e.target.value)}
                                        ></textarea>
                                        <button type="button" onClick={handleAddNote} className="btn-primary btn-sm" style={{ marginTop: '0.5rem' }}>Add Note</button>
                                    </div>
                                </div>

                                {/* Right: Management Form */}
                                <div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select
                                            value={updateData.status}
                                            onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                                        >
                                            <option value="Open">Open</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="Closed">Closed</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Technician</label>
                                        <input
                                            type="text"
                                            placeholder="Technician name"
                                            value={updateData.technician}
                                            onChange={(e) => setUpdateData({ ...updateData, technician: e.target.value })}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Estimated Cost ($)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={updateData.estimatedCost}
                                            onChange={(e) => setUpdateData({ ...updateData, estimatedCost: parseFloat(e.target.value) })}
                                        />
                                    </div>

                                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Update Ticket</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </>
            )}
        </>
    );
};

export default AdminPage;
