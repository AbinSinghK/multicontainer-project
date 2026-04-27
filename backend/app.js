const express = require("express");
const { Pool } = require("pg");

const app = express();
const pool = new Pool({
  user: "postgres",
  host: "db",
  database: "mydb",
  password: "postgres",
  port: 5432,
});

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.json({ time: result.rows[0] });
});

app.listen(5000, () => console.log("Backend running on 5000"));