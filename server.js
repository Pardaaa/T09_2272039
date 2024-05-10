const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express()

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

//Penduduk

app.get("/editPenduduk", (req, res) => {
    res.render('penduduk/editCitizen');
});
app.get("/createPenduduk", (req, res) => {
    res.render('penduduk/createCitizen');
});

//Database Connect
const db = mysql.createConnection({
    host: 'localhost',
    database: 'pwl',
    user: 'root',
    password: '',
});

db.connect((err) => {
    if (err) throw err;
    console.log("Database Success")

    // Penduduk
    app.get("/Citizen", (req, res) => {
        const sqlCitizen = 'SELECT * FROM penduduk'
        db.query(sqlCitizen, (err, result) => {
            if (err) throw err;
            const penduduk = result;
            res.render('penduduk/index', { penduduk: penduduk });
        })
    });

    app.get("/createCitizen", (req, res) => {
        const sqlKK = 'SELECT id, kepalaKeluarga FROM kartuKeluarga';
        db.query(sqlKK, (err, result) => {
            if (err) throw err;
            const kartuKeluarga = result;
            res.render('penduduk/createCitizen', { kartuKeluarga: kartuKeluarga });
        });
    });

    // Tambah data Penduduk
    app.post('/addCitizen', (req, res) => {
        const { nik, nama, alamat, tgl_lahir, gol_darah, agama, status, kartu_keluarga_id } = req.body;
        const insertKK = `INSERT INTO penduduk (nik, nama, alamat, tgl_lahir, gol_darah, agama, status, kartu_keluarga_id) VALUES ('${nik}', '${nama}', '${alamat}','${tgl_lahir}','${gol_darah}','${agama}','${status}', '${kartu_keluarga_id}')`;
        db.query(insertKK, (err, result) => {
            if (err) throw err;
            res.redirect('/Citizen');
        });
    });

    app.get("/editCitizen", (req, res) => {
        res.render('penduduk/editCitizen');
    });

    // KK
    app.get("/keluarga", (req, res) => {
        const sqlKK = 'SELECT * FROM kartuKeluarga'
        db.query(sqlKK, (err, result) => {
            if (err) throw err;
            const kartuKeluarga = result;
            res.render('kk/index', { kartuKeluarga: kartuKeluarga });
        })
    });

    app.get("/createKeluarga", (req, res) => {
        res.render('kk/createKK');
    });

    // Tambah data Kartu Keluarga
    app.post('/addKK', (req, res) => {
        const { id, kepalaKeluarga } = req.body;
        const insertKK = `INSERT INTO kartuKeluarga (id, kepalaKeluarga) VALUES ('${id}', '${kepalaKeluarga}')`;
        db.query(insertKK, (err, result) => {
            if (err) throw err;
            res.redirect('/keluarga');
        });
    });

    // Hapus Kartu Keluarga
    app.post('/hapusKK/:id', (req, res) => {
        const kkId = req.params.id;
        const deleteKK = `DELETE FROM kartuKeluarga WHERE id = '${kkId}'`;
        db.query(deleteKK, (err, result) => {
            if (err) throw err;
            res.redirect('/keluarga');
        });
    });

    // Edit Kartu Keluarga
    app.get('/editKeluarga/:id', (req, res) => {
        const kkId = req.params.id;
        const editKK = `SELECT * FROM kartuKeluarga WHERE id = ${kkId}`;
        db.query(editKK, (err, result) => {
            if (err) throw err;
            const kartuKeluarga = result[0];
            res.render('kk/editKK', { kartuKeluarga: kartuKeluarga, title: 'Edit Kartu Keluarga' });
        });
    });

    app.post('/editKeluarga/:id', (req, res) => {
        const kkId = req.params.id;
        const { id, kepalaKeluarga } = req.body;
        const updateSql = `UPDATE kartuKeluarga SET id = '${id}', kepalaKeluarga = '${kepalaKeluarga}' WHERE id = ${kkId}`;
        db.query(updateSql, (err, result) => {
            if (err) throw err;
            res.redirect('/keluarga');
        });
    });
})

app.listen(8000, () => {
    console.log("Running")
})

