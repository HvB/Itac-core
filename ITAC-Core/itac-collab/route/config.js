module.exports = function (router) {

    // var merge = require('merge');
    var util = require('util');

    // ***************************
    // declaration des objets ITAC
    // ***************************

    var ZoneCollaborative = require('../model/ZoneCollaborative');
    var Artifact = require('../model/Artifact');
    var ZonePartage = require('../model/ZonePartage');
    var ZoneEchange = require('../model/ZoneEchange');
    const BaseAuthentification = require("../utility/authentication");
    var Session = require('../model/Session');

    // utilisation logger
    const itacLogger = require('../utility/loggers').itacLogger;
    var logger = itacLogger.child({component: 'config.js'});

    function json2array(json) {
        var result = [];
        var keys = Object.keys(json);
        keys.forEach(function (key) {
            console.log('   - key=' + key + '  - val=' + json[key]);
            result.push(json[key]);
        });
        return result;
    }

    // ************************
    //   routage des requetes
    // *************************
    router.route('/session/config')

    // ---------------------------------------------------
    // appel initial affichage du formulaire depuis un GET
    // ---------------------------------------------------
        .get(function (req, res, next) {

            var host = req.headers.host;

            logger.info('=> routage GET : affichage des parametres pour saisie , host=' + host);
            logger.info('=> routage GET : '+BaseAuthentification.Authenticator.registredFactories());
            logger.info('=> routage GET : '+BaseAuthentification.Authenticator.registredAuthenticators());
            res.render('config', {
                    title: 'Express',
                    ipserver: host,
                    factories: BaseAuthentification.Authenticator.registredFactories(),
                    authenticators: BaseAuthentification.Authenticator.registredAuthenticators()
                });
            }
        )

        // ---------------------------------------------------
        // traitement de la réponse par un POST
        // ---------------------------------------------------
        .post(function (req, res, next) {

            // recupération de la ZC
            var ZC = req.body;
            logger.info('=> routage POST : envoi du formulaire pour la Session = ' + ZC.idSession);

            var host = req.headers.host;
            var splithost = host.split(":");
            var url = 'http://' + splithost[0]; //':'+port;

            // transformation du JSOn en tab
            var tab = json2array(ZC);
            logger.info('=> routage POST : la Session en tableau =' + tab);
            var sessionName = tab.shift(); // on recupere le nom de la session (idSession) et on l'enleve du tableau...
            var authFactory = tab.shift(); // on recupere le nom de la factory pour l'authentification et on l'enleve du tableau...
            var authClass = tab.shift(); // on recupere le nom de la methode pour l'authentification et on l'enleve du tableau...
            var authParams = tab.shift(); // on recupere les parametres pour la methode pour l'authentification et on l'enleve du tableau...
            try {
                let jsonParams = JSON.parse(authParams);
                logger.info('=> routage POST : les parametres d\'authentifications sont en JSON : ' + authParams);
                authParams = jsonParams;
            } catch (e) {
                logger.error('=> routage POST : les parametres d\'authentifications ne sont pas en JSON : ' + e);
            }
            var sessionContext = {
                session: {name: sessionName},
                authentification: {factory: authFactory, config: {type: authClass, params: authParams}}
            };
            var longueur = tab.length - 3; // on retire les 3 champs de la ZC (idZC, email, description)
            var nombreZP = Math.floor(longueur / 6); // il y a 6 champs par ZP
            logger.info('=> routage POST : nb de ZP demandé =' + nombreZP);

            // la premiere ZP est toujours présente
            var paramZP = JSON.stringify({
                idZP: tab[3],
                typeZP: tab[4],
                visibilite: tab[5],
                nbZEmin: tab[6],
                nbZEmax: tab[7],
                urlWebSocket: url,
                portWebSocket: tab[8]
            });
            logger.info('=> routage POST : creation des ZP, etape 0 ZP =' + paramZP);
            var ajout = {};
            for (var i = 9; i < longueur; i = i + 6) {
                //paramZP=merge(paramZP, {idZP:tab[i], nbZEmin:tab[i+1], nbZEmax:tab[i+2]});
                ajout = {
                    idZP: tab[i],
                    typeZP: tab[i + 1],
                    visibilite: tab[i + 2],
                    nbZEmin: tab[i + 3],
                    nbZEmax: tab[i + 4],
                    urlWebSocket: url,
                    portWebSocket: tab[i + 5]
                };
                paramZP = paramZP + ',' + JSON.stringify(ajout);
                logger.info('=> routage POST : creation des ZP , etape ' + i + 'ZP =' + paramZP);
            }

            // chaine finale de creation de la ZC
            paramZP = "{\"idZC\":\"" + tab[0].toString() + "\",  \"emailZC\":\"" + tab[1].toString() + "\",  \"descriptionZC\":\"" + tab[2].toString() + "\",  \"nbZP\":\"" + nombreZP.toString() + "\", \"ZP\":[" + paramZP + "]}";
            logger.info('=> routage POST : la ZC reconfiguré en JSON =' + paramZP);

            var paramZC = JSON.parse((paramZP).replace(/}{/g, ","));
            // on ajoute la config de la ZC dans le context de la session
            sessionContext.zc = {config: paramZC};
            logger.info('=> routage POST : la session reconfiguré en JSON =');
            var temp = util.inspect(sessionContext);
            console.log(temp);


            req.params.ZC = paramZC;


            logger.info('=> routage POST : lancement creation de la Session');
            var session = new Session(sessionContext);

            logger.info('=> routage POST : lancement recuperation de la ZC');
            var ZC = session.ZC;
            logger.info('=> routage POST : afefctation path artefact ZC');
            ZC.pathArtifacts = session.pathArtifacts;

            logger.info('=> routage POST : sauvegarde de la Session');
            session.saveSession();


            res.render('collab', {title: 'Express', ipserver: host, zonecollab: paramZC, sessionName: session.name});


        });

    return router;
};


/* exemple de ZC conforme
 var paramZC= {
 "idZC": req.body.idZC,
 "nbZP": "3",
 "ZP": [
 {
 "idZP":"test",
 "typeZP":"TableTactile",
 "nbZEmin":"2",
 "nbZEmax":"4",
 "urlWebSocket":"",
 "portWebSocket":"8080"
 },
 {
 "idZP":"test2",
 "typeZP":"Ecran",
 "nbZEmin":"1",
 "nbZEmax":"6",
 "urlWebSocket":"",
 "portWebSocket":"8081"
 },
 {
 "idZP":"test3",
 "typeZP":"Ecran",
 "nbZEmin":"0",
 "nbZEmax":"5",
 "urlWebSocket":"",
 "portWebSocket":"8082"
 }
 ]
 };
 */
	
	

