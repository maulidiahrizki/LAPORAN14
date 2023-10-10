let mysql = require('mysql'); // import library mysql

// membuat variable connection yang isinya konfigurasi dari koneksi database mysql
let connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'',
    database: 'db_01_express'
});

//membuat kondisi untuk melihat apakah koneksi berjalan atau tidak
connection.connect(function (error) {
    if(!!error) {
        console.log(error)
    }else{
        console.log('koneksi berhasil');
    }
})

//kita export module connection agar bisa digunakan di file lain
module.exports = connection;
