class Menu {
    constructor() {
        this._x = 0;
        this._y = 0;
        this._otherZPs = {};
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

    getOtherZP(id) {
        return this._otherZPs[id];
    }

    addOtherZP(otherZP) {
        this._otherZPs[otherZP.id()] = otherZP;
    }

    removeOtherZP(otherZP) {
        delete this._otherZPs[otherZP.id()];
    }
}