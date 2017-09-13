class Point extends Artifact {
    constructor(id, data) {
        super(id, ARTIFACT_POINT, data);
        this._linksTo = data && data.linksTo ? data.linksTo : {};
    }

    hasLinkTo(linkTo) {
        return this._linksTo[linkTo] ? true : false;
    }

    addLinkTo(linkTo) {
        this._linksTo[linkTo] = linkTo;
    }

    removeLinkTo(linkTo) {
        delete this._linksTo[linkTo];
    }
    
    toJSON() {
        var object = super.toJSON();
        object['linksTo'] = this._linksTo;
        return object;
    }
}