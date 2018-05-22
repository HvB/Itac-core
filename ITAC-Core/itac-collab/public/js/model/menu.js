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
/**
 * Gestion du modèle du menu
 */
class Menu {
    /**
     * Crée le modèle du menu
     * @param url lien pour la génération du QRCode
     */
    constructor(url) {
        this._url = url;
        this._x = 0;
        this._y = 0;
        this._angle = 0;
        this._otherZPs = {};
        this._opened = false;
    }

    get url() {
        return this._url;
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

    get angle() {
        return this._angle;
    }

    set angle(angle) {
        this._angle = angle;
    }

    get otherZPs() {
        return this._otherZPs;
    }

    getOtherZP(idOtherZP) {
        return this._otherZPs[idOtherZP];
    }

    addOtherZP(idOtherZP, otherZP) {
        this._otherZPs[idOtherZP] = otherZP;
    }

    removeOtherZP(idOtherZP) {
        delete this._otherZPs[idOtherZP];
    }

    get opened() {
        return this._opened;
    }

    set opened(opened) {
        this._opened = opened;
    }
}