import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { username, usermobileno, useremail, password } = req.body;

    if (!username || !usermobileno || !useremail || !password) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (username, usermobileno, useremail, password) VALUES (?, ?, ?, ?)',
      [username, usermobileno, useremail, hashedPassword]
    );


const [duplicateMobile] = await pool.query(
`
SELECT user_id
FROM users
WHERE usermobileno=?
AND user_id!=?
`,
[usermobileno,id]
);

if(duplicateMobile.length>0){
   return res.json({
      success:false,
      message:"Mobile number already exists"
   });
}

const [rows] = await pool.query(
"SELECT * FROM users WHERE user_id=?",
[id]
);

res.json({
   success:true,
   message:"Profile Updated Successfully",
   user:rows[0]
});

    const token = jwt.sign(
      { user_id: result.insertId, useremail },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '1d' }
    );

    res.json({ message: 'Registered', user_id: result.insertId, token });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const { useremail, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE useremail = ?', [useremail]);

    if (rows.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { userid: user.user_id, useremail },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '1d' }
    );

    res.json({ message: 'Login successful', token,user_id: user.userid, username: user.username });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Generate 6 digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE useremail=?",
      [email]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "Email not found",
      });
    }

    const otp = generateOTP();

    const expiry = new Date(Date.now() + 10 * 60 * 1000); //10 min

    await pool.query(
      `UPDATE users
       SET reset_otp=?, reset_otp_expiry=?
       WHERE useremail=?`,
      [otp, expiry, email]
    );

    // Development only
    return res.json({
      success: true,
      otp,
      message: "OTP Generated",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM users WHERE useremail = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.json({
        success: false,
        message: "Email not found",
      });
    }

    const user = rows[0];

    // OTP Match
    if (user.reset_otp !== otp) {
      return res.json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // OTP Expiry Check
    if (new Date() > new Date(user.reset_otp_expiry)) {
      return res.json({
        success: false,
        message: "OTP Expired",
      });
    }

    return res.json({
      success: true,
      message: "OTP Verified Successfully",
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

export const resetPassword = async (req,res)=>{

   try{

      const {email,password}=req.body;

      const hashPassword=await bcrypt.hash(password,10);

      await pool.query(
      `UPDATE users
      SET password=?,
      reset_otp=NULL,
      reset_otp_expiry=NULL
      WHERE useremail=?`,
      [hashPassword,email]);

      return res.json({
         success:true,
         message:"Password Updated"
      });

   }catch(error){

      console.log(error);

      res.status(500).json({
         success:false,
         message:"Server Error"
      });

   }

}

export const getProfile = async (req, res) => {
  try {

    const { id } = req.params;

    const [rows] = await pool.query(
      `SELECT
        user_id,
        username,
        useremail,
        usermobileno,
        address,
        city,
        state,
        country,
        pincode,
        profile_image,
        created_at,
        updated_at
      FROM users
      WHERE user_id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      user: rows[0]
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }
};

export const updateProfile = async (req, res) => {

  try {

    const { id } = req.params;

    let {
      username,
      useremail,
      usermobileno,
      address,
      city,
      state,
      country,
      pincode
    } = req.body;

    username = username?.trim();
    useremail = useremail?.trim().toLowerCase();
    usermobileno = usermobileno?.trim();

    address = address?.trim() || null;
    city = city?.trim() || null;
    state = state?.trim() || null;
    country = country?.trim() || null;
    pincode = pincode?.trim() || null;

    if (!username || !useremail || !usermobileno) {
      return res.status(400).json({
        success: false,
        message: "Name, Email and Mobile are required"
      });
    }

    if (!/^[0-9]{10}$/.test(usermobileno)) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(useremail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email"
      });
    }

    if (pincode && !/^[0-9]{6}$/.test(pincode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode"
      });
    }

    const [duplicate] = await pool.query(
      `SELECT user_id
       FROM users
       WHERE useremail=?
       AND user_id!=?`,
      [useremail, id]
    );

    if (duplicate.length > 0) {
      return res.json({
        success: false,
        message: "Email already exists"
      });
    }

    await pool.query(
      `UPDATE users
       SET
       username=?,
       useremail=?,
       usermobileno=?,
       address=?,
       city=?,
       state=?,
       country=?,
       pincode=?,
       updated_at=NOW()
       WHERE user_id=?`,
      [
        username,
        useremail,
        usermobileno,
        address,
        city,
        state,
        country,
        pincode,
        id
      ]
    );

    return res.json({
      success: true,
      message: "Profile Updated Successfully"
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};