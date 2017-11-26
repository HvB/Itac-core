class Tool {
    constructor(ZE) {
        this._opened = false;
        let p = new Point();
        this._point = p;
        this._ZE = ZE;
        if (ZE) this._point.ZE = ZE.id;
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
        if (this._ZE) this._point.ZE = this._ZE.id;
    }
}