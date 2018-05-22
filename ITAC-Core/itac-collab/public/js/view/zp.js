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
class ZPView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
        new MenuView(ZP, connection);
        new ZEView(ZP, connection);
        new ArtifactView(ZP, connection);
        new LineView(ZP, connection);
    }

    _dropzone() {
        return [{
            target: '.ZP',
            option: {
                accept: '.artifact.message, .artifact.image',
                overlap: 0.5,

                ondropactivate: function (event) {
                    $(event.target).addClass('drop-active');
                },

                ondragenter: function (event) {
                    // $(event.target).addClass('drop-target');
                    $(event.relatedTarget).addClass('can-drop');
                },

                ondragleave: function (event) {
                    // $(event.target).removeClass('drop-target');
                    $(event.relatedTarget).removeClass('can-drop');
                    // $(event.relatedTarget).addClass('artifact');
                },

                ondrop: function (event) {
                    $(event.relatedTarget).removeClass('can-drop');
                    // $(event.relatedTarget).addClass('artifact');
                },

                ondropdeactivate: function (event) {
                    $(event.target).removeClass('drop-active drop-target');
                }
            }
        }];
    }
}