const express = require("express");
const mysql = require("mysql2"); // mysql2?
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const pool = mysql.createPool({
  host: "mysql-service",
  user: "root",
  password: "rootpassword",
  database: "appdb",
  waitForConnections: true,
  connectionLimit: 10
});

// create table if not exists
pool.query(`
    CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255)
    );
`, (err) => {
    if (err) {
        console.error("Error creating todos table:", err);
        return;
    }
    console.log("Todos table ensured");
});

app.post("/api/add", (req, res) => {
    const { todoListTitle } = req.body;

    pool.query(
        "INSERT INTO todos (title) VALUES (?)",
        [todoListTitle],
        (err) => {
            if (err) return res.status(500).send(err);
            res.send({ message: "Added Successfully" });
        }
    );
});

app.listen(3000, () => {
    console.log("Backend running on port 3000");
});