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
class ZE {
    constructor(id, angle) {
        this._id = id;
        this._x = 0;
        this._y = 0;
        this._scale = 1;
        this._angle = angle;
        this._artifacts = {};
        this._tool = new Tool(this);
    }

    get id() {
        return this._id;
    }

    get x() {
        return this._x;
    }

    set x(x) {
        this._x = x;
    }

    get y() {
        return this._y;
    }

    set y(y) {
        this._y = y;
    }

    get scale() {
        return this._scale;
    }

    set scale(scale) {
        this._scale = scale;
    }

    get angle() {
        return this._angle;
    }

    set angle(angle) {
        this._angle = angle;
    }

    hasArtifact(idArtifact) {
        return this._artifacts[idArtifact] ? true : false;
    }

    addArtifact(idArtifact) {
        this._artifacts[idArtifact] = idArtifact;
    }

    removeArtifact(idArtifact) {
        delete this._artifacts[idArtifact];
    }

    get tool() {
        return this._tool;
    }
}