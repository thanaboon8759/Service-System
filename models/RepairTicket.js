const mongoose = require('mongoose');

const repairTicketSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    deviceType: {
        type: String,
        required: [true, 'Please specify the device type'],
        enum: ['Laptop', 'Desktop', 'Phone', 'Tablet', 'Other'],
    },
    description: {
        type: String,
        required: [true, 'Please provide a description of the problem'],
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low',
    },
    status: {
        type: String,
        enum: ['Submitted', 'In Progress', 'Awaiting Parts', 'Completed'],
        default: 'Submitted',
    },
    technician: {
        type: String, // Storing name/ID as string as requested, or could be ObjectId ref to User(admin)
        default: null,
    },
    estimatedCost: {
        type: Number,
        default: 0,
    },
    notes: {
        type: String, // Admin internal notes
    },
    messages: [
        {
            sender: {
                type: String, // 'user' or 'admin'
                required: true,
            },
            text: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('RepairTicket', repairTicketSchema);
