const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String },
  },
  { _id: false }
);

const ReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ['road_pothole', 'street_light', 'garbage', 'women_safety'],
    },
    images: [{ type: String }], // stored as '/uploads/filename.ext'
    location: { type: LocationSchema, required: true },
    status: {
      type: String,
      enum: [
        'submitted', 
        'in_progress', 
        'resolved', 
        'pending', 
        'received', 
        'investigation_started'
      ],
      default: 'submitted',
    },
    assignedDepartment: {
      type: String,
      enum: ['municipal', 'women_safety', null],
      default: null,
    },
    authorityRemarks: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Report', ReportSchema);


