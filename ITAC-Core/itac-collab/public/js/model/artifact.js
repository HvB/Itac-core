class Artifact {
    constructor(id, type) {
        this._id = id;
        this._type = type;
        this._x = 0;
        this._y = 0;
        this._scale = 1;
        this._angle = 0;
        this._ZE = null;
    }

    get id() {
        return this._id;
    }

    get type() {
        return this._type;
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

    get scale() {
        return this._scale;
    }

    set scale(scale) {
        this._scale = scale;
    }

    get angle() {
        return this._angle;
    }

    set angle(angle) {
        this._angle = angle;
    }

    get ZE() {
        return this._ZE;
    }

    set ZE(ZE) {
        this._ZE = ZE;
    }
}