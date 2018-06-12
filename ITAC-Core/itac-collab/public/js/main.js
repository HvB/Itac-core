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
var Z_INDEX = 1,
    MARGIN = 200,
    ANGLE_TOP = 180,
    ANGLE_LEFT = 90,
    ANGLE_BOTTOM = 0,
    ANGLE_RIGHT = 270,
    ARTIFACT_MESSAGE = 'message',
    ARTIFACT_IMAGE = 'image',
    ARTIFACT_POINT = 'point',
    ARTIFACT_LINK = 'link';

$.get(location.href + '/config.json', function (data) {
    if (jQuery.ui) {
        console.log('PAGE : connexionApp.ejs -> charge JQuery');
    } else {
        console.log('PAGE : connexionApp.ejs -> charge JQuery');
        console.log("PAGE : connexionApp.ejs : pas de chargement jQuery.ui");
    }

    console.log('PAGE : connexionApp.ejs -> on s occupe maintenant de la connexion');

    console.log('******************* PARAMETRE PASSE PAR LA REQUETE  ********************************');
    console.log('PAGE : workspace.ejs -> demande connection socket');

    var mZP = new ZP(data.configZP.idZP, window.location.hostname + ':' + data.configZP.portWebSocket);
    new ZPView(mZP, new Connection(mZP, data.event));
});