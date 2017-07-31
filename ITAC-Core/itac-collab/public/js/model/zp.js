class ZP {
    constructor(id, url) {
        this._id = id;
        this._ZEs = {};
        this._background = null;
        this._menu = new Menu(url);
        this._artifacts = {};
    }

    get id() {
        return this._id;
    }

    getZE(idZE) {
        return this._ZEs[idZE];
    }

    countZE() {
        return this._ZEs.length;
    }

    addZE(idZE, angle) {
        this._ZEs[idZE] = new ZE(idZE, angle);
    }

    removeZE(idZE) {
        delete this._ZEs[idZE];
    }

    get background() {
        return this._background;
    }

    set background(background) {
        this._background = background;
    }

    get menu() {
        return this._menu;
    }

    getArtifact(idArtifact) {
        return this._artifacts[idArtifact];
    }

    addArtifact(idArtifact, data) {
        this._artifacts[idArtifact] = Artifact.new(idArtifact, data);
    }

    removeArtifact(idArtifact) {
        delete this._artifacts[idArtifact];
    }
}