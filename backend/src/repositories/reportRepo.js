const mongoose = require('mongoose');
const Report = require('../models/Report');

const memoryStore = {
  reports: [],
};

function isDbConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

async function create(reportData) {
  if (isDbConnected()) {
    return Report.create(reportData);
  }
  const now = new Date();
  const doc = {
    _id: String(Date.now()),
    ...reportData,
    createdAt: now,
    updatedAt: now,
  };
  memoryStore.reports.unshift(doc);
  return doc;
}

async function findAll() {
  if (isDbConnected()) {
    return Report.find({}).sort({ createdAt: -1 }).lean();
  }
  return [...memoryStore.reports];
}

async function findByUserId(userId) {
  if (isDbConnected()) {
    return Report.find({ userId }).sort({ createdAt: -1 }).lean();
  }
  return memoryStore.reports.filter((r) => String(r.userId) === String(userId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function findById(id) {
  if (isDbConnected()) {
    return Report.findById(id).lean();
  }
  return memoryStore.reports.find((r) => String(r._id) === String(id)) || null;
}

async function updateStatus(id, status) {
  if (isDbConnected()) {
    return Report.findByIdAndUpdate(id, { status }, { new: true, runValidators: true }).lean();
  }
  const idx = memoryStore.reports.findIndex((r) => String(r._id) === String(id));
  if (idx === -1) return null;
  memoryStore.reports[idx] = {
    ...memoryStore.reports[idx],
    status,
    updatedAt: new Date(),
  };
  return memoryStore.reports[idx];
}

async function assignDepartment(id, assignedDepartment) {
  if (isDbConnected()) {
    return Report.findByIdAndUpdate(id, { assignedDepartment }, { new: true }).lean();
  }
  const idx = memoryStore.reports.findIndex((r) => String(r._id) === String(id));
  if (idx === -1) return null;
  memoryStore.reports[idx] = {
    ...memoryStore.reports[idx],
    assignedDepartment,
    updatedAt: new Date(),
  };
  return memoryStore.reports[idx];
}

async function findByDepartment(assignedDepartment) {
  if (isDbConnected()) {
    return Report.find({ assignedDepartment }).sort({ createdAt: -1 }).lean();
  }
  return memoryStore.reports
    .filter((r) => r.assignedDepartment === assignedDepartment)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

async function authorityUpdate(id, status, remarks) {
  if (isDbConnected()) {
    return Report.findByIdAndUpdate(
      id, 
      { status, authorityRemarks: remarks }, 
      { new: true, runValidators: true }
    ).lean();
  }
  const idx = memoryStore.reports.findIndex((r) => String(r._id) === String(id));
  if (idx === -1) return null;
  memoryStore.reports[idx] = {
    ...memoryStore.reports[idx],
    status,
    authorityRemarks: remarks,
    updatedAt: new Date(),
  };
  return memoryStore.reports[idx];
}

module.exports = {
  create,
  findAll,
  findByUserId,
  findById,
  updateStatus,
  assignDepartment,
  findByDepartment,
  authorityUpdate,
};


