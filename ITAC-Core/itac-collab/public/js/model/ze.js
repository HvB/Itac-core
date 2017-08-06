class ZE {
    constructor(id, angle) {
        this._id = id;
        this._x = 0;
        this._y = 0;
        this._scale = 1;
        this._angle = angle;
        this._artifacts = {};
        this._toolOpened = false;
    }

    get id() {
        return this._id;
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

    hasArtifact(idArtifact) {
        return this._artifacts[idArtifact] ? true : false;
    }

    addArtifact(idArtifact) {
        this._artifacts[idArtifact] = idArtifact;
    }

    removeArtifact(idArtifact) {
        delete this._artifacts[idArtifact];
    }

    get toolOpened() {
        return this._toolOpened;
    }

    set toolOpened(toolOpened) {
        this._toolOpened = toolOpened;
    }
}