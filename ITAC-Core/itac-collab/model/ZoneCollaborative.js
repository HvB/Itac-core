/**
 * Cette classe permet de créer une Zone Collaborative
 * Une Zone Collaborative (ZC) est créée par un enseignant afi de permettre un travail de groupe
 * Une ZC est composée de Zones de Partage (ZP) (de 1 à n ZP) ce nombre est définit à la création de la ZC par l'enseignant
 *
 * @requires ZonePartage
 * @requires ZoneEchange
 * @requires Artifact
 * @requires constant
 * @requires bunyan
 * @requires loggers
 *
 * @author philippe pernelle
 */


const Artifact = require('./Artifact');
const ZonePartage = require('./ZonePartage');
const constant = require('../constant');
const TYPE = constant.type;
const DIRECTORY = constant.directory.artifact;
const ZoneEchange = require('./ZoneEchange');
const fs = require("fs");


const uuidv4 = require('uuid/v4');

// utilisation logger
const itacLogger = require('../utility/loggers').itacLogger;

var logger = itacLogger.child({component: 'ZoneCollaborative'});


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
        this.artifacts = new Map();

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

        logger.info('Création de la ZC --> traitement des ZP');

        /*
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
        */

        // creation de la liste des ZP à partir du fichier de parametre
        // chaque ZP sera associé à un serveur de socket
        for (var i = 0; i < parametreZC.nbZP; i++) {
            // id ZP défini dans le fichier de parametre
            logger.info('Création de la ZC --> traitement de le ZP = ' + parametreZC.ZP[i].idZP);

            // creation des ZP
            this.listeZP[i] = new ZonePartage(this, parametreZC.ZP[i].idZP,
                parametreZC.ZP[i].typeZP,
                parametreZC.ZP[i].nbZEmin, parametreZC.ZP[i].nbZEmax,
                parametreZC.ZP[i].urlWebSocket, parametreZC.ZP[i].portWebSocket);
        }


        logger.info('Création de la ZC --> [OK] : ZoneCollaborative  (idZC= ' + this.idZC + ') - [OK] : nbZP total creees = ' + this.getNbZP());

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
        return this.artifacts.size;
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
     * retourne un artefact identifié par son id
     *
     * @public
     * @returns {object} artefact recherché
     * @author philippe pernelle
     */

    getArtifact(id) {

        var ret = this.artifacts.get(id);

        if (ret == null) logger.info('=> getArtifact : recherche arifact dans la ZC [NOK] idArtefact(' + id + ') nontrouve');
        else logger.info('=> getArtifact : recherche arifact dans la ZC [OK] idArtefact trouve=' + ret.getId());

        return ret;
    };




    /**
     * supprime de la zone collaborative, tous les artefacts contenu dans une Zone d'Echange (ZE)
     *
     * @public
     * @param {String} idZE - identifiant de la ZE a supprimer
     * @author philippe pernelle
     */

    transfertAllArtifactsInZP(idZE,idZP) {

        var ret = [];

        logger.info('=> transfertAllArtifactsInZP : recherche pour transfert, tous les artefacts de ZE=' + idZE);
        this.artifacts.forEach((function (item, key, mapObj) {
            if (item.isInto(idZE, TYPE.container.ZE)) {
                logger.info('=> transfertAllArtifactsInZP : changement conteneur artefacts Id=' + item.getId());
                this.setArtifactIntoZP(item.getId(),idZP)
                ret.push(item.getId());
            }
        }).bind(this));  // nodejs c'est de la merde si t'oublei e le bind change le referentielle du this

        logger.info('=> transfertAllArtifactsInZP : transfert tous les artefacts [OK] de ZE=' + idZE + ' vers ZP='+idZP);
        return ret;
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


        var ret=uuidv4();

        return ret;
    };



    /**
     * supprime un artefact de la zone collaborative
     *
     * @public
     * @param {String} id - identifiant de l'artafcat a supprimer
     * @returns {boolean} - indique si l'artefact a été supprimé
     *
     * @author philippe pernelle
     */
    delArtifact(id) {

        var ret =  this.artifacts.delete(id);
        if (ret) logger.info('=> delArtifact : recherche artefact pour suppression [OK] idArtefact trouve=' + id);
            else logger.info('=> delArtifact : recherche artefact  pour suppression [NOK] idArtefact(' + id + ') nontrouve');
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
        var id;
        // cas ou l'identifiant n'existe pas, c'est un nouveau artefact
        if (temp.id == null ||  temp.id == '') {
            // calcul d'un nouvel identifiant
            id = this.setIdAr();
            logger.info('=> addArtifactFromJSON : calcul nouveau IdArtifact = ' + id);
        }
        // cas ou l'identifiant existe , il faut reprendre
        else {
            //var id = parseInt(temp.idAr);
            id=temp.id;
            logger.info('=> addArtifactFromJSON : il s agit d un artefact avec un id : reprise  IdArtifact = ' + id);
            this.delArtifact(id);
            logger.info('=> addArtifactFromJSON : suppresion de l ancien  IdArtifact = ' + id);
        }


        // création de l'artifact

        var monArtifact = Artifact.fromJSON(artifact_json_string, id);
        logger.info('=> addArtifactFromJSON : creation artifact depuis un json' + monArtifact.getId());


        // ajout à la liste
        // DEPRECATED this.artifacts.push(monArtifact);
        this.artifacts.set(id,monArtifact);
        logger.info('=> addArtifactFromJSON : total artifact =' + this.artifacts.size);

        //sauvegarde du fichier JSON
        var chaine = JSON.stringify(monArtifact);
        var path = this.getPathArtifacts() + '/' + monArtifact.getId();
        fs.writeFileSync(path, chaine, "UTF-8");
        logger.info('=> addArtifactFromJSON :  sauvegarde artifact depuis un json, de type=' + monArtifact.getType() + ' de path =' + path);

        //sauvegarde du fichier contenu
        if (monArtifact.getType() === TYPE.artifact.image) {

            path = path + '.png';
            logger.info('=> addArtifactFromJSON : creation artifact : creation image ' + path);
            var base64Data = monArtifact.content.replace(/^data:image\/png;base64,/, "");
            base64Data += base64Data.replace('+', ' ');
            var binaryData = new Buffer(base64Data, 'base64').toString('binary');

            fs.writeFile(path, binaryData, "binary", function (err) {
                logger.error(err); // writes out file without error, but it's not a valid image
            });

        }
        if (monArtifact.getType() === TYPE.artifact.message) {
            path = path + '.txt';
            logger.info('=> addArtifactFromJSON : creation artifact : creation text ' + path);

            fs.writeFile(path, monArtifact.content, "UTF-8", function (err) {
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

        var ret= true;
        logger.debug('=> setArtifactIntoZE : deplacement artifact(' + id + ') vers ZE =' + IdZE);
        var monArtifact = this.getArtifact(id);

        if (monArtifact.isInto(IdZE, TYPE.container.ZE) ) {
            logger.debug('=> setArtifactIntoZE : déja en ZE' + monArtifact.id);
            ret=false;
        }
        else {
            logger.debug('=> setArtifactIntoZE : recuperation artifact' + monArtifact.id);
            monArtifact.setIntoZone(IdZE, TYPE.container.ZE);
            logger.info('=> setArtifactIntoZE : artifact =' + monArtifact.id + ' vers ZE =' + IdZE + '[OK]');
        }
        return ret;

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
        logger.debug('=> setArtifactIntoZP : artifact =' + monArtifact.id + ' vers ZP =' + IdZP + '[OK]');

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



    close(callback){
        let server = this.server;
        let idZC = this.idZC;
        logger.debug('=> close : fermeture de la ZC ' + idZC);
        let zps = this.getAllZP();
        let promises = [];
        logger.debug('=> close : fermeture de des ZP de la ZC ' + idZC);
        for (var i in zps){
            let p = new Promise(function(resolve, reject){
                zps[i].close((err)=> ((err) ? reject(err) : resolve()));
            });
            promises.push(p);
        }
        if (callback && callback instanceof Function) {
            logger.debug('=> close : appel du callback de fermeture de la ZC ' + this.getId());
            Promise.all(promises).then(()=>callback(), (err)=>callback(new Error(err)));
        }
    }
};


	  
