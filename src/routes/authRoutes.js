import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db/db.js"
import jwt  from "jsonwebtoken"
import authenticateToken from "../middleware/authMiddleware.js";
const router = express.Router();



router.get("/me", authenticateToken, (req, res) => {
  res.status(200).json({
    authenticated: true,
    user: {
      id: req.user.id,
      role: req.user.role,
    },
  });
});
router.post("/login", async (req, res) => {
try {
const { identifier, password } = req.body;


if (!identifier || !password) {
  return res.status(400).json({
    message: "Username/email and password are required",
  });
}

const result = await pool.query(
  `SELECT id, name, email, password_hash, role, must_change_password
   FROM users
   WHERE LOWER(email) = LOWER($1)
   LIMIT 1`,
  [identifier.trim()]
);

if (result.rows.length === 0) {
  return res.status(401).json({
    message: "Invalid username/email or password",
  });
}

const user = result.rows[0];

const passwordMatches = await bcrypt.compare(
  password,
  user.password_hash
);

if (!passwordMatches) {
  return res.status(401).json({
    message: "Invalid username/email or password",
  });
}

const token = jwt.sign(
  {
    id: user.id,
    role: user.role,
  },
  process.env.JWT_SECRET,
  {
    expiresIn: "8h",
  },
);

return res.status(200).json({
  message: "Login successful",
  token,
 user: {
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  must_change_password: user.must_change_password,
},
});


} catch (error) {
console.error("Login error:", error);

return res.status(500).json({
  message: "Internal server error",
});


}
});


router.post("/change-password", authenticateToken, async (req, res) => {
try {
const { currentPassword, newPassword } = req.body;


if (!currentPassword || !newPassword) {
  return res.status(400).json({
    message: "Current password and new password are required",
  });
}

if (newPassword.length < 8) {
  return res.status(400).json({
    message: "New password must be at least 8 characters long",
  });
}

const result = await pool.query(
  `SELECT id, password_hash, must_change_password
   FROM users
   WHERE id = $1
   LIMIT 1`,
  [req.user.id],
);

if (result.rows.length === 0) {
  return res.status(404).json({
    message: "User not found",
  });
}

const user = result.rows[0];

const passwordMatches = await bcrypt.compare(
  currentPassword,
  user.password_hash,
);

if (!passwordMatches) {
  return res.status(401).json({
    message: "Current password is incorrect",
  });
}

const passwordHash = await bcrypt.hash(newPassword, 10);

await pool.query(
  `UPDATE users
   SET password_hash = $1,
       must_change_password = FALSE
   WHERE id = $2`,
  [passwordHash, req.user.id],
);

return res.status(200).json({
  message: "Password changed successfully",
});


} catch (error) {
console.error("Change password error:", error);

return res.status(500).json({
  message: "Internal server error",
});

}
});

export default router;
