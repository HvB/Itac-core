class Tool {
    constructor() {
        this._opened = false;
        this._point = new Point();
    }

    get opened() {
        return this._opened;
    }

    toggle() {
        this._opened = !this._opened;
    }

    get point() {
        return this._point;
    }

    set point(point) {
        this._point = new Point();
    }
}