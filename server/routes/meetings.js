const express = require("express");
const { body, validationResult } = require("express-validator");
const Meeting = require("../models/Meeting");
const { auth, isTeacher, isStudent } = require("../middleware/auth");

const router = express.Router();

// @route   POST /api/meetings
// @desc    Create a new meeting
// @access  Private
router.post(
  "/",
  [
    auth,
    body("title")
      .trim()
      .isLength({ min: 3, max: 100 })
      .withMessage("Title must be between 3 and 100 characters"),
    body("subject")
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage("Subject must be between 2 and 100 characters"),
    body("scheduledDate")
      .customSanitizer((value) => {
        // Replace '/' with '-' and reorder if DD/MM/YYYY
        if (value.includes("/")) {
          const [day, month, year] = value.split("/");
          return `${year}-${month}-${day}`;
        }
        return value;
      })
      .isISO8601()
      .withMessage("Please provide a valid date"),

    body("duration")
      .isInt({ min: 15, max: 240 })
      .withMessage("Duration must be between 15 and 240 minutes"),
    body("maxStudents")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Max students must be between 1 and 50"),
    body("teacherId").optional().isMongoId().withMessage("Invalid teacher ID"),
  ],
  async (req, res) => {
    try {
      console.log("=== CREATE MEETING REQUEST ===");
      console.log("Request body:", req.body);
      console.log("Request headers:", req.headers);
      console.log("User:", req.user);

      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("Validation errors:", errors.array());
        return res.status(400).json({
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const {
        title,
        description,
        subject,
        scheduledDate,
        duration,
        maxStudents,
        isPrivate,
        tags,
        notes,
        teacherId,
      } = req.body;

      // Check if scheduled date is in the future
      if (new Date(scheduledDate) <= new Date()) {
        return res
          .status(400)
          .json({ message: "Scheduled date must be in the future" });
      }

      let meetingHost = req.user._id;
      let enrolledStudents = [];

      // If a student creates a meeting, they can specify a teacher and they are enrolled
      if (req.user.role === "student") {
        if (teacherId) {
          meetingHost = teacherId;
        }
        enrolledStudents.push(req.user._id);
      }

      const meeting = new Meeting({
        title,
        description,
        teacher: meetingHost,
        subject,
        scheduledDate,
        duration,
        maxStudents: maxStudents || 10,
        isPrivate: isPrivate || false,
        students: enrolledStudents,
        tags: tags || [],
        notes,
        createdBy: req.user._id,
      });

      await meeting.save();
      await meeting.populate("teacher", "name email profile");

      res.status(201).json({
        message: "Meeting created successfully",
        meeting,
      });
    } catch (error) {
      console.error("Create meeting error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// @route   GET /api/meetings
// @desc    Get all meetings
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, subject, status, teacher } = req.query;
    const query = {};

    if (subject) {
      query.subject = { $regex: subject, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    if (teacher) {
      query.teacher = teacher;
    }

    // Filter by role-specific access
    if (req.user.role === "student") {
      // For students: Show if public, if they are an attendee, OR if they are the host
      query.$or = [
        { isPrivate: false }, 
        { students: req.user._id },
        { teacher: req.user._id }
      ];
    } else if (req.user.role === "teacher") {
      // For teachers: Show their own meetings OR public meetings
      query.$or = [
        { isPrivate: false },
        { teacher: req.user._id }
      ];
    }

    const meetings = await Meeting.find(query)
      .populate("teacher", "name email profile")
      .populate("students", "name email")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduledDate: 1 });

    const total = await Meeting.countDocuments(query);

    res.json({
      meetings,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Get meetings error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   GET /api/meetings/:id
// @desc    Get meeting by ID
// @access  Private
router.get("/:id", auth, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate("teacher", "name email profile")
      .populate("students", "name email");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if user has access to this meeting
    const isTeacher =
      meeting.teacher._id.toString() === req.user._id.toString();
    const isEnrolledStudent = meeting.students.some(
      (student) => student._id.toString() === req.user._id.toString()
    );
    const isPublic = !meeting.isPrivate;

    if (!isTeacher && !isEnrolledStudent && !isPublic) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ meeting });
  } catch (error) {
    console.error("Get meeting error:", error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Meeting not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// @route   POST /api/meetings/:id/join
// @desc    Join a meeting (students only)
// @access  Private (Student)
router.post("/:id/join", [auth, isStudent], async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if meeting is full
    if (meeting.students.length >= meeting.maxStudents) {
      return res.status(400).json({ message: "Meeting is full" });
    }

    // Check if student is already enrolled
    if (meeting.students.includes(req.user._id)) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this meeting" });
    }

    // Check if meeting is in the future
    if (meeting.scheduledDate <= new Date()) {
      return res.status(400).json({ message: "Cannot join past meetings" });
    }

    meeting.students.push(req.user._id);
    await meeting.save();

    await meeting.populate("teacher", "name email profile");
    await meeting.populate("students", "name email");

    res.json({
      message: "Successfully joined the meeting",
      meeting,
    });
  } catch (error) {
    console.error("Join meeting error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// @route   DELETE /api/meetings/:id/leave
// @desc    Leave a meeting (students only)
// @access  Private (Student)
router.delete("/:id/leave", [auth, isStudent], async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if student is enrolled
    if (!meeting.students.includes(req.user._id)) {
      return res.status(400).json({ message: "Not enrolled in this meeting" });
    }

    meeting.students = meeting.students.filter(
      (studentId) => studentId.toString() !== req.user._id.toString()
    );
    await meeting.save();

    res.json({ message: "Successfully left the meeting" });
  } catch (error) {
    console.error("Leave meeting error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
