class Point extends Artifact {
    constructor(id, data, parent) {
        super(id, ARTIFACT_POINT, data);
        this._parent = parent;
        this._status = "hidden";
    }

    get parent(){
        return this._parent;
    }

    set parent(parent) {
        this._parent = parent;
    }

    delete(){
        if (this._parent) this._parent.removePoint(this.id);
        super.delete();
    }

    toJSON() {
        let object = super.toJSON();
        return object;
    }
}
