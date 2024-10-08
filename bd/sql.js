const ConectarBD2 = require("./conexion");

async function mostrarBasesDeDatos() {
    const db = new ConectarBD2;
    await db.conectarMysql();
    const sql = 'SHOW DATABASES';
    const [rows] = await db.conexion.query(sql);
    await db.cerrarConexion();
    return rows;
}

async function crearBaseDeDatos(nombreBD) {
    const db = new ConectarBD2();
    await db.conectarMysql();
    const sql = `CREATE DATABASE IF NOT EXISTS ${nombreBD}`;
    await db.conexion.query(sql);
    await db.cerrarConexion();
}

async function usarBaseDeDatos(nombreBD) {
    const db = new ConectarBD2();
    await db.conectarMysql();
    const sql = `USE ${nombreBD}`;
    await db.conexion.query(sql);
    return db;
}

async function mostrarTablas(nombreBD) {
    const db = await usarBaseDeDatos(nombreBD);
    const sql = 'SHOW TABLES';
    const [rows] = await db.conexion.query(sql);
    await db.cerrarConexion();
    return rows.map(row => Object.values(row)[0]);
}

async function eliminarBaseDeDatos(nombreBD) {
    const db = new ConectarBD2();
    await db.conectarMysql();
    const sql = `DROP DATABASE ${nombreBD}`;
    await db.conexion.query(sql);
    await db.cerrarConexion();
}

async function crearTabla(nombreBD, ntabla, columns) {
    const db = await usarBaseDeDatos(nombreBD);
    let sql = `CREATE TABLE ${ntabla} (`;

    columns.forEach((column, index) => {
        let cname = column.name;
        let ctipo = column.type;
        let primary = column.isPrimary === 'on';

        sql += `${cname} ${ctipo}`;
        if (primary) sql += ' PRIMARY KEY';
        if (index < columns.length - 1) sql += ', ';
    });

    sql += ');';
    await db.conexion.query(sql);
    const tablas = await mostrarTablas(nombreBD);
    await db.cerrarConexion();
    return tablas;
}

async function eliminarTabla(nombreBD, nTB) {
    const db = await usarBaseDeDatos(nombreBD);
    const sql = `DROP TABLE ${nTB}`;
    await db.conexion.query(sql);
    const tablas = await mostrarTablas(nombreBD);
    await db.cerrarConexion();
    return tablas;
}

async function actualizarTabla(nombreBD, nombreTabla, columnas) {
    const db = await usarBaseDeDatos(nombreBD);

    const primaryKeys = columnas.filter(column => column.isPrimary === 'on');
    const primaryKeyNames = primaryKeys.map(pk => pk.name);

    for (let column of columnas) {
        const { name, oldName, type, isPrimary } = column;
        
        const sql = `ALTER TABLE ${nombreTabla} CHANGE ${oldName} ${name} ${type}`;

        try {
            await db.conexion.query(sql);
        } catch (error) {
            console.error(`Error al modificar la columna ${oldName} a ${name}:`, error);
            continue; 
        }
    }
    try {
        await db.conexion.query(`ALTER TABLE ${nombreTabla} DROP PRIMARY KEY`);
    } catch (error) {
        if (error.code !== 'ER_DROP_INDEX_FK') {
            console.error(`Error al eliminar la clave primaria existente:`, error);
        }
    }

   
    if (primaryKeys.length > 0) {
        const sqlPrimaryKey = `ALTER TABLE ${nombreTabla} ADD PRIMARY KEY (${primaryKeyNames.join(', ')})`;
        try {
            await db.conexion.query(sqlPrimaryKey);
        } catch (error) {
            console.error(`Error al agregar clave primaria:`, error);
        }
    }

    await db.cerrarConexion(); 
}

async function obtenerColumnas(nombreBD, nombreTabla) {
    const db = await usarBaseDeDatos(nombreBD);
    const sql = `SHOW COLUMNS FROM ${nombreTabla}`;
    const [rows] = await db.conexion.query(sql);
    await db.cerrarConexion();

    return rows.map(row => ({
        name: row.Field,
        type: row.Type,
        isPrimary: row.Key === 'PRI'
    }));
}

async function ObtenerFilas(nombreBD, nombreTabla, id) {
    const db = await usarBaseDeDatos(nombreBD);
    let sql = `SELECT * FROM ${nombreTabla}`;
    if (id) {
        sql += ` WHERE id = ${id}`;
    }
    const [rows] = await db.conexion.query(sql);
    await db.cerrarConexion();
    return rows;
}



async function insertarFila(nombreBD, nombreTabla, columnas) {
        const db = await usarBaseDeDatos(nombreBD);
        let keys = Object.keys(columnas).join(', ');
        let values = Object.values(columnas).map(value => `'${value}'`).join(', ');
        const sql = `INSERT INTO ${nombreTabla} (${keys}) VALUES (${values})`;
        await db.conexion.query(sql);
        await db.cerrarConexion();
    }



async function obtenerFilaPorId(nombreBD, nombreTabla, id) {
    const db = await usarBaseDeDatos(nombreBD);
    const sql = `SELECT * FROM ${nombreTabla} WHERE id = ?`; 
    const [rows] = await db.conexion.query(sql, [id]);
    await db.cerrarConexion();
    return rows[0]; 
}

async function modificarFila(nombreBD, nombreTabla, id, columnas) {
    const db = await usarBaseDeDatos(nombreBD);

    let sql = `UPDATE ${nombreTabla} SET `;
    const valores = [];

    for (const [key, value] of Object.entries(columnas)) {
        sql += `${key} = ?, `;
        valores.push(value);
    }

    sql = sql.slice(0, -2); 
    sql += ` WHERE id = ?`;
    valores.push(id);

    await db.conexion.query(sql, valores);
    await db.cerrarConexion();
}

async function actualizarFila(nombreBD, nombreTabla, id, actualizaciones) {
    const db = await usarBaseDeDatos(nombreBD);

    let updates = Object.keys(actualizaciones).map(key => `${key} = '${actualizaciones[key]}'`).join(', ');
    const sql = `UPDATE ${nombreTabla} SET ${updates} WHERE id = '${id}'`; 

    await db.conexion.query(sql);
    await db.cerrarConexion();
}




async function eliminarFila(nombreBD, nombreTabla, id) {
    const db = await usarBaseDeDatos(nombreBD);
    const sql = `DELETE FROM ${nombreTabla} WHERE id = ${id}`;
    await db.conexion.query(sql, [id]);
    const filas = await ObtenerFilas(nombreBD, nombreTabla);
    await db.cerrarConexion();
    return filas;
}




module.exports = {
    actualizarFila,
    obtenerFilaPorId,
    modificarFila,
    eliminarFila,
    insertarFila,
    ObtenerFilas,
    mostrarBasesDeDatos,
    crearBaseDeDatos,
    mostrarTablas,
    eliminarBaseDeDatos,
    crearTabla,
    eliminarTabla,
    actualizarTabla,
    obtenerColumnas
};
