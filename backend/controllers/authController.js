const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { sendResetPasswordEmail } = require('../utils/emailService');
const asyncHandler = require('../middleware/asyncHandler');

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(200).json({
            message: 'If the email exists, a reset link will be sent',
        });
    }

    // Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Set token and expiration (15 minutes)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    // Create reset link
    const frontendBase = String(
        process.env.FRONTEND_URL ||
        req.headers.origin ||
        'http://localhost:5173'
    ).replace(/\/+$/, '');
    const resetLink = `${frontendBase}/reset-password/${resetToken}`;

    // Send Email - don't fail if email fails
    try {
        await sendResetPasswordEmail({
            userEmail: user.email,
            userName: user.name,
            resetLink
        });
    } catch (emailError) {
        console.error('Email sending failed:', emailError.message);
        // Continue anyway - token is saved
    }

    res.status(200).json({ message: 'If the email exists, a reset link will be sent' });
});

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by token and ensure it's not expired
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Set new password (the pre-save hook will hash it)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful. You can now log in.' });
});
