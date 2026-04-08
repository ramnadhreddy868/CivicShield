const User = require('../models/User');

class UserRepository {
  // Find user by email
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() }).select('+password');
  }

  // Find user by ID
  async findById(id) {
    return User.findById(id);
  }

  // Create new user
  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  // Find all users (for admin)
  async findAll(filter = {}) {
    return User.find(filter).sort({ createdAt: -1 });
  }

  // Update user
  async update(id, updateData) {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  }

  // Delete user
  async delete(id) {
    return User.findByIdAndDelete(id);
  }

  // Search users (for admin)
  async search(searchTerm) {
    const regex = new RegExp(searchTerm, 'i');
    return User.find({
      $or: [
        { email: regex },
        { name: regex },
        { phone: regex }
      ]
    });
  }
}

module.exports = new UserRepository();
