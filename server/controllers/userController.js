const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
    const users = await User.find({});
    res.status(200).json(users);
};

module.exports = {
    getAllUsers,
};
