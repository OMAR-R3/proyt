const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')
const ConectarBD = require('../bd/db'); // Importa la clase ConectarBD
const { promisify } = require('util');


exports.register = async (req, res) => {
    let conexionDB; // Declarar conexionDB antes del bloque try-catch
    try {
        const name = req.body.name;
        const user = req.body.user;
        const rol = req.body.rol;
        const pass = req.body.pass;

        // Validar que se proporcionaron todos los datos necesarios
        if (!name || !user || !rol || !pass) {
            return res.render('register', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Todos los campos son requeridos",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false
            });
        }

        // Crear una instancia de la clase ConectarBD
        conexionDB = new ConectarBD();
        await conexionDB.conectarMysql(); // Conectar a la base de datos

        // Verificar si el usuario ya existe
        const [existingUser] = await conexionDB.conexion.query('SELECT * FROM users WHERE user = ?', [user]);

        if (existingUser.length > 0) {
            await conexionDB.cerrarConexion(); // Cerrar la conexión en caso de usuario existente
            return res.render('register', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "El nombre de usuario ya está registrado",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false
            });
        }

        // Si el usuario no existe, proceder a registrar el nuevo usuario
        let passHash = await bcryptjs.hash(pass, 8);
        await conexionDB.conexion.query('INSERT INTO users SET ?', { user: user, name: name, rol: rol, pass: passHash });

        await conexionDB.cerrarConexion(); // Cerrar la conexión después de la inserción
        return res.redirect('/');  // Redirige al usuario a la página principal después del registro exitoso
    } catch (error) {
        console.log(error);
        if (conexionDB) { // Verifica si conexionDB está definida antes de intentar cerrarla
            await conexionDB.cerrarConexion(); // Cerrar la conexión en caso de error
        }
        return res.status(500).send('Error interno del servidor'); // Se envía la respuesta en caso de error y retorna
    }
};


exports.login = async (req, res) => {
    let conexionDB; // Declarar conexionDB antes del bloque try-catch
    try {
        const user = req.body.user;
        const pass = req.body.pass;

        console.log("JWT_SECRETO:", process.env.JWT_SECRETO);

        if (!user || !pass) {
            return res.render('login', {
                alert: true,
                alertTitle: "Advertencia",
                alertMessage: "Ingrese un usuario y password",
                alertIcon: 'info',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        }

        // Crear una instancia de la clase ConectarBD
        conexionDB = new ConectarBD();
        await conexionDB.conectarMysql(); // Conectar a la base de datos

        // Ejecutar la consulta utilizando 'await'
        const [results] = await conexionDB.conexion.query('SELECT * FROM users WHERE user = ?', [user]);

        if (results.length === 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
            await conexionDB.cerrarConexion(); // Cerrar la conexión en caso de error
            return res.render('login', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Usuario y/o Password incorrectas",
                alertIcon: 'error',
                showConfirmButton: true,
                timer: false,
                ruta: 'login'
            });
        }

        // Iniciar sesión correctamente
        const id = results[0].id;
        const token = jwt.sign({ id: id }, process.env.JWT_SECRETO, {
            expiresIn: process.env.JWT_TIEMPO_EXPIRA
        });

        const cookiesOptions = {
            expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        res.cookie('jwt', token, cookiesOptions);
        await conexionDB.cerrarConexion(); // Cerrar la conexión antes de enviar la respuesta
        return res.render('login', {
            alert: true,
            alertTitle: "Conexion exitosa",
            alertMessage: "¡Login correcto!",
            alertIcon: 'success',
            showConfirmButton: false,
            timer: 800,
            ruta: ''
        });

    } catch (error) {
        console.log(error);
        // Evitar enviar múltiples respuestas
        if (conexionDB) { // Verifica si conexionDB está definida antes de intentar cerrarla
            await conexionDB.cerrarConexion(); // Cerrar la conexión en caso de error
        }
        return res.status(500).send('Error interno del servidor');
    }
};
exports.isAuthenticated = async (req, res, next) => {
    let conexionDB; // Declarar conexionDB antes del bloque try-catch
    if (req.cookies.jwt) {  // Verifica si el token está presente en las cookies
        try {
            // Verifica y decodifica el token JWT
            const decodificada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRETO);

            // Crear una instancia de la clase ConectarBD y conectar a la base de datos
            conexionDB = new ConectarBD();
            await conexionDB.conectarMysql();

            // Ejecutar la consulta utilizando Promesas
            const [results] = await conexionDB.conexion.query('SELECT * FROM users WHERE id = ?', [decodificada.id]);

            if (!results.length) {
                await conexionDB.cerrarConexion(); // Cierra la conexión
                return res.redirect('/login');  // Asegura que se envía una respuesta y retorna
            }

            req.user = results[0]; // Asigna los resultados del usuario a req.user
            await conexionDB.cerrarConexion(); // Cierra la conexión a la base de datos
            return next();
        } catch (error) {
            console.log(error);
            if (conexionDB) { // Verifica si conexionDB está definida antes de intentar cerrarla
                await conexionDB.cerrarConexion(); // Cierra la conexión en caso de error
            }
            return res.redirect('/login'); // Respuesta en caso de error y retorna
        }
    } else {
        return res.redirect('/login'); // Se envía la respuesta y retorna
    }
};


exports.logout = async (req, res) => {
    res.clearCookie('jwt');
    return res.redirect('/');
};
