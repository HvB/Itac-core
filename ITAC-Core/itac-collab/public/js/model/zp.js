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
        if (this._background !== background) {
            let art1 = this.getArtifact(this._background);
            if (art1) art1.background = false;
            this._background = background;
            let art2 = this.getArtifact(this._background);
            if (art2) art2.background = true;
        }
    }

    get menu() {
        return this._menu;
    }

    getArtifact(idArtifact) {
        return this._artifacts[idArtifact];
    }

    addArtifactFromJson(idArtifact, data) {
        this._artifacts[idArtifact] = Artifact.new(idArtifact, data);
    }
    addArtifact(artifact){
        this._artifacts[artifact.id] = artifact;
    }
    removeArtifact(idArtifact) {
        delete this._artifacts[idArtifact];
    }
}