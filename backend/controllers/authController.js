require("dotenv").config();
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

exports.register = async (req, res) => {
  try {
    const { userName, email, password, firstName, lastName, profession } =
      req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (await User.findOne({ userName })) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = generateToken();

    await User.create({
      userName,
      email,
      password: hashedPassword,
      profession,

      profile: {
        firstName,
        lastName,
      },

      isVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 10 * 60 * 1000,
    });

    const verifyLink = `${process.env.BACKEND_URL}/auth/verify-email/${verificationToken}`;

    await sendEmail({
      to: email,
      subject: "Verify your email",
      html: `<p>Click below to verify:</p>
             <a href="${verifyLink}">Verify Email</a>
            <p>This link expires in 10 minutes.</p>
`,
    });

    res.status(201).json({
      success: true,
      message: "Registered. Please verify your email.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email should be verified first before login",
      });
    }

    const isCorrect = await bcrypt.compare(password, user.password);
    if (!isCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_KEY,
      { expiresIn: "1d" },
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() },
    });

    console.log(process.env.CLIENT_URL);

    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL}/login?isVerified=false`);
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    // ✅ ALWAYS redirect to frontend
    return res.redirect(`${process.env.CLIENT_URL}/login?isVerified=true`);
  } catch (err) {
    return res.redirect(`${process.env.CLIENT_URL}/login?isVerified=false`);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        success: true,
        message: "If the email exists, a reset link has been sent",
      });
    }
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Verify the email first",
      });
    }
    const resetToken = generateToken();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>You requested a password reset.</p>
        <p>Click below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link expires in 10 minutes.</p>
      `,
    });

    return res.json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset Successfully. You can now login",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
