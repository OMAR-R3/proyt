class TablaClase {
    constructor({ nombre, columnas }) {
        this.nombre = nombre;
        this.columnas = columnas;
    }

    set nombre(nombre) {
        const regexNombreTabla = /^[a-zA-Z0-9_]+$/; // Validación para nombres de tablas
        if (!nombre || !regexNombreTabla.test(nombre)) {
            this._nombre = undefined;
        } else {
            this._nombre = nombre;
        }
    }

    get nombre() {
        return this._nombre;
    }

    set columnas(columnas) {
        if (!Array.isArray(columnas) || columnas.length === 0) {
            this._columnas = undefined;
        } else {
            this._columnas = columnas;
        }
    }

    get columnas() {
        return this._columnas;
    }

    get obtenerDatos() {
        return {
            nombre: this.nombre,
            columnas: this.columnas,
        };
    }
}

module.exports = TablaClase;