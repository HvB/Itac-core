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

    // route middleware to validate :name
    router.param('idZC', function (req, res, next, idZC) {
        // do validation on name here
        // blah blah validation
        // log something so we know its working
        console.log('doing name validations on ' + idZC);

        // once validation is done save the new item in the req
        req.idZC = idZC;
        // go to the next thing
        next();
    });

    /*
     router.route( '/collab/:idZC/espacetravail/:idZP' )
     */
    router.route('/:idZC/espacetravail/:rang/:idZP/:port/:minmax')
        .get(function (req, res, next) {


            var idZC = req.params.idZC;
            var idZP = req.params.idZP;
            var port = req.params.port;
            var rang = req.params.rang;
            var minmax = req.params.minmax;

            var host = req.headers.host;
            var splithost = host.split(":");

            var url = "http://" + splithost[0] + ":" + port;

            var splitminmax = minmax.split("-");
            var min = splitminmax[0];
            var max = splitminmax[1];

            console.log('CLIENT workspace.js -> routage GET : reception de  idZC= ' + idZC + ' idZP= ' + idZP + ' port= ' + port + 'rang= ' + rang + ' --- host= ' + host);
            console.log('CLIENT workspace.js -> routage GET : calcul de l url = ' + url);

            res.render('workspace', {
                title: 'Itac_ZC_app',
                urldemande: url,
                myZP: idZP,
                rangZP: rang,
                NbZEMin: min,
                NbZEMax: max
            });
        });

    /*
     router.get('/hello/:name', function(req, res) {
     res.send('hello ' + req.name + '!');
     });
     */

    return router;
};


