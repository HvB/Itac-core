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
/* ==========================================
 *  les zones de partage
 * ==========================================
 */
class LineView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
    }

    _draggable() {
        return [{
            target: 'line',
            option: {
                manualStart: true,
                onmove: function (event) {
                    var shape = event.target;
                    shape.setAttributeNS(null, 'x2', event.clientX+'px');
                    shape.setAttributeNS(null, 'y2', event.clientY+'px');
                },
                onend: function (event) {
                    console.log("line end");
                    let $shape = $(event.target);
                    setTimeout(()=>{ if ($shape.hasClass("temporary")) $shape.remove(); });
                }
            }
        }];
    }
}