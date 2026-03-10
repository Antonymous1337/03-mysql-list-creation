const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const client = require("prom-client");

const app = express();
app.use(express.json());
app.use(cors());

// ----- Prometheus metrics setup -----
// Collect default Node.js and process metrics
client.collectDefaultMetrics();

// Custom metrics for this app
const httpRequestCounter = new client.Counter({
  name: "backend_http_requests_total",
  help: "Total number of HTTP requests handled by the backend",
  labelNames: ["method", "route", "status"]
});

const todoInsertCounter = new client.Counter({
  name: "backend_todo_inserts_total",
  help: "Total number of todos inserted into MySQL"
});

// Expose /metrics endpoint for Prometheus to scrape
app.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    console.error("Error collecting metrics:", err);
    res.status(500).end();
  }
});

// ----- App setup -----
const pool = mysql.createPool({
  host: "mysql-service",
  user: "root",
  password: "rootpassword",
  database: "appdb",
  waitForConnections: true,
  connectionLimit: 10
});

// create table if not exists
pool.query(
  `
    CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255)
    );
`,
  (err) => {
    if (err) {
      console.error("Error creating todos table:", err);
      return;
    }
    console.log("Todos table ensured");
  }
);

app.post("/api/add", (req, res) => {
  const { todoListTitle } = req.body;

  pool.query("INSERT INTO todos (title) VALUES (?)", [todoListTitle], (err) => {
    if (err) {
      httpRequestCounter.inc({ method: "POST", route: "/api/add", status: 500 });
      return res.status(500).send(err);
    }

    todoInsertCounter.inc();
    httpRequestCounter.inc({ method: "POST", route: "/api/add", status: 200 });
    res.send({ message: "Added Successfully" });
  });
});

app.listen(3000, () => {
  console.log("Backend running on port 3000");
});