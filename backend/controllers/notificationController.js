const Notification = require('../models/notificationModel');

// Create a new notification
const createNotification = async (userId, message) => {
  return await Notification.create({ user: userId, message });
};

// Get notifications for logged-in user
const getUserNotifications = async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(notifications);
};

// Mark notification as read
const markAsRead = async (req, res) => {
  const { notificationId } = req.params;
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: req.user._id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  res.json(notification);
};

module.exports = { createNotification, getUserNotifications, markAsRead };