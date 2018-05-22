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
module.exports = function (router) {

    var ZoneCollaborative = require('../model/ZoneCollaborative');
    var Artifact = require('../model/Artifact');
    var ZonePartage = require('../model/ZonePartage');
    var ZoneEchange = require('../model/ZoneEchange');


    router.route('/')
        // .route('/preconfig/:numconfig')
        .get(function (req, res, next) {

            var numconfig = req.params.numconfig;


            var host = req.headers.host;
            var splithost = host.split(":");
            var url = 'http://' + splithost[0];

            console.log('CLIENT collab.js -> routage GET , preconfig = ' + numconfig + ' avec URL=' + url);

            var paramZC = {};

            if (numconfig == 1) {

                var paramZC = {
                    "idZC": "444",
                    "emailZC": "",
                    "descriptionZC": "Zone de travail pré-configurer",
                    "nbZP": "2",
                    "ZP": [
                        {
                            "idZP": "Table",
                            "typeZP": "TableTactile",
                            "nbZEmin": "2",
                            "nbZEmax": "4",
                            "urlWebSocket": url,
                            "portWebSocket": "8080"
                        },
                        {
                            "idZP": "test2",
                            "typeZP": "Ecran",
                            "nbZEmin": "1",
                            "nbZEmax": "6",
                            "urlWebSocket": url,
                            "portWebSocket": "8081"
                        }
                    ]
                };
            }

            console.log('CLIENT collab.js -> routage GET,  lancement creation de la ZC \n');
            var ZC = new ZoneCollaborative(paramZC);


            res.render('collab', {title: 'Express', ipserver: url, zonecollab: paramZC});
        });


    return router;
};


