class Image extends Artifact {
    constructor(id, data) {
        super(id, ARTIFACT_IMAGE, data);
        this._content = data && data.content ? data.content : '';
        this._points = {};
        if (data && data.points) {
            for (var id in data.points) {
                this._points[id] = new Point(id, data.points[id]);
            }
        }
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

    addPoint(point) {
        this._points[point.id] = point;
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
    
    toJSON() {
        var object = super.toJSON();
        object['content'] = this._content;
        object['points'] = {};
        for (var id in this._points) {
            object['points'][id] = this._points[id].toJSON();
        }
        return object;
    }
}