import pool from "../config/db.js";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads");
    console.log("Uploaded file:", req.file);
 // create this folder if not exists
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
    console.log("Uploaded file:", req.file);

  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".doc", ".docx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF, DOC, DOCX files allowed"));
    console.log("Uploaded file:", req.file);

  },
});

// Controller function
export const addCareerApplication = async (req, res) => {
  try {
    const {
      fullname,
      email,
      phone,
      field,
      linkedin,
      github,
      skills,
      message,
    } = req.body;

    const resumePath = req.file ? `/uploads/resumes/${req.file.filename}` : null;

    // Simple validation
    if (!fullname || !email || !phone || !field) {
      return res
        .status(400)
        .json({ success: false, error: "Missing required fields." });
    }

    const sql = `
      INSERT INTO career_applications 
      (fullname, email, phone, field, linkedin, github, skills, message, resume_path)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      fullname,
      email,
      phone,
      field,
      linkedin || null,
      github || null,
      skills || null,
      message || null,
      resumePath,
    ];

    await pool.query(sql, values);

    res.status(200).json({ success: true, message: "Application submitted successfully!" });
  } catch (error) {
    console.error("Error saving career application:", error);
    res.status(500).json({ success: false, error: "Server error. Try again later." });
  }
};
