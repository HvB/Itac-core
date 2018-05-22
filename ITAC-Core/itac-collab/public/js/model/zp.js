/*
 *     Copyright © 2016-2018 AIP Primeca RAO
 *     Copyright © 2016-2018 Université Savoie Mont Blanc
 *     Copyright © 2017 David Wayntal
 *
 *     This file is part of ITAC-Core.
 *
 *     ITAC-Core is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
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

    //ToDo : supprimmer cette methode qui n'esr normalement plus utilisee
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