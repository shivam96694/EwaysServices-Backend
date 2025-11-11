import pool from "../config/db.js";

// ✅ Add User Query
export const addUserQuery = async (req, res) => {
  try {
      console.log("REQ.BODY:", req.body);
    const { fullname, email, contact, company, message, updates } = req.body;

    if (!fullname || !email || !contact || !message) {
      return res.status(400).json({
        success: false,
        message: "All required fields (name, email, contact, message) must be provided.",
      });
    }

    const sql = `
      INSERT INTO userquery (fullname, email, contact, company, message, updates)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await pool.query(sql, [
      fullname,
      email,
      contact,
      company || null,
      message,
      updates ? 1 : 0,
    ]);

    return res.status(200).json({
      success: true,
      message: "Query submitted successfully!",
    });
  } catch (error) {
    console.error("USER QUERY ADD ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while saving query.",
    });
  }
};

// ✅ Fetch All Queries (optional for admin panel)
export const getAllQueries = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM userquery ORDER BY id DESC");
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("FETCH QUERY ERROR:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
