class ZP {
    constructor(id) {
        this._id = id;
        this._x = 0;
        this._y = 0;
        this._scale = 1;
        this._angle = ANGLE_BOTTOM;
        this._orientation = ORIENTATION_BOTTOM;
        this._artifacts = {};
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
        switch (this._angle) {
            case ANGLE_TOP:
                this._orientation = ORIENTATION_TOP;
                break;
            case ANGLE_LEFT:
                this._orientation = ORIENTATION_LEFT;
                break;
            case ANGLE_BOTTOM:
                this._orientation = ORIENTATION_BOTTOM;
                break;
            case ANGLE_RIGHT:
                this._orientation = ORIENTATION_RIGHT;
        }
    }

    get orientation() {
        return this._orientation;
    }

    getArtifact(id) {
        return this._artifacts[id];
    }

    addArtifact(artifact) {
        this._artifacts[artifact.id()] = artifact;
    }

    removeArtifact(artifact) {
        delete this._artifacts[artifact.id()];
    }
}