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
    router.route('/config')

    // ---------------------------------------------------
    // appel initial affichage du formulaire depuis un GET
    // ---------------------------------------------------
        .get(function (req, res, next) {

                var host = req.headers.host;


                //res.json({ message: 'hooray! welcome to our rest video api!' });
                console.log('CLIENT configcollab.js -> routage GET : affichage des parametres pour saisie , host=' + host);
                // appel de la vue associée avec les parametre
                res.render('configcollab', {title: 'Express', ipserver: host});
            }
        )

        // ---------------------------------------------------
        // traitement de la réponse par un POST
        // ---------------------------------------------------
        .post(function (req, res, next) {

            // recupération de la ZC
            var ZC = req.body;
            console.log('CLIENT configcollab.js -> routage POST : envoi du formulaire pour la ZC = ' + ZC.idZC);

            var host = req.headers.host;
            var splithost = host.split(":");
            var url = 'http://' + splithost[0]; //':'+port;

            // transformation du JSOn en tab
            var tab = json2array(ZC);
            console.log('CLIENT configcollab.js -> routage POST : la ZC en tableau =' + tab);

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
            console.log('CLIENT configcollab.js -> routage POST : la ZC reconfiguré en JSON =' + paramZP);

            var paramZC = JSON.parse((paramZP).replace(/}{/g, ","));
            console.log('CLIENT configcollab.js -> routage POST : la ZC reconfiguré en JSON =');
            var temp = util.inspect(paramZC);
            console.log(temp);


            req.params.ZC = paramZC;


            console.log('CLIENT configcollab.js -> lancement creation de la ZC \n');
            var ZC = new ZoneCollaborative(paramZC);


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
 "nbZEmin":"0",
 "nbZEmax":"0",
 "urlWebSocket":"",
 "portWebSocket":"8081"
 },
 {
 "idZP":"test3",
 "typeZP":"Ecran",
 "nbZEmin":"0",
 "nbZEmax":"0",
 "urlWebSocket":"",
 "portWebSocket":"8082"
 }
 ]
 };
 */
	
	

