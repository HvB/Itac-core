class Image extends Artifact {
    constructor(id, data) {
        super(id, ARTIFACT_IMAGE, data);
        this._content = data && data.content ? data.content : '';
        this._points = data && data.points ? data.points : [];
        this._isBackground = false;
    }

    get content() {
        return this._content;
    }

    get points() {
        return this._points;
    }

    getPoint(idPoint) {
        return this._points[idPoint];
    }

    addPoint(idPoint, data) {
        this._points[idPoint] = new Point(idPoint, data);
    }

    removePoint(idPoint) {
        delete this._points[idPoint];
    }

    get isBackground() {
        return this._isBackground;
    }

    set background(isBackground) {
        this._isBackground = isBackground;
    }
}