const express = require('express');
const router = express.Router();
const {
    createTicket,
    getMyTickets,
    getTicket,
    addTicketMessage,
    getAllTickets,
    updateTicket,
} = require('../controllers/ticketController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes
router.route('/all/list').get(protect, admin, getAllTickets); // Explicit path to avoid collision with :id

// User routes
router.route('/').get(protect, getMyTickets).post(protect, createTicket);
router.route('/:id').get(protect, getTicket).put(protect, admin, updateTicket); // Shared get, Admin put
router.route('/:id/messages').post(protect, addTicketMessage);

module.exports = router;
