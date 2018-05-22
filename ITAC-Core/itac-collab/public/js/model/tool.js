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
class Tool {
    constructor(ZE) {
        this._opened = false;
        let p = new Point();
        this._point = p;
        this._ZE = ZE;
        if (ZE) this._point.ZE = ZE.id;
    }

    get opened() {
        return this._opened;
    }

    toggle() {
        this._opened = !this._opened;
    }

    get point() {
        return this._point;
    }

    reset() {
        this._point = null;
    }

    reload() {
        let p = new Point();
        this._point = p;
        if (this._ZE) this._point.ZE = this._ZE.id;
    }
}