const express = require('express');
const dotenv = require('dotenv');
const path = require("path");
const cookieParser = require('cookie-parser');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const rutas = require('./routes/rutas');

// Cargar las variables de entorno desde el archivo .env
dotenv.config({ path: './env/.env' });
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use("/index", express.static(path.join(__dirname,"/web")));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/', rutas);

//para eliminar el cache y que no se pueda volver con el boton de back luego de que hacemos un LOGOUT
app.use(function(req, res, next) {
    if (!req.user) {
        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    }
    next(); // Asegúrate de que next() se llame aquí para continuar con la siguiente operación
});

const port=process.env.PORT || 3000;
// Iniciar el servidor
app.listen(port,()=>{
    console.log("Sitio en http://localhost:"+port);
});