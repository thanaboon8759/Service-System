const RepairTicket = require('../models/RepairTicket');

// @desc    Create new repair ticket
// @route   POST /api/tickets
// @access  Private (User)
const createTicket = async (req, res) => {
    const { deviceType, description, priority } = req.body;

    if (!deviceType || !description) {
        res.status(400).json({ message: 'Please add device type and description' });
        return;
    }

    const ticket = await RepairTicket.create({
        user: req.user.id,
        deviceType,
        description,
        priority,
        status: 'Submitted',
    });

    res.status(201).json(ticket);
};

// @desc    Get user tickets
// @route   GET /api/tickets
// @access  Private (User)
const getMyTickets = async (req, res) => {
    const tickets = await RepairTicket.find({ user: req.user.id });
    res.status(200).json(tickets);
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private (User/Admin)
const getTicket = async (req, res) => {
    const ticket = await RepairTicket.findById(req.params.id);

    if (!ticket) {
        res.status(404).json({ message: 'Ticket not found' });
        return;
    }

    // Make sure user owns the ticket or is admin
    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    res.status(200).json(ticket);
};

// @desc    Add message/note to ticket
// @route   POST /api/tickets/:id/messages
// @access  Private (User/Admin)
const addTicketMessage = async (req, res) => {
    const { text } = req.body;

    const ticket = await RepairTicket.findById(req.params.id);

    if (!ticket) {
        res.status(404).json({ message: 'Ticket not found' });
        return;
    }

    if (ticket.user.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401).json({ message: 'Not authorized' });
        return;
    }

    const message = {
        sender: req.user.role, // 'user' or 'admin'
        text,
        createdAt: Date.now(),
    };

    ticket.messages.push(message);
    await ticket.save();

    res.status(200).json(ticket);
};

// --- Admin Functions ---

// @desc    Get all tickets
// @route   GET /api/tickets/all
// @access  Private (Admin)
const getAllTickets = async (req, res) => {
    // Basic filtering and sorting could be added here via query params
    const tickets = await RepairTicket.find().populate('user', 'name email');
    res.status(200).json(tickets);
};

// @desc    Update ticket status, technician, cost, notes
// @route   PUT /api/tickets/:id
// @access  Private (Admin)
const updateTicket = async (req, res) => {
    const ticket = await RepairTicket.findById(req.params.id);

    if (!ticket) {
        res.status(404).json({ message: 'Ticket not found' });
        return;
    }

    const updatedTicket = await RepairTicket.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.status(200).json(updatedTicket);
};

module.exports = {
    createTicket,
    getMyTickets,
    getTicket,
    addTicketMessage,
    getAllTickets,
    updateTicket,
};
