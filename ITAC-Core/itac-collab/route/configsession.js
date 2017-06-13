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


                //res.json({ message: 'hooray! welcome to our rest video api!' });
                console.log('CLIENT configsession.js -> routage GET : affichage des parametres pour saisie , host=' + host);
                // appel de la vue associée avec les parametre
                //res.render('configsession', { title: 'Express', ipserver:host });
                console.log(BaseAuthentification.Authenticator.registredFactories());
                console.log(BaseAuthentification.Authenticator.registredAuthenticators());
                res.render('configsession', {
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
            console.log('CLIENT configsession.js -> routage POST : envoi du formulaire pour la Session = ' + ZC.idSession);

            var host = req.headers.host;
            var splithost = host.split(":");
            var url = 'http://' + splithost[0]; //':'+port;

            // transformation du JSOn en tab
            var tab = json2array(ZC);
            console.log('CLIENT configsession.js -> routage POST : la Session en tableau =' + tab);
            var sessionName = tab.shift(); // on recupere le nom de la session (idSession) et on l'enleve du tableau...
            var authFactory = tab.shift(); // on recupere le nom de la factory pour l'authentification et on l'enleve du tableau...
            var authClass = tab.shift(); // on recupere le nom de la methode pour l'authentification et on l'enleve du tableau...
            var authParams = tab.shift(); // on recupere les parametres pour la methode pour l'authentification et on l'enleve du tableau...
            try {
                let jsonParams = JSON.parse(authParams);
                console.log('CLIENT configsession.js -> routage POST : les parametres d\'authentifications sont en JSON : ' + authParams);
                authParams = jsonParams;
            } catch (e) {
                console.log('CLIENT configsession.js -> routage POST : les parametres d\'authentifications ne sont pas en JSON : ' + e);
            }
            var sessionContext = {
                session: {name: sessionName},
                authentification: {factory: authFactory, config: {type: authClass, params: authParams}}
            };
            var longueur = tab.length - 3; // on retire les 3 champs de la ZC (idZC, email, description)
            var nombreZP = Math.floor(longueur / 5); // il y a 5 champs par ZP
            console.log('CLIENT configcollab.js -> routage POST : nb de ZP demandé =' + nombreZP);

            // la premiere ZP est toujours présente
            var paramZP = JSON.stringify({
                idZP: tab[3],
                typeZP: tab[4],
                nbZEmin: tab[5],
                nbZEmax: tab[6],
                urlWebSocket: url,
                portWebSocket: tab[7]
            });
            console.log('CLIENT configcollab.js -> routage POST : creation des ZP, etape 0 ZP =' + paramZP);
            var ajout = {};
            for (var i = 8; i < longueur; i = i + 5) {
                //paramZP=merge(paramZP, {idZP:tab[i], nbZEmin:tab[i+1], nbZEmax:tab[i+2]});
                ajout = {
                    idZP: tab[i],
                    typeZP: tab[i + 1],
                    nbZEmin: tab[i + 2],
                    nbZEmax: tab[i + 3],
                    urlWebSocket: url,
                    portWebSocket: tab[i + 4]
                };
                paramZP = paramZP + ',' + JSON.stringify(ajout);
                console.log('CLIENT configcollab.js -> routage POST : creation des ZP , etape ' + i + 'ZP =' + paramZP);
            }

            // chaine finale de creation de la ZC
            paramZP = "{\"idZC\":\"" + tab[0].toString() + "\",  \"emailZC\":\"" + tab[1].toString() + "\",  \"descriptionZC\":\"" + tab[2].toString() + "\",  \"nbZP\":\"" + nombreZP.toString() + "\", \"ZP\":[" + paramZP + "]}";
            console.log('CLIENT configsession.js -> routage POST : la ZC reconfiguré en JSON =' + paramZP);

            var paramZC = JSON.parse((paramZP).replace(/}{/g, ","));
            // on ajoute la config de la ZC dans le context de la session
            sessionContext.zc = {config: paramZC};
            console.log('CLIENT configsession.js -> routage POST : la session reconfiguré en JSON =');
            var temp = util.inspect(sessionContext);
            console.log(temp);


            req.params.ZC = paramZC;


            console.log('CLIENT configcsession.js -> lancement creation de la Session \n');
            var session = new Session(sessionContext);

            console.log('CLIENT session.js -> routage GET,  lancement recureation de la ZC \n');
            var ZC = session.ZC;


            res.render('collab', {title: 'Express', ipserver: host, zonecollab: paramZC});


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
	
	

