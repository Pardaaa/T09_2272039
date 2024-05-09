const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express()

app.listen(8000, () => {
    console.log("Running")
})