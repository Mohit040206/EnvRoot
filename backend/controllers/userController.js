const User = require("../model/User");
const cloudinary = require("../config/cloudinary");
const { default: mongoose } = require("mongoose");

/**
 * GET /users/me
 * View own profile
 * */
exports.getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(
      new mongoose.Types.ObjectId(req.user.id),
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * PUT /users/me
 * Update profile details + avatar
 * */
exports.updateMyProfile = async (req, res) => {
  try {
    const updates = {};

    if (req.body.userName !== undefined) {
      updates.userName = req.body.userName;
    }

    if (req.body.email !== undefined) {
      updates.email = req.body.email;
    }

    if (req.body.profile) {
      if (req.body.profile.firstName !== undefined) {
        updates["profile.firstName"] = req.body.profile.firstName;
      }
      if (req.body.profile.lastName !== undefined) {
        updates["profile.lastName"] = req.body.profile.lastName;
      }
      if (req.body.profile.bio !== undefined) {
        updates["profile.bio"] = req.body.profile.bio;
      }
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if exists
      if (user.profile?.avatar?.publicId) {
        await cloudinary.uploader.destroy(user.profile.avatar.publicId);
      }

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "avatars" }, (error, result) => {
            if (error) reject(error);
            resolve(result);
          })
          .end(req.file.buffer);
      });

      if (!uploadResult?.secure_url) {
        throw new Error("Avatar upload failed");
      }

      updates["profile.avatar"] = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email or username already in use",
      });
    }
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/**
 * DELETE /users/me
 * Delete own account
 */
exports.deleteMyAccount = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id);

    if (!deletedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (deletedUser.profile?.avatar?.publicId) {
      await cloudinary.uploader.destroy(deletedUser.profile.avatar.publicId);
    }

    res
      .status(200)
      .json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
