const express = require('express');
const router = express.Router();
//import express validator
const {body, validationResult} = require('express-validator');
//import database
const connection = require('../config/db');
const fs = require('fs')
const { json } = require('body-parser');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images')
    },
    filename: (req, file, cb) => {
        console.log(file)
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const fileFilter = (req, file, cb) => {
    //Mengecek jenis file yang diizinkan
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true); // ijinkan file
    }else {
        cb(new Error('Jenis file tidak diizinkan'), false);
    }
};
const upload= multer({storage: storage, fileFilter: fileFilter})




router.get('/', function(req, res){
    connection.query('select * from kendaraan order by id_pol desc', function(err, rows){
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Failed',
            })
        }else{
            return res.status(200).json({
                status:true,
                message: 'Data kendaraan',
                data: rows
            })
        }
    })
})

router.post('/store', upload.single("gambar_kendaraan"),[
    //validation
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty()
],(req, res) => {
    const error = validationResult(req);
    if(!error.isEmpty()){
        return res.status(422).json({
            error: error.array()
        });
    }
let Data = {
    nama_kendaraan: req.body.nama_kendaraan,
    id_transmisi: req.body.id_transmisi,
    gambar_kendaraan: req.file.filename
}
connection.query('insert into kendaraan set ?', Data, function(err, rows){
    if(err){
        return res.status(500).json({
            status: false,
            message: 'Server Error',
        })
    }else{
        return res.status(201).json({
            status:true,
            message: 'Succes..!',
            data: rows[0]
        })
    }
})
})

router.get('/:id', function (req, res) {
    connection.query('select a.nama_kendaraan, b.nama_transmisi as transmisi ' + 
    'from kendaraan a join transmisi b ' +
    'on b.id_j=a.id_transmisi order by a.id_pol desc', function (err, rows) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Failed'
            });
        }else {
            return res.status(200).json({
                status: true,
                message: 'Data kendaraan',
                data: rows[0]
            });
        }
    });
});

router.patch('/update/:id', upload.single("gambar_kendaraan"), [
    body('nama_kendaraan').notEmpty(),
    body('id_transmisi').notEmpty()
], (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(422).json({
            error: error.array()
        });
    }
    let id = req.params.id;
    // Lakukan pengecekan apakah ada file yang diunggah
    let gambar_kendaraan = req.file ? req.file.filename : null;

    connection.query(`select * from kendaraan where id_pol = ${id}`, function(err, rows) {
        if(err){
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }
        if(rows.length ===0){
            return res.status(404).json({
                status: false,
                message: 'Not Found',
            })
        }
        const nama_kendaraanFileLama = rows[0].gambar_kendaraan;

        // hapus file lama jika ada
        if (nama_kendaraanFileLama && gambar_kendaraan) {
            const pathFileLama = path.join(__dirname, '../public/images', nama_kendaraanFileLama);
            fs.unlinkSync(pathFileLama)
        }
        
            let Data = {
                nama_kendaraan: req.body.nama_kendaraan,
        
                id_transmisi: req.body.id_transmisi
            };
            connection.query(`UPDATE kendaraan SET ? WHERE id_pol = ${id}`, Data, function (err, rows) {
                if (err) {
                    return res.status(500).json({
                        status: false,
                        message: 'Server Error',
                    });
                } else {
                    return res.status(200).json({
                        status: true,
                        message: 'Update succes..!'
                    })
                }
            })
        })
    })


router.delete('/delete/:id', function(req, res){
    let id = req.params.id;

connection.query(`select * from kendaraan where id_pol = ${id}`, function (err, rows) {
    if(err){
        return res.status(500).json({
            status: false,
            message: 'Server Error',
        })
    }
    if(rows.length ===0){
        return res.status(404).json({
            status: false,
            message: 'Bad Request: ID parameter is missing',
        });
    }else{
        connection.query('DELETE FROM kendaraan WHERE id_pol = ?', [id], function(err, result) {
        if (err) {
            return res.status(500).json({
                status: false,
                message: 'Server Error',
            })
        }else{
            return res.status(200).json({
                status: true,
                message: 'Data has been delete !',
            })
        }
    })
}
})
});

module.exports = router;