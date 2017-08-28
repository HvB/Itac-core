class Artifact {
    static new(id, data) {
        switch (data.type) {
            case ARTIFACT_MESSAGE:
                return new Message(id, data);
            case ARTIFACT_IMAGE:
                return new Image(id, data);
            case ARTIFACT_POINT:
                return new Point(id, data);
            case ARTIFACT_LINK:
                return new Link(id, data);
        }
    }

    constructor(id, type, data) {
        this._id = id ? id : guid();
        this._type = type;
        this._x = data && data.position && data.position.x ? data.position.x : 0;
        this._y = data && data.position && data.position.y ? data.position.y : 0;
        this._scale = data && data.position && data.position.scale ? data.position.scale : 1;
        this._angle = data && data.position && data.position.angle ? data.position.angle : 0;
        this._ZE = data && data.lastZE ? data.lastZE : null;
        this._creator = data && data.creator ? data.creator : null;
        this._dateCreation = data && data.dateCreation ? data.dateCreation : new Date().toISOString();
        this._history = data && data.history ? data.history : [];
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

    get creator() {
        return this._creator;
    }

    get dateCreation() {
        return this._dateCreation;
    }

    get history() {
        return this._history;
    }

    toJSON() {
        var object = {};
        object['id'] = this._id;
        object['type'] = this._type;
        object['position'] = {x: this._x, y: this._y, scale: this._scale, angle: this._angle};
        object['lastZE'] = this._ZE;
        object['creator'] = this._creator;
        object['dateCreation'] = this._dateCreation;
        object['history'] = this._history;
        return object;
    }
}