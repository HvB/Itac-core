class ZP {
    constructor(id) {
        this._id = id;
        this._ZEs = {};
        this._background = null;
        this._artifacts = {};
        this._otherZPs = {};
    }

    get id() {
        return this._id;
    }

    getZE(id) {
        return this._ZEs[id];
    }

    countZE() {
        return this._ZEs.length;
    }

    addZE(ZE) {
        this._ZEs[ZE.id()] = ZE;
    }

    removeZE(ZE) {
        delete this._ZEs[ZE.id()];
    }

    get background() {
        return this._background;
    }

    set background(background) {
        this._background = background;
    }

    getArtifact(id) {
        return this._artifacts[id];
    }

    addArtifact(artifact) {
        this._artifacts[artifact.id()] = artifact;
    }

    removeArtifact(artifact) {
        delete this._artifacts[artifact.id()];
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
        if (this._otherZPs[idZP]) {
            //send idArtifact to idZP
            delete this._artifacts[idArtifact];
        }
    }
}