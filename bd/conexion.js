
require('dotenv').config();

class ConectarBD2 {
    constructor() {
        this.conexion = null;
        this.mysql = require("mysql2/promise");
    }
    async conectarMysql() {
        try {
            this.conexion = await this.mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: 'root'
            });
            console.log("conexion a la 2da Base de datos");
        } catch (error) {
            console.error("Error al crear la conexion " + error);
        }
    }
    async cerrarConexion() {
        if (this.conexion != null) {
            try {
                await this.conexion.end();
                console.log("Segunda conexión cerrada");
            } catch (error) {
                console.error("Error al cerar conexion " + error);
            }
        }
    }

}
module.exports = ConectarBD2;