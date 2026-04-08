const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, required: true },
    type: { type: String, default: 'status_update' },
    isRead: { type: Boolean, default: false },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report',
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', NotificationSchema);
