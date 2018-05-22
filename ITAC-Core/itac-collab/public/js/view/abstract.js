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
class View {
    constructor(ZP, connection) {
        this._ZP = ZP;
        this._connection = connection;
        for (let i = 0; i < this._dropzone().length; i++) {
            interact(this._dropzone()[i].target).dropzone(this._dropzone()[i].option);
        }
        for (let i = 0; i < this._draggable().length; i++) {
            interact(this._draggable()[i].target).draggable(this._draggable()[i].option);
        }
        for (let i = 0; i < this._gesturable().length; i++) {
            interact(this._gesturable()[i].target).gesturable(this._gesturable()[i].option);
        }
        for (let i = 0; i < this._tap().length; i++) {
            interact(this._tap()[i].target).on('tap', this._tap()[i].action);
        }
        for (let i = 0; i < this._hold().length; i++) {
            interact(this._hold()[i].target).on('hold', this._hold()[i].action);
        }
        for (let i = 0; i < this._down().length; i++) {
            interact(this._down()[i].target).on('down', this._down()[i].action);
        }
    }

    _dropzone() {
        return [];
    }

    _draggable() {
        return [];
    }

    _gesturable() {
        return [];
    }

    _tap() {
        return [];
    }

    _hold() {
        return [];
    }

    _down() {
        return [];
    }

    static createLine(temporary, id1, x1, y1, id2, x2, y2, type="annotation") {
        let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        if (id1) line.setAttributeNS(null, 'data-from', id1);
        line.setAttributeNS(null, 'x1', x1);
        line.setAttributeNS(null, 'y1', y1);
        if (id2) line.setAttributeNS(null, 'data-to', id2);
        line.setAttributeNS(null, 'x2', x2);
        line.setAttributeNS(null, 'y2', y2);
        if (type) {
            line.setAttributeNS(null, 'class', (type ? type : ''));
        }
        if (temporary) {
            line.setAttributeNS(null, 'class', 'temporary ' + (type ? type : ''));
        } else {
            line.setAttributeNS(null, 'style', 'display:none;');
        }
        $('svg').append(line);
        return line;
    }
}