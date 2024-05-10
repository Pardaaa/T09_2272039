const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express()

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('login');
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

    const sqlUserNames = 'SELECT nama FROM user';
    db.query(sqlUserNames, (err, results) => {
        if (err) throw err;

        const userNames = results.map(user => user.nama);

        app.locals.userNames = userNames;
    });


    // User
    app.get("/user", (req, res) => {
        const sqlUser = 'SELECT * FROM user'
        db.query(sqlUser, (err, result) => {
            if (err) throw err;
            const users = result;
            res.render('user/index', { users: users });
        })
    })

    // Tambah Data User
    app.get("/createUser", (req, res) => {
        res.render('user/createUser');
    });

    // Tambah Data User
    app.post('/addUser', (req, res) => {
        const { id, nama, email, password, role } = req.body;

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err);
                res.status(500).send('Internal Server Error');
                return;
            }

            const insertUser = `INSERT INTO user (id, nama, email, password, role) VALUES (?, ?, ?, ?, ?)`;
            db.query(insertUser, [id, nama, email, hashedPassword, role], (err, result) => {
                if (err) {
                    console.error('Error adding user:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }
                res.redirect('/user');
            });
        });
    });

    // Penduduk
    app.get("/Citizen", (req, res) => {
        const sqlCitizen = 'SELECT * FROM penduduk'
        db.query(sqlCitizen, (err, result) => {
            if (err) throw err;
            const penduduk = result;
            res.render('penduduk/index', { penduduk: penduduk });
        })
    });

    // Tambah Data Penduduk
    app.get("/createCitizen", (req, res) => {
        res.render('penduduk/createCitizen');
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

    // KK
    app.get("/keluarga", (req, res) => {
        const sqlKK = 'SELECT * FROM kartuKeluarga'
        db.query(sqlKK, (err, result) => {
            if (err) throw err;
            const kartuKeluarga = result;
            res.render('kk/index', { kartuKeluarga: kartuKeluarga });
        })
    });

    // Tambah Data Kartu Keluarga
    app.get("/createKeluarga", (req, res) => {
        res.render('kk/createKK');
    });

    // Tambah Data Kartu Keluarga
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

