const mongoose = require('mongoose');
const Message = require('../models/messageModel');
const User = require('../models/userModel');
const Course = require('../models/courseModel');

// 📨 Send a message (student or teacher)
const sendMessage = async (req, res) => {
  try {
    const { receiverId, courseId, message } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const receiver = await User.findById(receiverId);
    if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

    const newMessage = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      course: courseId,
      message,
    });

    res.status(201).json({ message: 'Message sent successfully', data: newMessage });
  } catch (error) {
    console.error('Send Message Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// 📬 Get all messages between two users in a course
const getConversation = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const messages = await Message.find({
      course: courseId,
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id },
      ],
    })
      .sort({ sentAt: 1 })
      .populate('sender', 'name email')
      .populate('receiver', 'name email');

    res.json(messages);
  } catch (error) {
    console.error('Get Conversation Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getThreads = async (req, res) => {
  try {
    const { userId, courseId } = req.params;

    const threads = await Message.aggregate([
      {
        $match: {
          course: new mongoose.Types.ObjectId(courseId),
          $or: [
            { sender: new mongoose.Types.ObjectId(userId) },
            { receiver: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $project: {
          otherUser: {
            $cond: [
              { $eq: ['$sender', new mongoose.Types.ObjectId(userId)] },
              '$receiver',
              '$sender',
            ],
          },
          sentAt: 1,
          message: 1,
        },
      },
      {
        $sort: { sentAt: -1 }, // newest messages first
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessageAt: { $first: '$sentAt' },
          lastMessage: { $first: '$message' },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo',
        },
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          threadId: '$_id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          lastMessageAt: 1,
          lastMessage: 1,
        },
      },
      { $sort: { lastMessageAt: -1 } },
    ]);

    res.json(threads);
  } catch (error) {
    console.error('Get Threads Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  sendMessage,
  getConversation,
  getThreads,
};