class Link extends Artifact {
    constructor(id, data) {
        super(id, ARTIFACT_LINK, data);
        this._title = data && data.title ? data.title : '';
        this._linksTo = data && data.linksTo ? data.linksTo : [];
        this._linksFrom = data && data.linksFrom ? data.linksFrom : [];
    }

    get title() {
        return this._title;
    }

    get linksTo() {
        return this._linksTo;
    }

    get linksFrom() {
        return this._linksFrom;
    }

    toJSON() {
        var object = super.toJSON();
        object['title'] = this._title;
        object['linksTo'] = this._linksTo;
        object['linksFrom'] = this._linksFrom;
        return object;
    }
}