class Point extends Artifact {
    constructor(id, data, parent) {
        super(id, ARTIFACT_POINT, data);
        this._linksTo = data && data.linksTo ? data.linksTo : {};
        this._parent = parent;
        this._status = "hidden";
    }

    hasLinkTo(linkTo) {
        return this._linksTo[linkTo] ? true : false;
    }

    addLinkTo(linkTo) {
        this._linksTo[linkTo] = linkTo;
        this.setChanged();
    }

    removeLinkTo(linkTo) {
        delete this._linksTo[linkTo];
        this.setChanged();
        this.notifyObservers("position")
    }

    get linksTo (){
        return this._linksTo;
    }

    get parent(){
        return this._parent;
    }

    delete(){
        if (this._parent) this._parent.removePoint(this.id)
        super.delete()
    }

    set visible(visible){
        if (visible) this._status = "newInZP";
        else  this._status = "hidden";
        this.setChanged();
        this.notifyObservers(this._status)
    }

    toJSON() {
        var object = super.toJSON();
        object['linksTo'] = this._linksTo;
        return object;
    }
}