import pool from "../config/db.js";

// ✅ Add Contact Message
export const addContactMessage = async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Basic validation
    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        error: "All fields are required.",
      });
    }

    const sql =
      "INSERT INTO contact_messages (name, email, phone, message) VALUES (?, ?, ?, ?)";
    const [result] = await pool.execute(sql, [name, email, phone, message]);

    if (result.affectedRows > 0) {
      res.status(200).json({ success: true, message: "Message saved successfully" });
    } else {
      res.status(500).json({ success: false, error: "Database insert failed" });
    }
  } catch (error) {
    console.error("Error in addContactMessage:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

// ✅ Get All Messages (optional - for admin dashboard)
export const getAllMessages = async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM contact_messages ORDER BY created_at DESC");
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error in getAllMessages:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};
