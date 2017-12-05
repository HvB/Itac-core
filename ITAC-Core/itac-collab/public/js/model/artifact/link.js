class Link extends Artifact {
    constructor(id, data) {
        super(id, ARTIFACT_LINK, data);
        this._title = data && data.title ? data.title : '';
    }

    get title() {
        return this._title;
    }

    get linksFrom (){
        return this._data.linksFrom;
    }

    hasLinkFrom(linkFrom) {
        return (this._data.linksFrom && this._data.linksFrom[linkFrom]);
    }

    addLinkFrom(linkFrom) {
        let empty = (! this._data.linksFrom);
        if (empty) {
            this._data.linksFrom = {};
        }
        this._data.linksFrom[linkFrom] = linkFrom;
        this.setChanged();
        let event = new ArtifactPropertyListChangedEvent(this, "add", "linksFrom", linkFrom, linkFrom, empty);
        this.notifyObservers(event)  ;
    }

    removeLinkfrom(linksFrom) {
        if (this._data.linksTo) {
            delete this._data.linksTo[linksFrom];
            this.setChanged();
            let event = new ArtifactPropertyListChangedEvent(this, "remove", "linksFrom", linkFrom);
            this.notifyObservers(event)  ;
        }
    }

    toJSON() {
        var object = super.toJSON();
        object['title'] = this._title;
        return object;
    }
}