class Point extends Artifact {
    constructor(id, data) {
        super(id, ARTIFACT_POINT, data);
        this._linksTo = data && data.linksTo ? data.linksTo : [];
    }

    get linksTo() {
        return this._linksTo;
    }
    
    toJSON() {
        var object = super.toJSON();
        object['linksTo'] = this._linksTo;
        return object;
    }
}