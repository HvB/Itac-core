/**
 * Gestion du modèle du menu
 */
class Menu {
    /**
     * Crée le modèle du menu
     * @param url lien pour la génération du QRCode
     */
    constructor(url) {
        this._url = url;
        this._x = 0;
        this._y = 0;
        this._otherZPs = {};
    }

    get url() {
        return this._url;
    }

    get x() {
        return this._x;
    }

    set x(x) {
        this._x = x;
    }

    get y() {
        return this._y;
    }

    set y(y) {
        this._y = y;
    }

    get otherZPs() {
        return this._otherZPs;
    }

    getOtherZP(idOtherZP) {
        return this._otherZPs[idOtherZP];
    }

    addOtherZP(idOtherZP, otherZP) {
        this._otherZPs[idOtherZP] = otherZP;
    }

    removeOtherZP(idOtherZP) {
        delete this._otherZPs[idOtherZP];
    }
}