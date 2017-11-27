class Tool {
    constructor() {
        this._opened = false;
        let p = new Point();
        this._point = p;
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

    reset() {
        this._point = null;
    }

    reload() {
        let p = new Point();
        this._point = p;
    }
}