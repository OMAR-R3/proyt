require('dotenv').config();

class ConectarBD {
    constructor() {
        this.conexion = null;
        this.mysql = require("mysql2/promise");
    }
    async conectarMysql() {
        try {
            this.conexion = await this.mysql.createConnection({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASS,
                database: process.env.DB_DATABASE,
                port: process.env.DB_PORT
            });
            console.log("Conexion a la primera base de datos");
        } catch (error) {
            console.error("Error al crear la conexion " + error);
        }
    }
    async cerrarConexion() {
        if (this.conexion != null) {
            try {
                await this.conexion.end();
                console.log("Primera conexión cerrada");
            } catch (error) {
                console.error("Error al cerrar conexion " + error);
            }
        }
    }
}

module.exports = ConectarBD;
