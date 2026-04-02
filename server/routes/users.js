const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const { auth, isTeacher, isStudent } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/users/teachers
// @desc    Get all teachers
// @access  Private
router.get("/teachers", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, subject } = req.query;
    const query = { role: "teacher", isActive: true };

    if (subject) {
      query["profile.subject"] = { $regex: subject, $options: "i" };
    }

    const teachers = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      teachers,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get teachers error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/users/students
// @desc    Get all students (teachers only)
// @access  Private (Teacher)
router.get("/students", [auth, isTeacher], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const query = { role: "student", isActive: true };

    const students = await User.find(query)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get students error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Private
router.get("/profile/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.isActive) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Get profile error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  [
    auth,
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("profile.bio")
      .optional()
      .isLength({ max: 500 })
      .withMessage("Bio cannot be more than 500 characters"),
    body("profile.subject")
      .optional()
      .isLength({ max: 100 })
      .withMessage("Subject cannot be more than 100 characters"),
    body("profile.experience")
      .optional()
      .isLength({ max: 200 })
      .withMessage("Experience cannot be more than 200 characters"),
    body("profile.avatar")
      .optional()
      .custom((value) => {
        if (value && typeof value === "string") {
          // Check if it's a valid base64 image or URL
          if (value.startsWith("data:image/") || value.startsWith("http")) {
            return true;
          }
          throw new Error("Avatar must be a valid base64 image or URL");
        }
        return true;
      }),
  ],
  async (req, res) => {
    try {
      console.log("=== UPDATE PROFILE REQUEST ===");
      console.log("User:", req.user._id);
      console.log("Payload:", JSON.stringify(req.body, null, 2));

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { name, profile } = req.body;
      const updateFields = {};

      if (name) updateFields.name = name;
      if (profile) {
        if (profile.bio !== undefined)
          updateFields["profile.bio"] = profile.bio;
        if (profile.subject !== undefined)
          updateFields["profile.subject"] = profile.subject;
        if (profile.experience !== undefined)
          updateFields["profile.experience"] = profile.experience;
        if (profile.avatar !== undefined)
          updateFields["profile.avatar"] = profile.avatar;
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateFields },
        { new: true, runValidators: true }
      ).select("-password");

      res.json({
        message: "Profile updated successfully",
        user,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   DELETE /api/users/account
// @desc    Deactivate user account
// @access  Private
router.delete("/account", auth, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ message: "Account deactivated successfully" });
  } catch (error) {
    console.error("Deactivate account error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/users/upload-avatar
// @desc    Upload profile picture
// @access  Private
router.post(
  "/upload-avatar",
  [
    auth,
    body("image")
      .custom((value) => {
        // Allow empty string or null for removal
        if (!value || value === "") {
          return true;
        }

        if (!value.startsWith("data:image/")) {
          throw new Error(
            "Invalid image format. Must be base64 encoded image."
          );
        }
        // Check image size (limit to ~2MB base64)
        if (value.length > 2.7 * 1024 * 1024) {
          throw new Error("Image too large. Maximum size is 2MB.");
        }
        return true;
      }),
  ],
  async (req, res) => {
    try {
      console.log("=== UPLOAD AVATAR REQUEST ===");
      console.log("User:", req.user._id);
      console.log("Image data length:", req.body.image?.length);

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { image } = req.body;

      // Update user's avatar
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { "profile.avatar": image } },
        { new: true, runValidators: true }
      ).select("-password");

      console.log("Avatar updated successfully for user:", user._id);

      res.json({
        message: "Profile picture updated successfully",
        user,
      });
    } catch (error) {
      console.error("Upload avatar error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
