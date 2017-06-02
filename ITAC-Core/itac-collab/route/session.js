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
    router.route( '/session/:name/save' ) 
        .get( function(req, res,next) {
            var name= req.params.name ;
    
            var host = req.headers.host;
            var splithost=host.split(":");    	
            var url='http://'+splithost[0];
    
            console.log('CLIENT session.js -> routage GET , session_name = '+name);	    	
    
            if (name) {
                console.log('CLIENT session.js -> routage GET,  recuperation de la session \n');
                let session = Session.getSession(name);
                if (session){
                    console.log('CLIENT session.js -> routage GET,  lancement sauvegarde de la ZC \n');
                    session.saveSession().then((file)=>{res.send('Session '+name+' sauvée dans '+file);})
                    .catch((err)=>{res.send('Erreur lors de la sauvegarde de '+name+' : '+err);});
                } else {
                    res.send('Erreur lors de la sauvegarde de '+name+' : la session n\'est pas active');
                }
            } else {
                res.send('Erreur lors de la sauvegarde');
            }
        });

    return router;
};


