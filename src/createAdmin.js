import bcrypt from "bcryptjs";
import pool from "./db/db.js";
import "dotenv/config";

async function createAdmin() {
try {
const name = "Administrator";
const email = "admin@retail.local";
const password = "Belchior123";

const existingUser = await pool.query(
  "SELECT id FROM users WHERE email = $1",
  [email]
);

const passwordHash = await bcrypt.hash(password, 12);

if (existingUser.rows.length > 0) {
  await pool.query(
    `UPDATE users
     SET password_hash = $1
     WHERE email = $2`,
    [passwordHash, email]
  );

  console.log("Admin password updated successfully.");
  return;
}


await pool.query(
  `INSERT INTO users (name, email, password_hash, role)
   VALUES ($1, $2, $3, $4)`,
  [name, email, passwordHash, "admin"]
);

console.log("Admin account created successfully.");
console.log(`Email: ${email}`);
console.log("Use the password configured in createAdmin.js.");

} catch (error) {
console.error("Error creating admin:", error);
} finally {
await pool.end();
}
}

createAdmin();
