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

// PostgreSQL connection
const pool = new Pool({
  user: "postgres",
  host: "db",
  database: "mydb",
  password: "postgres",
  port: 5432,
});

// Your existing route
app.get("/", async (req, res) => {
  httpRequestCounter.inc(); // increase count

  const result = await pool.query("SELECT NOW()");
  res.json({ time: result.rows[0].now });
});

// 🔥 Prometheus metrics endpoint (VERY IMPORTANT)
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

app.listen(5000, () => console.log("Backend running on 5000"));