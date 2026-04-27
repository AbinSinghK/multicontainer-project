const express = require("express");
const { Pool } = require("pg");
const client = require("prom-client");

const app = express();

// 🔹 Prometheus: collect default metrics (CPU, memory, etc.)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

// 🔹 Custom metric (example: request counter)
const httpRequestCounter = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
});

// PostgreSQL connection (UNCHANGED)
const pool = new Pool({
  user: "postgres",
  host: "db",
  database: "mydb",
  password: "postgres",
  port: 5432,
});

// ✅ MAIN ROUTE (SAFE + FRONTEND FRIENDLY)
app.get("/", async (req, res) => {
  try {
    httpRequestCounter.inc(); // increase count

    const result = await pool.query("SELECT NOW()");

    const now = result.rows && result.rows[0] ? result.rows[0].now : null;

    res.status(200).json({
      time: now,
      status: "ok"
    });

  } catch (err) {
    res.status(500).json({
      error: "Database query failed",
      details: err.message,
      status: "error"
    });
  }
});

// 🔥 Prometheus metrics endpoint (UNCHANGED)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// ✅ IMPORTANT: Docker safe binding (UNCHANGED behavior)
app.listen(5000, "0.0.0.0", () =>
  console.log("Backend running on 5000")
);