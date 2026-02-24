const express = require("express");
const mysql = require("mysql2"); // mysql2?
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const connection = mysql.createConnection({
    host: "mysql-service",
    user: "root",
    password: "rootpassword",
})

connection.connect(err => {
    if (err) {
        console.error("DB connection failed");
        return;
    }
    console.log("Connected to MySQL");
})

// create table if not exists
connection.query(`
    CREATE TABLE IF NOT EXISTS todos (
        id INT AUTO_INCREMENT PRIMARY KEY
        title VARCHAR(255)
    )    
`);

app.post("/add", (req, res) => {
    const { todoListTitle } = req.body;

    connection.query(
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