require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { body, validationResult } = require("express-validator");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const dataDir = "./data";
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const db = new sqlite3.Database("./data/bookings.sqlite");

db.run(`CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  fullName TEXT,
  email TEXT,
  phone TEXT,
  checkIn TEXT,
  checkOut TEXT,
  adults INTEGER,
  children INTEGER
);`);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.send({ status: "Running" });
});

app.post("/api/bookings",
  [
    body("fullName").notEmpty(),
    body("email").isEmail(),
    body("phone").notEmpty(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { fullName, email, phone, checkIn, checkOut, adults, children } = req.body;

    db.run(
      `INSERT INTO bookings (fullName, email, phone, checkIn, checkOut, adults, children)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [fullName, email, phone, checkIn, checkOut, adults, children],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ message: "Booking saved", bookingId: this.lastID });
      }
    );
  }
);

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));