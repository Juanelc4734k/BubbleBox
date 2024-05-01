const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
app.use(cors());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "bubblebox"
});

app.get('/users', (res, req) => {
    const sql = "SELECT * FROM usuarios";
    db.query(sql, (err, data) => {
        if(err) return res.json(err);
        return res.json(data);
    })
})

app.get('/', (re, res) => {
    return res.json("BackEnd Side");
});

app.listen(8081, () => {
    console.log("Puerto en escucha")
})