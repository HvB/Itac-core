class ZP {
    constructor(id, url) {
        this._id = id;
        this._ZEs = {};
        this._background = null;
        this._artifacts = {};
        this._menu = new Menu(url);
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

    getArtifact(idArtifact) {
        return this._artifacts[idArtifact];
    }

    addArtifact(idArtifact, artifact) {
        this._artifacts[idArtifact] = artifact;
    }

    removeArtifact(idArtifact) {
        delete this._artifacts[idArtifact];
    }

    get menu() {
        return this._menu;
    }

    moveArtifactToZP(idZE, idArtifact) {
        if (this._ZEs[idZE]) {
            this._artifacts[idArtifact] = this._ZEs[idZE].getArtifact(idArtifact);
            this._ZEs[idZE].removeArtifact(this._artifacts[idArtifact]);
        }
    }

    moveArtifactToZE(idZE, idArtifact) {
        if (this._ZEs[idZE]) {
            this._ZEs[idZE].addArtifact(this._artifacts[idArtifact]);
            delete this._artifacts[idArtifact];
        }
    }

    moveArtifactToOtherZP(idZP, idArtifact) {
        if (this._menu.getOtherZP(idZP)) {
            //send idArtifact to idZP
            delete this._artifacts[idArtifact];
        }
    }
}