const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express()

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
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

    app.get('/', (req, res) => {
        res.render('login');
    });

    function requireLogin(req, res, next) {
        if (req.session && req.session.user) {
            next();
        } else {
            res.redirect('/');
        }
    }

    app.post('/login', (req, res) => {
        const { email, password } = req.body;

        const sql = 'SELECT * FROM user WHERE email = ?';
        db.query(sql, [email], (err, results) => {
            if (err) {
                return;
            }
            if (results.length > 0) {
                const user = results[0];

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        return;
                    }
                    if (isMatch) {
                        req.session.user = {
                            id: user.id,
                            nama: user.nama,
                            email: user.email,
                            role: user.role
                        };
                        res.redirect('/user');
                    } else {
                        res.status(401).send('Email atau Password Salah');
                    }
                });
            } else {
                res.status(401).send('Email atau Password Salah');
            }
        });
    });

    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                return;
            }
            res.redirect('/');
        });
    });

    const sqlUserNames = 'SELECT nama FROM user';
    db.query(sqlUserNames, (err, results) => {
        if (err) throw err;
        const userNames = results.map(user => user.nama);
        app.locals.userNames = userNames;
    });

    // User
    app.get("/user", requireLogin, (req, res) => {
        const sqlUser = 'SELECT * FROM user'
        db.query(sqlUser, (err, result) => {
            if (err) throw err;
            const users = result;
            res.render('user/index', { users: users });
        })
    })

    // Tambah Data User
    app.get("/createUser", requireLogin, (req, res) => {
        res.render('user/createUser');
    });

    // Tambah Data User
    app.post('/addUser', requireLogin, (req, res) => {
        const { id, nama, email, password, confirmPassword, role } = req.body;

        if (password !== confirmPassword) {
            return;
        }

        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) throw err

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
    app.get("/Citizen", requireLogin, (req, res) => {
        const sqlCitizen = 'SELECT * FROM penduduk'
        db.query(sqlCitizen, (err, result) => {
            if (err) throw err;
            const penduduk = result;
            res.render('penduduk/index', { penduduk: penduduk });
        })
    });

    // Tambah Data Penduduk
    app.get("/createCitizen", requireLogin, (req, res) => {
        const sqlKK = 'SELECT * FROM kartuKeluarga'
        db.query(sqlKK, (err, result) => {
            if (err) throw err;
            const kartuKeluarga = result;
            res.render('penduduk/createCitizen', { kartuKeluarga: kartuKeluarga });
        });
    });

    // Tambah data Penduduk
    app.post('/addCitizen', requireLogin, (req, res) => {
        const { nik, nama, alamat, tgl_lahir, gol_darah, agama, status, kartu_keluarga_id } = req.body;
        const insertCitizen = `INSERT INTO penduduk (nik, nama, alamat, tgl_lahir, gol_darah, agama, status, kartu_keluarga_id) VALUES ('${nik}', '${nama}', '${alamat}','${tgl_lahir}','${gol_darah}','${agama}','${status}', '${kartu_keluarga_id}')`;
        db.query(insertCitizen, (err, result) => {
            if (err) throw err;
            res.redirect('/Citizen');
        });
    });

    // KK
    app.get("/keluarga", requireLogin, (req, res) => {
        const sqlKK = 'SELECT * FROM kartuKeluarga'
        db.query(sqlKK, (err, result) => {
            if (err) throw err;
            const kartuKeluarga = result;
            res.render('kk/index', { kartuKeluarga: kartuKeluarga });
        })
    });

    // Tambah Data Kartu Keluarga
    app.get("/createKeluarga", requireLogin, (req, res) => {
        res.render('kk/createKK');
    });

    // Tambah Data Kartu Keluarga
    app.post('/addKK', requireLogin, (req, res) => {
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
    app.get('/editKeluarga/:id', requireLogin, (req, res) => {
        const kkId = req.params.id;
        const editKK = `SELECT * FROM kartuKeluarga WHERE id = ${kkId}`;
        db.query(editKK, (err, result) => {
            if (err) throw err;
            const kartuKeluarga = result[0];
            res.render('kk/editKK', { kartuKeluarga: kartuKeluarga, title: 'Edit Kartu Keluarga' });
        });
    });

    app.post('/editKeluarga/:id', requireLogin, (req, res) => {
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

