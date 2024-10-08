class BaseDeDatosClase {
    constructor({ nombre }) {
        this.nombre = nombre;
    }

    set nombre(nombre) {
        const regexNombreBD = /^[a-zA-Z0-9_]+$/; 
        if (!nombre || !regexNombreBD.test(nombre)) {
            this._nombre = undefined;
        } else {
            this._nombre = nombre;
        }
    }

    get nombre() {
        return this._nombre;
    }

    get obtenerDatos() {
        return {
            nombre: this.nombre,
        };
    }
}

module.exports = BaseDeDatosClase;
