/**
 * Cette classe permet de créer une Zone Collaborative
 * Une Zone Collaborative (ZC) est créée par un enseignant afi de permettre un travail de groupe
 * Une ZC est composée de Zones de Partage (ZP) (de 1 à n ZP) ce nombre est définit à la création de la ZC par l'enseignant
 *
 * @requires ZonePartage
 * @requires ZoneEchange
 * @requires Artifact
 * @requires constant
 *
 * @author philippe pernelle
 */


var Artifact = require('./Artifact');
var ZonePartage = require('./ZonePartage');
var constant = require('../constant');
var TYPE = constant.type;
var DIRECTORY = constant.directory.artifact;
var ZoneEchange = require('./ZoneEchange');
var fs = require("fs");

const uuidv4 = require('uuid/v4');

// utilisation loggeu
const bunyan = require('bunyan');
var logger = bunyan.createLogger({name: "ZoneCollaborative"});

/**
 * constructeur de la classe ZoneCollaborative
 *
 * @constructor
 * @param {json} parametreZC - parametre de configuration de la ZC
 * @author philippe pernelle
 */
module.exports = class ZoneCollaborative {
    constructor(parametreZC) {
        /**
         * listes des artefacts associée à la zone collaborative globale
         *
         * @private
         */
        this.artifacts = [];

        /**
         * indique le numero d'identification pour la creation de l'artefact
         *
         * @private
         */
        this.idArtifactNext = 1;

        /**
         * lise des artefact de la ZC qui sont dans une ZP
         *
         * @private
         */
        this.artifactsInZP = [];

        /**
         * lise des artefact de la ZC qui sont dans une ZE
         *
         * @private
         */
        this.artifactsInZE = [];

        /**
         * identifiant de la zone collaborative
         *
         * @private
         */
        this.idZC = parametreZC.idZC;

        /**
         * repertoire contenant les fichiers artefact
         *
         * @private
         */
        this.pathArtifacts = DIRECTORY + this.idZC; //'artifact/';

        /**
         * email de contact de la zone collaborative
         *
         * @private
         */
        this.emailZC = parametreZC.emailZC;

        /**
         * description de la zone collaborative
         *
         * @private
         */
        this.descriptionZC = parametreZC.descriptionZC;

        /**
         * liste des "ZonePartage" associé à la zone collaborative
         *
         * @private
         */
        this.listeZP = [];

        logger.info('*****************************************');
        logger.info('*** ZoneCollaborative  (idZC= ' + this.idZC + ')');
        logger.info('  --> email_contact=' + this.emailZC);
        logger.info('  --> description=' + this.descriptionZC);
        logger.info('*****************************************');

        logger.info('traitement du dossier de sauvegarde =' + this.pathArtifacts);
        try {
            fs.mkdirSync(DIRECTORY);
            logger.info('dossier cree' + DIRECTORY);
        } catch (e) {
            logger.info('dossier principal existant :' + e.code);
        }

        try {

            fs.mkdirSync(this.pathArtifacts);
            logger.info('dossier cree' + this.pathArtifacts);
        } catch (e) {
            logger.info('dossier de sauvegarde existant :' + e.code);
            if (e.code != 'EEXIST') throw e;
        }

        // creation de la liste des ZP à partir du fichier de parametre
        // chaque ZP sera associé à un serveur de socket
        for (var i = 0; i < parametreZC.nbZP; i++) {
            // id ZP défini dans le fichier de parametre
            logger.info('traitement de le ZP = ' + parametreZC.ZP[i].idZP);

            // creation des ZP
            this.listeZP[i] = new ZonePartage(this, parametreZC.ZP[i].idZP,
                parametreZC.ZP[i].typeZP,
                parametreZC.ZP[i].nbZEmin, parametreZC.ZP[i].nbZEmax,
                parametreZC.ZP[i].urlWebSocket, parametreZC.ZP[i].portWebSocket);
        }


        logger.info('*** Resultat final : ZoneCollaborative  (idZC= ' + this.idZC + ') - [OK] : nbZP total creees = ' + this.getNbZP());

    };

    /**
     * retourne l'identifiant de la zone collaborative
     *
     * @public
     * @returns {String} identifiant ZC
     * @author philippe pernelle
     */
    getJSON() {
        /*
         var myjson =
         {
         idZC:this.getId(),
         nbZP:this.getNbZP()

         };
         */
        // la premiere ZP est toujours présente
        var paramZP = JSON.stringify({
            idZP: this.listeZP[0].idZP,
            typeZP: this.listeZP[0].typeZP,
            nbZEmin: this.listeZP[0].ZEmin,
            nbZEmax: this.listeZP[0].ZEmax,
            urlWebSocket: this.listeZP[0].urlWebSocket,
            portWebSocket: this.listeZP[0].portWebSocket
        });

        for (var i = 1; i < this.getNbZP(); i++) {
            //paramZP=merge(paramZP, {idZP:tab[i], nbZEmin:tab[i+1], nbZEmax:tab[i+2]});
            var ajout = {
                idZP: this.listeZP[i].idZP,
                typeZP: this.listeZP[i].typeZP,
                nbZEmin: this.listeZP[i].ZEmin,
                nbZEmax: this.listeZP[i].ZEmax,
                urlWebSocket: this.listeZP[i].urlWebSocket,
                portWebSocket: this.listeZP[i].portWebSocket
            };
            paramZP = paramZP + ',' + JSON.stringify(ajout);
            logger.info('=> getJSON :'+' i=' + i + 'ZP' + paramZP);
        }
        paramZP = "{\"idZC\":\"" + this.getId() + "\", \"nbZP\":\"" + this.getNbZP() + "\", \"ZP\":[" + paramZP + "]}";
        logger.info('=> getJSON : paramZP='+paramZP);
        var myjson = JSON.parse((paramZP).replace(/}{/g, ","))

        return myjson;
    };


    /**
     * retourne l'identifiant de la zone collaborative
     *
     * @public
     * @returns {String} identifiant ZC
     * @author philippe pernelle
     */
    getId() {
        return this.idZC;
    };


    /**
     * retourne la liste des ZP(Zone de Partage) la zone collaborative
     *
     * @public
     * @returns {ZonePartage[]} liste des ZP
     * @author philippe pernelle
     */

    getAllZP() {
        //console.log('   *** nbZP dans liste ='+this.listeZP.length);
        return this.listeZP;
    };


    /**
     * retourne une ZP(Zone de Partage) de la zone collaborative
     *
     * @public
     * @param {idZP}
     * @returns {ZonePartage} liste des ZP
     * @author philippe pernelle
     */
    getZP(idZP) {
        var ret = null;

        logger.info('=> getZP : recherche de la ZP suivante : ' + idZP);
        for (var i = 0; i < this.getNbZP(); i++) {

            if (this.listeZP[i].getId() === idZP) {
                ret = this.listeZP[i];
                logger.info('=> getZP :  recherche de la ZP suivante : ' + idZP + ' trouve [OK] ');
            }

        }
        if (ret == null) logger.info('=> getZP : recherche de la ZP suivante : ' + idZP + ' trouve [NOK] ');
        return ret;
    };


    /**
     * transfert un artefact d'une ZP à une autre ZP de la meme ZC
     *
     * @public
     *
     * @param {idAr} Identifiant de l'artefact à transferer
     * @param {idZPsource} ZP source
     * @param {idZPsource} ZP destination
     *
     * @author philippe pernelle
     */
    transfertArtefactZPtoZP(idAr, idZPsource, idZPcible) {
        logger.info('=> transfertArtefactZPtoZP : appel deplacement de idArt= ' + idAr + 'vers une ZP=' + idZPcible);
        this.setArtifactIntoZP(idAr, idZPcible);
    };

    /**
     * retourne le chemin contenant les artefacts de la zone collaborative
     *
     * @public
     * @returns {String} path
     *
     * @author philippe pernelle
     */
    getPathArtifacts() {
        return this.pathArtifacts;
    };

    /**
     * retourne le nombre des artefacts associé à la zone collaborative
     *
     * @public
     * @returns {Number} Nb de AR
     *
     * @author philippe pernelle
     */
    getNbArtifact() {
        return this.artifacts.length;
    };

    /**
     * retourne la liste des Artefacts de la zone collaborative
     *
     * @public
     * @returns {artifacts} liste des artifacts
     *
     * @author philippe pernelle
     */
    getAllArtifacts() {
        //console.log('   *** nbArtifact dans liste ='+this.artifacts.length);
        return this.artifacts;
    };

    /**
     * retourne la liste des artefacts associés à une ZP de la ZC
     *
     * @public
     * @returns {Number} Nb de AR
     * @author philippe pernelle
     */
    getAllArtifactsInZP(idZP) {
        var artifactsInZP = [];
        // parcours de tous les artefacts
        for (var i = 0; i < this.getNbArtifact(); i++) {
            // test si l'artéfact est dans la ZP
            if (this.artifacts[i].isInto(idZP, TYPE.container.ZP)) {
                // ajout à la liste
                artifactsInZP.push(this.artifacts[i]);
            }
        }
        // retourne la liste constituée
        return artifactsInZP;
    };

    /**
     * retourne un artefact identifié par son id
     *
     * @public
     * @returns {Number} Nb de AR
     * @author philippe pernelle
     */

    getArtifact(id) {

        var ret = null;

        for (var i = 0; i < this.getNbArtifact(); i++) {
            if (this.artifacts[i].getId() == id) {
                ret = this.artifacts[i];
                logger.info('=> getArtifact : recherche arifact dans la ZC [OK] idArtefact trouve=' + ret.getId());
            }
        }
        if (ret == null) logger.info('=> getArtifact : recherche arifact dans la ZC [NOK] idArtefact(' + id + ') nontrouve');
        return ret;
    };


    /**
     * retourne les artefacts de la zone collaborative associés à une zone d'echange (ZE)
     *
     * @public
     * @param {String} idZE - identifiant de la ZE
     * @returns {Artefact[]} tableau des artefact de la ZE
     * @author philippe pernelle
     */

    getAllArtifactsInZE(idZE) {

        var artifactsInZE = [];

        //console.log('   ***  recherche artifact pour ZE='+idZE);
        for (var i = 0; i < this.getNbArtifact(); i++) {

            if (this.artifacts[i].isInto(idZE, TYPE.container.ZE)) {
                artifactsInZE.push(this.artifacts[i]);
            }
        }
        return artifactsInZE;

    };

    /**
     * supprime de la zone collaborative, tous les artefacts contenu dans une Zone d'Echange (ZE)
     *
     * @public
     * @param {String} idZE - identifiant de la ZE a supprimer
     * @author philippe pernelle
     */

    suppresAllArtifactsInZE(idZE) {

        console.log('    *** ZC : recherche pour suppression, tous les artefacts de ZE=' + idZE);
        for (var i = 0; i < this.getNbArtifact(); i++) {

            if (this.artifacts[i].isInto(idZE, TYPE.container.ZE)) {
                logger.info('=> suppresAllArtifactsInZE : suppression artefacts Id=' + this.artifacts[i].getId());

                this.artifacts.splice(i, 1);
            }
        }
        logger.info('=> suppresAllArtifactsInZE : recherche pour suppression, tous les artefacts de ZE=' + idZE + ' [ok]');

    };


    /**
     * retourne le nombre de Zone de Partage (ZP) associé à la zone collaborative
     *
     * @public
     * @returns {Number} Nb de ZP
     * @author philippe pernelle
     */

    getNbZP() {
        return this.listeZP.length;
    };


    /**
     * retourne un nouveau numero d'artefact
     * utilisation des uuid
     *
     * @public
     * @returns {String} Id disponible du nouvel Artefact basé sur uuid v4
     * @author philippe pernelle
     */

    setIdAr() {

        /*	DEPRECATED
         if (this.getNbArtifact() !== 0) {
         // on récupere le dernier IdArtefact du tableau et on ajoute 1
         ret = this.artifacts[this.idArt].getId() + 1;
         }
         */
        /*	DEPRECATED
        var ret = this.idArtifactNext;
        this.idArtifactNext = this.idArtifactNext + 1;
        */
        var ret=uuidv4();

        return ret;
    };


    /**
     * ajoute un nouveau artefact dans un conteneur de la zone collaborative
     *
     * @public
     * @param {String} creator - pseudo du créateur de l'artifact
     * @param {String} typeArtifact - type de l artefact ajouté
     * @param {String} idConteneur - identifiant du conteneur
     * @param {String} typeConteneur - type du conteneur ZE ou ZP
     * @param {JSON } contenu - contenu de l'artifact
     *
     * @author philippe pernelle


    addArtifact(creator, typeArtifact, idConteneur, typeConteneur, contenu) {

        // calcul d'un nouvel identifiant
        var id = this.setIdAr();
        console.log('    *** ZC : calcul nouveau IdArtifact = ' + id);


        // création de l'artifact
        var monArtifact = new Artifact(id, creator, typeArtifact, idConteneur, typeConteneur, contenu);
        console.log('    *** ZC : creation artifact' + monArtifact.getId());

        // ajout à la liste de tous les artefact de la ZC
        this.artifacts.push(monArtifact);

        console.log('    *** ZC : total artifact =' + this.artifacts.length);

    };
     */

    /**
     * supprime un artefact de la zone collaborative
     *
     * @public
     * @param {String} id - identifiant de l'artafcat a supprimer
     * @returns {boolean} - indique si l'artefact a été supprimé
     * @author philippe pernelle
     */
    delArtifact(id) {
        var ret = false;

        for (var i = 0; i < this.getNbArtifact(); i++) {
            if (this.artifacts[i].getId() == id) {
                ret = true;
                this.artifacts.splice(i, 1);
                logger.info('=> delArtifact : recherche artefact pour suppression [OK] idArtefact trouve=' + id);
            }
        }
        if (!ret) logger.info('=> delArtifact : recherche artefact  pour suppression [NOK] idArtefact(' + id + ') nontrouve');
        return ret;
    };

    /**
     * ajoute un nouveau artefact à la zone collaborative à partir d'un JSON
     *
     * @public
     * @param {JSON } artifact_json_string - contenu de l'artifact
     *
     * @author philippe pernelle
     */
    addArtifactFromJSON(artifact_json_string) {

        logger.info('=> addArtifactFromJSON : ajout artefact a partir du JSON' );

        var temp = JSON.parse(artifact_json_string);

        // cas ou l'identifiant n'existe pas, c'est un nouveau artefact
        if (temp.id == null ||  temp.id == '') {
            // calcul d'un nouvel identifiant
            var id = this.setIdAr();
            logger.info('=> addArtifactFromJSON : calcul nouveau IdArtifact = ' + id);
        }
        // cas ou l'identifiant existe , il faut reprendre
        else {
            //var id = parseInt(temp.idAr);
            logger.info('=> addArtifactFromJSON : il s agit d un artefact avec un id : reprise  IdArtifact = ' + id);
            this.delArtifact(id);
            logger.info('=> addArtifactFromJSON : suppresion de l ancien  IdArtifact = ' + id);
        }


        // création de l'artifact

        var monArtifact = Artifact.fromJSON(artifact_json_string, id);
        logger.info('=> addArtifactFromJSON : creation artifact depuis un json' + monArtifact.getId());


        // ajout à la liste
        this.artifacts.push(monArtifact);
        logger.info('=> addArtifactFromJSON : total artifact =' + this.artifacts.length);

        //sauvegarde du fichier JSON
        var chaine = JSON.stringify(monArtifact);
        var path = this.getPathArtifacts() + '/' + monArtifact.getId();
        fs.writeFileSync(path, chaine, "UTF-8");
        logger.info('=> addArtifactFromJSON :  sauvegarde artifact depuis un json, de type=' + monArtifact.getType() + ' de path =' + path);

        //sauvegarde du fichier contenu
        if (monArtifact.getType() === TYPE.artifact.image) {

            path = path + '.png';
            logger.info('=> addArtifactFromJSON : creation artifact : creation image ' + path);
            var base64Data = monArtifact.contenu.replace(/^data:image\/png;base64,/, "");
            base64Data += base64Data.replace('+', ' ');
            var binaryData = new Buffer(base64Data, 'base64').toString('binary');

            fs.writeFile(path, binaryData, "binary", function (err) {
                logger.error(err); // writes out file without error, but it's not a valid image
            });

        }
        if (monArtifact.getType() === TYPE.artifact.message) {
            path = path + '.txt';
            logger.info('=> addArtifactFromJSON : creation artifact : creation text ' + path);

            fs.writeFile(path, monArtifact.contenu, "UTF-8", function (err) {
                logger.error(err); // writes out file without error, but it's not a valid image
            });

        }

        return id;

    };

    /**
     * Change le conteneur d'un artefact pour le mettre dans une ZE
     *
     * @public
     * @param {String} id -Identifiant de l'artefact
     * @param {String} IdZE - identifiant de la ZE
     *
     * @author philippe pernelle
     */
    setArtifactIntoZE(id, IdZE) {

        logger.debug('=> setArtifactIntoZE : deplacement artifact(' + id + ') vers ZE =' + IdZE);
        var monArtifact = this.getArtifact(id);

        logger.debug('=> setArtifactIntoZE : recuperation artifact' + monArtifact.id);
        monArtifact.setIntoZone(IdZE, TYPE.container.ZE);
        logger.info('=> setArtifactIntoZE : artifact =' + monArtifact.id + ' vers ZE =' + IdZE + '[OK]');
    };

    /**
     * Change le conteneur d'un artefact pour le mettre dans une ZP
     *
     * @public
     * @param {String} id -Identifiant de l'artefact
     * @param {String} IdZP - identifiant de la ZP
     *
     * @author philippe pernelle
     */
    setArtifactIntoZP(id, IdZP) {

        logger.debug('=> setArtifactIntoZP : deplacement artifact(' + id + ') vers ZP =' + IdZP);
        var monArtifact = this.getArtifact(id);

        logger.debug('=> setArtifactIntoZP : recuperation artifact' + monArtifact.id);
        monArtifact.setIntoZone(IdZP, TYPE.container.ZP);
        logger.info('=> setArtifactIntoZP : artifact =' + monArtifact.id + ' vers ZP =' + IdZP + '[OK]');

    };

    /**
     * supprimer artefact de la zone ZE pour la mettre dans l'espace personnel (EP) de la tablette
     *
     * @public
     * @param {Number} idArtifact -Identifiant de l'artefact
     * @param {String} IdZE - identifiant de la ZE contenant l'artefact
     * @param {String} IdZEP - identifiant de la ZEP (la tablette contenant
     *
     * @author philippe pernelle
     */

    setArtifactIntoEP(idAr, idZE, idZEP) {

        logger.info('=> setArtifactIntoEP : recherche art avec Id=' + idAr + '  idZE= ' + idZE + '  idZEP=' + idZEP);
        // a modifier pas de controle si idAr est bien dans la ZE
        if (this.delArtifact(idAr)) logger.info('=> setArtifactIntoEP : : suppression art avec Id=' + idAr + '  idZE= ' + idZE);
    };

    /**
     * envoyer un artefact vers la zone de partage
     *
     * @param {string} idZP - id de la zone de partage
     * @param {number} idAr - id de l'artefact à envoyer
     *
     * @author philippe pernelle
     */
    /*
    addArtifactFromZEPToZP(idZP, id) {
        // pas moi qui est fait ca , interet de la chose ?
        this.idZP = idZP;
        //this.idAr = idAr;

        for (i = 0; i < this.artifacts.length; i++) {
            if (this.artifacts[i].id == id) // && (this.listeZP[i].idZP===
            // idZP)) //chercher lartifact ayant l'id correspendante
            {
                // ajoute l'artefact dans la liste de la ZP
                this.artifactsInZP.push(this.artifacts[i]);
                console.log(this.artifacts);
                this.artifacts.splice(i, 1);//effacer l'artefact déja ajouter à la zone partage
                console.log('    *** ZC : ajout artefact numéro # ' + this.idAr + ' est ajouté à la  ZP (' + idZP + ') , total = ' + this.artifactsInZP.length);

                console.log();
                console.log(this.artifactsInZP[i]);
                console.log();

                (this.newID = this.setIdAr() + i);

                console.log('-- new id =  ' + this.newID);
            }
        }
        console.log('========================================================================');
        console.log('les artifacts envoyés vers la zone de partage sont : \n');
        console.log(this.artifactsInZP);
        console.log('========================================================================');
    };
     */
    /**
     * Envoie d'artefacts from ZEP to ZE
     *
     * @param {string} idZE - id de la zone d'echange
     * @param {number} idAr - id de l'artefact à envoyer
     */
    /*
    addArtifactFromZEPToZE(idZE, id) {
        this.idZE = idZE;
        //this.idAr = idAr;

        for (i = 0; i < this.artifacts.length; i++) {
            if (this.artifacts[i].id == id) // && (this.listeZE[i].idZE===
            // idZE)) //chercher lartifact ayant l'id correspendante
            {
                this.artifactsInZE.push(this.artifacts[i]);
                console.log('*** Artifact ajouté à la zone dechange , total = ' + this.artifactsInZE.length);
                console.log();
                console.log(this.artifactsInZE[i]);
                console.log();

                (this.newArID = this.setIdAr() + i);

                console.log('-- new id =  ' + this.newArID);

            }

        }
        console.log('========================================================================');
        console.log('les artifacts envoyés vers les zones dechanges sont : \n');
        console.log(this.artifactsInZE);
        console.log('========================================================================');
    };
    */
    /**
     * Envoie d'artefacts from ZE to ZEP
     *
     * @param {string} idZEP - id de la zone personnelle
     * @param {number} idAr - id de l'artefact à envoyer
     */
    /*
    addArtifactFromZEtoZEP(idZEP, idAr) {
        this.idZEP = idZEP;
        this.idAr = idAr;

        console.log('========================================================================')
        for (i = 0; i < this.artifactsInZE.length; i++) {
            if (this.artifactsInZE[i].idAr == idAr) {
                this.artifacts.push(this.artifactsInZE[i]);
                console.log('*** Artifact ajouté à la zone personnelle , total = ' + this.artifacts.length);
                console.log();
                console.log(this.artifacts[i]);
                console.log();
            }
        }

        console.log('........................................................................')
        console.log('========================================================================')
        console.log('les artifacts envoyés vers les zones personnelles sont : \n')
        console.log(this.artifacts);
        console.log('========================================================================')
        console.log('========================================================================')

    };
 */

    /**
     * Envoie d'artefacts from ZP to ZE
     *
     * @param {string } idZE - id de la zone de partage
     * @param {number } idAr - id de l'artefact
     */
    /*
    addArtifactFromZPtoZE(idZE, idAr) {
        this.idAr = idAr;
        this.idZE = idZE;
        this.artifactsInZE = [];
        this.artifactsInZP = ZoneCollaborative.artifactsInZP;
        for (var i = 0; i < this.artifactsInZP.length; i++) {
            if (this.artifactsInZP[i].idAr == idAr) {
                this.artifactsInZE.push(this.artifactsInZP[i]);
                console.log(' *** artefact numéro # ' + this.idAr + ' est ajouté à la zone d echange ayant idZE = ' + this.idZE);
                console.log('........................................................................')
                console.log(this.artifactsInZE);
                console.log('========================================================================')
                console.log('========================================================================')
            }
        }
    };
   */
    /**
     * Envoie d'artefacts from ZE to ZP
     *
     * @param {string } idZP - id de la zone de partage
     * @param {number } idAr - id de l'artefact
     */
    /*
    addArtifactFromZEtoZP(idZP, idAr) {
        this.idAr = idAr;
        this.idZP = idZP;
        this.artifactsInZP = [];
        this.artifactsInZE = ZoneCollaborative.artifactsInZE;
        for (var i = 0; i < this.artifactsInZE.length; i++) {
            if (this.artifactsInZP[i].idAr == idAr) {
                this.artifactsInZP.push(this.artifactsInZE[i]);
                console.log(' *** artefact numéro # ' + this.idAr + ' est ajouté à la zone de partage ayant idZP = ' + this.idZP);
                console.log('........................................................................')
                console.log(this.artifactsInZP);
                console.log('========================================================================')
                console.log('========================================================================')
            }
        }
    };

*/
    /*
    consoleArtifacts() {
        // charge la liste de ZP
        var liste = [];
        liste = this.getAllArtifacts();
        // affiche  la liste total des artifact
        console.log('    ******************************************************');
        console.log('    liste totale d artifact de ZC (' + this.getId() + ') ');
        for (var i = 0; i < liste.length; i++) {
            console.log('         - Artefact Id=' + liste[i].getId() + ' | conteneur=' + liste[i].getIdContainer() + ' | TypeConteneur=' + liste[i].getTypeContainer());
        }
        console.log('    *******************************************************');
        console.log('    ZC (' + this.getId() + ')  possede ' + this.getNbZP() + ' ZP ');


        var liste2 = [];
        var listeZE = [];
        // liste des ZP
        liste2 = this.getAllZP();

        for (i = 0; i < liste2.length; i++) {
            // liste des artifacts par ZP
            liste = this.getAllArtifactsInZP(liste2[i].getId());
            console.log('         *****   Contenu de ZP (' + liste2[i].getId() + ') : Nb artifact trouve = ' + liste.length + ' ****');
            for (var j = 0; j < liste.length; j++) {
                console.log('                    - Artefact Id=' + liste[j].getId() + ' | conteneur=' + liste[j].getIdContainer() + ' | TypeConteneur=' + liste[j].getTypeContainer());
            }

            // liste des ZE par ZP
            listeZE = liste2[i].getAllZE();
            console.log('         *****   Contenu de ZP (' + liste2[i].getId() + ') : Nb ZE trouve = ' + listeZE.length);

            for (j = 0; j < listeZE.length; j++) {
                liste = this.getAllArtifactsInZE(listeZE[j].getId());
                console.log('                 --> Contenu de ZE (' + listeZE[j].getId() + ')  Nb artifact trouve = ' + liste.length + ' <---');
                for (var k = 0; k < liste.length; k++) {
                    console.log('                    - Artefact =' + liste[k].getId());
                }
            }
        }
    };
    */
};


	  
