module.exports = function (router) {

    var ZoneCollaborative = require('../model/ZoneCollaborative');
    var Artifact = require('../model/Artifact');
    var ZonePartage = require('../model/ZonePartage');
    var ZoneEchange = require('../model/ZoneEchange');
    var Session = require('../model/Session');

    router.route('/session/:name')
        // .route('/session/:name/load')
        .get(function (req, res, next) {

            var name = req.params.name;
            var url = 'http://' + req.headers.host.split(":")[0];

            console.log('CLIENT session.js -> routage GET , session_name = ' + name);

            if (name) {
                console.log('CLIENT session.js -> routage GET,  lancement creation de la session \n');
                var session = Session.loadSession(name);

                console.log('CLIENT session.js -> routage GET,  lancement recureation de la ZC \n');
                var ZC = session.ZC;
            }


            res.render('collab', {title: 'Express', ipserver: url, zonecollab: session.context.zc.config});
        });

    return router;
};


