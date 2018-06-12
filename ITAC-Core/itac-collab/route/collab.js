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


