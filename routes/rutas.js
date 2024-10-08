const express = require('express');
const router = express.Router();
const ConectarBD = require('../bd/db');
const sql = require("../bd/sql");
const authController = require("../controllers/authController");

const conexionDB = new ConectarBD(); // Crea una instancia de la clase
router.get('/', authController.isAuthenticated, async (req, res) => {
    try {
        await conexionDB.conectarMysql(); // Asegúrate de que estás conectado a la base de datos
        const databases = await sql.mostrarBasesDeDatos(); // Obtenemos las bases de datos
        await conexionDB.cerrarConexion(); // Cerramos la conexión después de obtener los datos
        // Renderizamos la vista y pasamos las bases de datos y el usuario
        res.render('bases', { user: req.user, rol: req.rol, databases: databases, error: null });
    } catch (error) {
        // En caso de error, pasamos un arreglo vacío para evitar problemas en la vista
        res.render('bases', { user: req.user, databases: [], error: 'Error al mostrar las bases de datos' });
    }
});

router.get('/login', (req, res) => {
    res.render('login', { alert: false });
});

router.get('/register', authController.isAuthenticated, async (req, res) => {
    res.render('register');
});

// Rutas para los métodos de control
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/logout', authController.logout); // Cambiado para usar authController.logout

router.post('/crear', authController.isAuthenticated, async (req, res) => {
    let nombreBD = req.body.nombreBD;
    try {
        await sql.crearBaseDeDatos(nombreBD);
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
    }
});


router.post('/editarBD', authController.isAuthenticated, async (req, res) => {
    let nBD = req.body.nBD;
    try {
        const tables = await sql.mostrarTablas(nBD);
        res.render('editar', {user: req.user, rol: req.rol, nBD, tables, error: null });
    } catch (error) {
        res.render('editar', { nBD, tables: [], error: 'Error al mostrar las tablas' });
    }
});

router.post('/eliminarBD', authController.isAuthenticated, async (req, res) => {
    let nBD = req.body.nBD;
    try {
        await sql.eliminarBaseDeDatos(nBD);
        res.redirect('/');
    } catch (error) {
        res.redirect('/');
    }
});


router.post('/crearTabla', authController.isAuthenticated,async (req, res) => {
    let nBD = req.body.nBD;
    let ntabla = req.body.ntabla;
    let columns = req.body.columns;
    try {
        const tables = await sql.crearTabla(nBD, ntabla, columns);
        res.render('editar', { user: req.user, rol: req.rol, nBD, tables, error: null });
    } catch (error) {
        res.render('editar', { nBD, tables: [], error: 'Error al crear la tabla' });
    }
});

router.post('/eliminarTB', authController.isAuthenticated, async (req, res) => {
    let nBD = req.body.nBD;
    let nTB = req.body.nTB;
    try {
        const tables = await sql.eliminarTabla(nBD, nTB);
        res.render('editar', { user: req.user, rol: req.rol, nBD, tables, error: null });
    } catch (error) {
        res.render('editar', { nBD, tables: [], error: 'Error al borrar la tabla' });
    }
});


router.post('/actualizarTabla',authController.isAuthenticated, async (req, res) => {
    let nBD = req.body.nBD;
    let nTB = req.body.nTB;
    let columns = req.body.columns;

    console.log("Datos recibidos:", nBD, nTB, columns); // Agrega esta línea para depuración

    try {
        await sql.actualizarTabla(nBD, nTB, columns);
        const tables = await sql.mostrarTablas(nBD);
        res.render('editar', { user: req.user, rol: req.rol, nBD, tables, error: null });
    } catch (error) {
        console.error("Error al actualizar la tabla:", error); // Agrega esta línea para depuración
        res.render('editar', { nBD, tables: [], error: 'Error al actualizar la tabla' });
    }
});

router.post('/editarTB', authController.isAuthenticated, async (req, res) => {
    let nBD = req.body.nBD;
    let nTB = req.body.nTB;
    try {
        const columnas = await sql.obtenerColumnas(nBD, nTB);
        res.render('editarTabla', { user: req.user, rol: req.rol, nBD, nTB, columns: columnas, error: null });
    } catch (error) {
        res.render('editar', { nBD, tables: [], error: 'Error al cargar los detalles de la tabla' });
    }
});

router.post('/insersionTB', authController.isAuthenticated, async (req, res) => {
    let nBD = req.body.nBD;
    let nTB = req.body.nTB;
    try {
        const columnas = await sql.obtenerColumnas(nBD, nTB);
        const filas = await sql.ObtenerFilas(nBD, nTB);
        res.render('TablaMostrar', {user: req.user, rol: req.rol, nBD, nTB, columns: columnas, rows: filas, error: null });
    } catch (error) {
        console.error(error);
        res.render('TablaMostrar', { nBD, nTB, columns: [], rows: [], error: 'Error al cargar los detalles de la tabla' });
    }
});



router.get('/irinsert/:nBD/:nTB', authController.isAuthenticated, async (req, res) => {
    let nBD = req.params.nBD;
    let nTB = req.params.nTB;

    try {
        const columnas = await sql.obtenerColumnas(nBD, nTB);
        const filas= await sql.ObtenerFilas(nBD, nTB);
        res.render('TablaInsertar', {user: req.user, rol: req.rol,  nBD, nTB, columns: columnas,rows: filas, error: null });
    } catch (error) {
        console.error(error);
        res.render('TablaInsertar', { nBD, nTB, columns: [], error: 'Error al cargar los detalles de la tabla' });
    }
});

router.post('/insertarFila', authController.isAuthenticated, async (req, res) => {
    let nBD = req.body.nBD;
    let nTB = req.body.nTB;
    let columnas = req.body.columns;

    try {
        await sql.insertarFila(nBD, nTB, columnas);
        const columnasActualizadas = await sql.obtenerColumnas(nBD, nTB);
        const filasActualizadas = await sql.ObtenerFilas(nBD, nTB);
        res.render('TablaMostrar', {user: req.user, rol: req.rol,nBD, nTB, columns: columnasActualizadas, rows: filasActualizadas, error: null });
    } catch (error) {
        console.error(error);
        res.render('TablaMostrar', { nBD, nTB, columns: [], rows: [], error: 'Error al cargar los detalles de la tabla' });
    }
});


//Rutas para editar la columna

router.get('/modificarFila/:nBD/:nTB/:id', authController.isAuthenticated, async (req, res) => {
    let nBD = req.params.nBD;
    let nTB = req.params.nTB;
    let id = req.params.id;

    try {
        // Suponiendo que la columna primaria se llama 'primary_key'
        const fila = await sql.obtenerFilaPorId(nBD, nTB, id, 'primary_key');
        const columnas = await sql.obtenerColumnas(nBD, nTB);
        res.render('TablaModificar', { user: req.user, rol: req.rol, nBD, nTB, fila, columns: columnas, error: null });
    } catch (error) {
        console.error(error);
        res.render('TablaModificar', { nBD, nTB, fila: null, columns: [], error: 'Error al cargar los detalles de la fila' });
    }
});

// Ruta para procesar la edición
router.post('/modificarFila', authController.isAuthenticated, async (req, res) => {
    const nBD = req.body.nBD;
    const nTB = req.body.nTB;
    const id = req.body.id; // Asegúrate de que el nombre del campo de la columna primaria sea correcto
    const actualizaciones = req.body.columns;

    try {
        await sql.actualizarFila(nBD, nTB, id, actualizaciones);

        const columnasActualizadas = await sql.obtenerColumnas(nBD, nTB);
        const filasActualizadas = await sql.ObtenerFilas(nBD, nTB);

        res.render('TablaMostrar', { user: req.user, rol: req.rol, nBD, nTB, columns: columnasActualizadas, rows: filasActualizadas, error: null });
    } catch (error) {
        console.error(error);
        res.render('TablaMostrar', { nBD, nTB, columns: [], rows: [], error: 'Error al modificar el registro' });
    }
});


//**** */ Ruta para eliminar una fila
router.post('/eliminarFila', authController.isAuthenticated, async (req, res) => {
    let nBD = req.body.nBD;
    let nTB = req.body.nTB;
    let id = req.body.id;
    try {
        await sql.eliminarFila(nBD, nTB, id);
        const filas = await sql.ObtenerFilas(nBD, nTB);
        const columnas = await sql.obtenerColumnas(nBD, nTB);
        res.render('TablaMostrar', { user: req.user, rol: req.rol, nBD, nTB, columns: columnas, rows: filas, error: null });
    } catch (error) {
        console.error(error);
        res.render('TablaMostrar', { nBD, nTB, columns: [], rows: [], error: 'Error al eliminar la fila' });
    }
});



module.exports = router;