import pool from "../config/db.js";

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: "Email is required",
      });
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `
      INSERT INTO otp_verification (email, otp, otp_expiry)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
      otp = VALUES(otp),
      otp_expiry = VALUES(otp_expiry)
      `,
      [email.toLowerCase(), otp, expiry]
    );

    // Development Only
    return res.json({
      success: true,
      otp,
      message: "OTP Generated",
    });

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {

    const { email, otp } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM otp_verification WHERE email=?",
      [email.toLowerCase()]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "OTP not found",
      });
    }

    const data = rows[0];

    if (data.otp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > new Date(data.otp_expiry)) {
      return res.json({
        success: false,
        message: "OTP Expired",
      });
    }

    await pool.query(
      "DELETE FROM otp_verification WHERE email=?",
      [email.toLowerCase()]
    );

    return res.json({
      success: true,
      message: "OTP Verified",
    });

  } catch (err) {

    console.log(err);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
// ✅ Add User Query
export const addUserQuery = async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);

    let {
      fullname,
      email,
      contact,
      company,
      message,
      updates,
    } = req.body;

    // ==========================================
    // 1. Check basic data types
    // ==========================================

    if (
      typeof fullname !== "string" ||
      typeof email !== "string" ||
      typeof message !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data.",
      });
    }

    // ==========================================
    // 2. Trim input
    // ==========================================

    fullname = fullname.trim();
    email = email.trim().toLowerCase();
    message = message.trim();

    contact =
      typeof contact === "string"
        ? contact.trim()
        : "";

    company =
      typeof company === "string"
        ? company.trim()
        : "";

    // ==========================================
    // 3. Required fields
    // ==========================================

    if (!fullname || !email || !message) {
      return res.status(400).json({
        success: false,
        message:
          "Full name, email and message are required.",
      });
    }

    // ==========================================
    // 4. Full name validation
    // ==========================================

    if (fullname.length > 100) {
      return res.status(400).json({
        success: false,
        message:
          "Full name cannot exceed 100 characters.",
      });
    }

    if (!/^[A-Za-z\s]+$/.test(fullname)) {
      return res.status(400).json({
        success: false,
        message:
          "Full name should contain only letters.",
      });
    }

    // ==========================================
    // 5. Email validation
    // ==========================================

    if (email.length > 254) {
      return res.status(400).json({
        success: false,
        message:
          "Email address is too long.",
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message:
          "Please enter a valid email address.",
      });
    }

    // ==========================================
    // 6. Phone validation
    // Phone is OPTIONAL
    // ==========================================

    if (
      contact &&
      !/^[0-9]{10}$/.test(contact)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Contact number must contain exactly 10 digits.",
      });
    }

    // ==========================================
    // 7. Company validation
    // Company is OPTIONAL
    // ==========================================

    if (company.length > 150) {
      return res.status(400).json({
        success: false,
        message:
          "Company name cannot exceed 150 characters.",
      });
    }

    // ==========================================
    // 8. Message validation
    // ==========================================

    if (message.length > 2000) {
      return res.status(400).json({
        success: false,
        message:
          "Message cannot exceed 2000 characters.",
      });
    }

    // ==========================================
    

    // ==========================================
    // 11. Insert into database
    // ==========================================

    const sql = `
      INSERT INTO userquery
      (
        fullname,
        email,
        contact,
        company,
        message,
        updates
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [
      fullname,
      email,
      contact || null,
      company || null,
      message,
      updates ? 1 : 0,
    ]);

    // ==========================================
    // 12. Success response
    // ==========================================

    return res.status(200).json({
      success: true,
      message:
        "Query submitted successfully!",
    });
  } catch (error) {
    console.error(
      "USER QUERY ADD ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while saving query.",
    });
  }
};


// ✅ Fetch All Queries
export const getAllQueries = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM userquery ORDER BY id DESC"
    );

    return res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(
      "FETCH QUERY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
