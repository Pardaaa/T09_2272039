const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express()

app.set('view engine', 'ejs');
app.use(express.static('public'));

//Penduduk
app.get("/penduduk", (req, res) => {
    res.render('penduduk/index');
});
app.get("/editPenduduk", (req, res) => {
    res.render('penduduk/editCitizen');
});
app.get("/createPenduduk", (req, res) => {
    res.render('penduduk/createCitizen');
});

//Kartu Keluarga
app.get("/keluarga", (req, res) => {
    res.render('kk/index');
});
app.get("/editKeluarga", (req, res) => {
    res.render('kk/editKK');
});
app.get("/createKeluarga", (req, res) => {
    res.render('kk/createKK');
});

app.listen(8000, () => {
    console.log("Running")
})

