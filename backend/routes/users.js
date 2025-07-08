const express = require('express');
const User = require('../models/User');
const { 
  authenticateToken, 
  requireAdmin, 
  requireEditor, 
  requireReviewer 
} = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/users - Get all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// GET /api/users/:id - Get specific user (admin or own user)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is requesting their own data or is admin
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. You can only view your own profile.' 
      });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// PATCH /api/users/:id/credit - Update user credits (admin only)
router.patch('/:id/credit', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { credits } = req.body;

    if (typeof credits !== 'number' || credits < 0) {
      return res.status(400).json({ 
        error: 'Credits must be a non-negative number' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { credits },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Credits updated successfully',
      user
    });
  } catch (error) {
    console.error('Update credits error:', error);
    res.status(500).json({ error: 'Failed to update credits' });
  }
});

// PATCH /api/users/:id/role - Update user role (admin only)
router.patch('/:id/role', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'admin', 'editor', 'reviewer'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        error: 'Invalid role. Must be one of: user, admin, editor, reviewer' 
      });
    }

    // Prevent admin from removing their own admin role
    if (req.user._id.toString() === id && role !== 'admin') {
      return res.status(400).json({ 
        error: 'Cannot remove your own admin role' 
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Role updated successfully',
      user
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({ 
        error: 'Cannot delete your own account' 
      });
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// POST /api/users/:id/deduct-credit - Deduct credit (internal use for summarization)
router.post('/:id/deduct-credit', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user is requesting their own credit deduction or is admin
    if (req.user._id.toString() !== id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Access denied. You can only deduct your own credits.' 
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.credits <= 0) {
      return res.status(400).json({ 
        error: 'Insufficient credits. Please recharge your account.' 
      });
    }

    user.credits -= 1;
    await user.save();

    res.json({
      message: 'Credit deducted successfully',
      remainingCredits: user.credits
    });
  } catch (error) {
    console.error('Deduct credit error:', error);
    res.status(500).json({ error: 'Failed to deduct credit' });
  }
});

// GET /api/users/stats - Get user statistics (admin only)
router.get('/stats/overview', requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          totalCredits: { $sum: '$credits' }
        }
      }
    ]);

    const lowCreditsUsers = await User.find({ credits: { $lt: 2 } })
      .select('name email credits')
      .limit(10);

    res.json({
      totalUsers,
      usersByRole,
      lowCreditsUsers
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router; 