const mysql = require('mysql');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: 'localhost',
    database: 'pwl',
    user: 'root',
    password: '',
});

// Lakukan koneksi
db.connect((err) => {
    if (err) {
        return;
    }
    console.log('Connected to database');

    const data = {
        id: '2272039',
        nama: 'Nathan Raphael',
        email: '2272039@maranatha.ac.id',
        password: bcrypt.hashSync('322312'),
        role: 'admin'
    };

    const query = 'INSERT INTO user SET ?';

    db.query(query, data, (err, result) => {
        if (err) {
            return;
        }
        console.log('INSERT DATA SUCCESS');
        db.end();
    });
});