import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { ticketApi } from '../api/ticketApi';

const DashboardPage = () => {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({ total: 0, progress: 0, completed: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // New Ticket Form State
    const [newTicket, setNewTicket] = useState({ deviceType: '', priority: 'Medium', description: '' });
    const [messageText, setMessageText] = useState('');

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            setLoading(true);
            const data = await ticketApi.getUserTickets();
            setTickets(data);

            // Calculate Stats
            setStats({
                total: data.length,
                progress: data.filter(t => t.status === 'In Progress').length,
                completed: data.filter(t => ['Completed', 'Closed'].includes(t.status)).length
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            await ticketApi.createTicket(newTicket);
            setNewTicket({ deviceType: '', priority: 'Medium', description: '' }); // Reset
            loadTickets();
            alert('Ticket submitted successfully!'); // Using alert as per legacy, or could use toast
        } catch (err) {
            alert('Failed to create ticket');
        }
    };

    const handleViewTicket = async (id) => {
        try {
            const data = await ticketApi.getTicket(id);
            setSelectedTicket(data);
            setShowModal(true);
            setMessageText(''); // Reset message input
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddMessage = async () => {
        if (!messageText.trim() || !selectedTicket) return;
        try {
            await ticketApi.addMessage(selectedTicket._id, messageText);
            // Refresh ticket data
            const updated = await ticketApi.getTicket(selectedTicket._id);
            setSelectedTicket(updated);
            setMessageText('');
        } catch (err) {
            alert('Failed to add message');
        }
    };

    // Timeline Helper
    const steps = ['Open', 'In Progress', 'Completed', 'Closed'];
    const getStepClass = (step, currentStatus) => {
        const stepIndex = steps.indexOf(step);
        const currentIndex = steps.indexOf(currentStatus);

        let className = 'timeline-step';
        if (stepIndex < currentIndex) className += ' completed';
        if (stepIndex === currentIndex) className += ' active';
        return className;
    };

    return (
        <>
            <Navbar />
            <div className="container main-content">
                {/* Stats Row */}
                <div className="stats-grid">
                    <div className="card stat-card">
                        <div className="stat-icon bg-blue"><i className="fa-solid fa-ticket"></i></div>
                        <div className="stat-info"><h3>Total Tickets</h3><p>{stats.total}</p></div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon bg-yellow"><i className="fa-solid fa-clock"></i></div>
                        <div className="stat-info"><h3>In Progress</h3><p>{stats.progress}</p></div>
                    </div>
                    <div className="card stat-card">
                        <div className="stat-icon bg-green"><i className="fa-solid fa-check-circle"></i></div>
                        <div className="stat-info"><h3>Completed</h3><p>{stats.completed}</p></div>
                    </div>
                </div>

                <div className="dashboard-grid">
                    {/* New Ticket Form */}
                    <div className="card">
                        <h2><i className="fa-solid fa-plus-circle"></i> New Repair Ticket</h2>
                        <form onSubmit={handleCreateTicket}>
                            <div className="form-group">
                                <label>Device Type</label>
                                <select
                                    value={newTicket.deviceType}
                                    onChange={(e) => setNewTicket({ ...newTicket, deviceType: e.target.value })}
                                    required
                                >
                                    <option value="">Select Device...</option>
                                    <option value="Laptop">Laptop</option>
                                    <option value="Desktop">Desktop</option>
                                    <option value="Phone">Phone</option>
                                    <option value="Tablet">Tablet</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Priority</label>
                                <select
                                    value={newTicket.priority}
                                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Description of Issue</label>
                                <textarea
                                    rows="4"
                                    placeholder="Please describe the problem..."
                                    required
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                ></textarea>
                            </div>
                            <button type="submit" style={{ width: '100%' }}>
                                Submit Ticket <i className="fa-solid fa-paper-plane"></i>
                            </button>
                        </form>
                    </div>

                    {/* Ticket List */}
                    <div className="card">
                        <h2><i className="fa-solid fa-list"></i> My Tickets</h2>
                        <div id="tickets-container">
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                                    <i className="fa-solid fa-spinner fa-spin fa-2x"></i>
                                    <p style={{ marginTop: '1rem' }}>Loading tickets...</p>
                                </div>
                            ) : tickets.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    <i className="fa-solid fa-clipboard-list fa-3x" style={{ marginBottom: '1rem', opacity: 0.5 }}></i>
                                    <h3>No Tickets Found</h3>
                                    <p>You haven't submitted any repair tickets yet.</p>
                                </div>
                            ) : (
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
                                        {tickets.map(ticket => (
                                            <tr key={ticket._id}>
                                                <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                                <td>{ticket.deviceType}</td>
                                                <td>{ticket.description.substring(0, 30)}...</td>
                                                <td><span className={`status-badge status-${ticket.status.toLowerCase().replace(' ', '')}`}>{ticket.status}</span></td>
                                                <td><button onClick={() => handleViewTicket(ticket._id)} className="btn-sm">View</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Modal */}
            {showModal && selectedTicket && (
                <>
                    <div className="modal-backdrop" style={{ display: 'block' }} onClick={() => setShowModal(false)}></div>
                    <div className="modal" style={{ display: 'block' }}>
                        <div className="modal-header">
                            <h2>Ticket Details</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
                        </div>
                        <div id="modal-content">
                            {/* Timeline */}
                            <div className="timeline">
                                {steps.map((step, idx) => {
                                    const stepClass = getStepClass(step, selectedTicket.status);
                                    // Helper for icon check
                                    const currentIndex = steps.indexOf(selectedTicket.status);
                                    const isCheck = idx <= currentIndex;

                                    return (
                                        <div key={step} className={stepClass}>
                                            <div className="step-icon">
                                                <i className={`fa-solid ${isCheck ? 'fa-check' : 'fa-circle'}`}></i>
                                            </div>
                                            <div className="step-label">{step}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="ticket-details">
                                <p><strong>Device:</strong> {selectedTicket.deviceType}</p>
                                <p><strong>Status:</strong> <span className={`status-badge status-${selectedTicket.status.toLowerCase().replace(' ', '')}`}>{selectedTicket.status}</span></p>
                                <p><strong>Description:</strong> {selectedTicket.description}</p>
                                <p><strong>Technician:</strong> {selectedTicket.technician || 'Unassigned'}</p>
                                <p><strong>Est. Cost:</strong> ${selectedTicket.estimatedCost || 0}</p>
                            </div>

                            {/* Messages */}
                            {selectedTicket.messages && selectedTicket.messages.length > 0 && (
                                <div className="messages-container">
                                    {selectedTicket.messages.map((msg, i) => (
                                        <div key={i} className="message">
                                            <strong className="message-sender">{msg.sender}:</strong> {msg.text}
                                            <div className="message-time">{new Date(msg.createdAt).toLocaleString()}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                            <h3>Add Note</h3>
                            <div className="form-group">
                                <textarea
                                    rows="2"
                                    placeholder="Type a message..."
                                    className="w-full"
                                    value={messageText}
                                    onChange={(e) => setMessageText(e.target.value)}
                                ></textarea>
                            </div>
                            <button onClick={handleAddMessage} className="btn-primary btn-sm">Send Message</button>
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default DashboardPage;
