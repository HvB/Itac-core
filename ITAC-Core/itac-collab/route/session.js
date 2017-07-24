module.exports = function (router) {

    const ZoneCollaborative = require('../model/ZoneCollaborative');
    const Artifact = require('../model/Artifact');
    const ZonePartage = require('../model/ZonePartage');
    const ZoneEchange = require('../model/ZoneEchange');
    const Session = require('../model/Session');
    const event = require('../constant').event;

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


            res.render('collab', {
                title: 'Express',
                ipserver: url,
                zonecollab: session.context.zc.config,
                sessionName: session.name
            });
        });
    router.route('/session/:name/save')
        .get(function (req, res, next) {
            var name = req.params.name;

            var host = req.headers.host;
            var splithost = host.split(":");
            var url = 'http://' + splithost[0];

            console.log('CLIENT session.js -> routage GET , session_name = ' + name);

            if (name) {
                console.log('CLIENT session.js -> routage GET,  recuperation de la session \n');
                let session = Session.getSession(name);
                if (session) {
                    console.log('CLIENT session.js -> routage GET,  lancement sauvegarde de la ZC \n');
                    session.saveSession().then((file)=> {
                        res.send('Session ' + name + ' sauvée dans ' + file);
                    })
                        .catch((err)=> {
                            res.send('Erreur lors de la sauvegarde de ' + name + ' : ' + err);
                        });
                } else {
                    res.send('Erreur lors de la sauvegarde de ' + name + ' : la session n\'est pas active');
                }
            } else {
                res.send('Erreur lors de la sauvegarde');
            }
        });
    router.route('/session/:name/close')
        .get(function (req, res, next) {
            var name = req.params.name;

            var host = req.headers.host;
            var splithost = host.split(":");
            var url = 'http://' + splithost[0];

            console.log('CLIENT session.js -> routage GET , session_name = ' + name);

            if (name) {
                console.log('CLIENT session.js -> routage GET,  recuperation de la session \n');
                let session = Session.getSession(name);
                if (session) {
                    console.log('CLIENT session.js -> routage GET,  lancement fermeture de la Session \n');
                    session.close((err)=> {
                        if (err) {
                            res.send('Erreur lors de la fermeture de la session, ' + name + ' :' + err);
                        } else {
                            res.send('Fermeture de la session, ' + name + ' : OK');
                        }
                    });
                } else {
                    res.send('Erreur lors de la fermeture de ' + name + ' : la session n\'est pas active');
                }
            } else {
                res.send('Erreur lors de la fermeture de la session');
            }
        });
    router.route('/session/:name/:table/')
        .get(function (req, res, next) {
            var name = req.params.name;
            var table = req.params.table;

            var host = req.headers.host;
            var splithost = host.split(":");
            var url = 'http://' + splithost[0];

            console.log('CLIENT session.js -> routage GET , session_name = ' + name);

            if (name) {
                console.log('CLIENT session.js -> routage GET,  recuperation de la session \n');
                let session = Session.getSession(name);
                if (session) {
                    if (session.ZC) {
                        let zp = session.ZC.getZP(table);
                        if (zp) {
                            console.log('CLIENT session.js -> routage GET,  lancement de la table ' + table + '\n');
                            res.render('workspace', {
                                title: 'Itac_ZC_app',
                            });
                        } else {
                            res.send('Erreur lors de la creation de la table ' + table + ' : cette table n\`existe pas dans cette session.');
                        }
                    } else {
                        res.send('Erreur lors de la creation de la table ' + table + ' : pas de ZC disponible.');
                    }
                    console.log('CLIENT session.js -> routage GET,  lancement de la table ' + table + '\n');
                } else {
                    res.send('Erreur lors de la creation de la table ' + table + ' : la session ' + name + ' n\'est pas active');
                }
            } else {
                res.send('Erreur lors du lancement de la table');
            }
        });
    router.route('/session/:name/:table/config.json')
        .get(function (req, res, next) {
            var name = req.params.name;
            var table = req.params.table;

            var host = req.headers.host;
            var splithost = host.split(":");
            var url = 'http://' + splithost[0];

            console.log('CLIENT session.js -> routage GET , session_name = ' + name);

            if (name) {
                console.log('CLIENT session.js -> routage GET,  recuperation de la session \n');
                let session = Session.getSession(name);
                if (session) {
                    if (session.ZC) {
                        let zp = session.ZC.getZP(table);
                        if (zp) {
                            let configZp = zp.toJSON();
                            let resultContent = {configZP: configZp, event: event};
                            res.set('Content-Type', 'application/json');
                            res.send(JSON.stringify(resultContent));
                        } else {
                            res.send('Erreur lors de la creation de la table ' + table + ' : cette table n\`existe pas dans cette session.');
                        }
                    } else {
                        res.send('Erreur lors de la creation de la table ' + table + ' : pas de ZC disponible.');
                    }
                    console.log('CLIENT session.js -> routage GET,  lancement de la table ' + table + '\n');
                } else {
                    res.send('Erreur lors de la creation de la table ' + table + ' : la session ' + name + ' n\'est pas active');
                }
            } else {
                res.send('Erreur lors du lancement de la table');
            }
        });

    return router;
};


