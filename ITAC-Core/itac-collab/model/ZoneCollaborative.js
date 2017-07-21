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
 * @requires itacLogger
 * @requires mkdirp
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
const mkdirp = require('mkdirp');


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
        this._pathArtifacts = DIRECTORY+this.idZC ; //repertoire par defaut, mais en pratique on utilisera celui fournit par la ZC

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
                parametreZC.ZP[i].typeZP, parametreZC.ZP[i].visibilite,
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

        logger.debug('=> transfertArtefactZPtoZP : pas de modification de LastZE [OK] = ' );
        logger.info('=> transfertArtefactZPtoZP : appel deplacement de idArt= ' + idAr + 'vers une ZP=' + idZPcible);
        this.setArtifactIntoZP(idAr, idZPcible);
    };


    /**
     * Getter pour obtenir le chemin contenant les artefacts de la zone collaborative
     * En fait on delegue a la session, car il s'agit du repertoire de sauvegarde de la session
     *
     * @public
     * @returns {string} - le repertoire de sauvegarde des artefacts
     *
     * @author Stephane Talbot
     */
    get pathArtifacts() {
        // si on n'a pas de session ou de repertoire fourni par la session (c'est a dire jamais), on utilise la valeur par defaut : ./artifact/idZC
        if (this.session && this.session.pathArtifacts){
            this.pathArtifacts = this.session.pathArtifacts;
        }
        return this._pathArtifacts;
    }

    /**
     * Setter pour le chemin contenant les artefacts de la zone collaborative
     * En pratique ne sert a rien, car c'est le chemin founi par la session qui compte
     *
     * @deprecated
     * @public
     * @param {string} path - le repertoire de sauvegarde des artefacts
     *
     * @author Stephane Talbot
     *
     * ToDo : a supprimer car inutile
     */
    set pathArtifacts(path) {
        this._pathArtifacts = path;
    }

    /**
     * retourne le chemin contenant les artefacts de la zone collaborative
     *
     * @public
     * @returns {string} path
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
     * @returns {Map.<key, Artifact>} liste des artifacts
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


                this.getArtifact(idAr).setLastZE(idZE);
                logger.debug('=> transfertAllArtifactsInZP : affectation du LastZE [OK] = ' + idZE);

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

        // creation des repetoires si necessaire
        // DEPRECATED mkdirp.sync(this.getPathArtifacts());



        return id;

    };

    /**
     * Sauvegarde de d'un artefact de la ZC.
     * Version synchrone de la methode saveArtifact
     *
     * @deprecated
     * @param id - id de l'artefact a sauvegarder
     * @throws {Error} erreur d'acces au systeme de fichier
     */
    saveArtifactSync(id) {
        let monArtifact = this.getArtifact(id);
        if (monArtifact) monArtifact.save(this.pathArtifacts);
        // remplace par une methode sur l'artefact
        // //sauvegarde du fichier JSON
        // var chaine = JSON.stringify(monArtifact);
        // var path = this.getPathArtifacts() + '/' + monArtifact.getId();
        // logger.info('=> saveArtifact :  sauvegarde artifact depuis un json, de type=' + monArtifact.getType() + ' de path =' + path);
        // fs.writeFileSync(path, chaine, "UTF-8");
        //
        // //sauvegarde du fichier contenu
        // if (monArtifact.getType() === TYPE.artifact.image) {
        //
        //     path = path + '.png';
        //     logger.info('=> saveArtifact : creation artifact : creation image ' + path);
        //     var base64Data = monArtifact.content.replace(/^data:image\/png;base64,/, "");
        //     base64Data += base64Data.replace('+', ' ');
        //     var binaryData = new Buffer(base64Data, 'base64').toString('binary');
        //
        //     fs.writeFile(path, binaryData, "binary", function (err) {
        //         logger.error(err); // writes out file without error, but it's not a valid image
        //     });
        //
        // }
        // if (monArtifact.getType() === TYPE.artifact.message) {
        //     path = path + '.txt';
        //     logger.info('=> saveArtifact : creation artifact : creation text ' + path);
        //
        //     fs.writeFile(path, monArtifact.content, "UTF-8", function (err) {
        //         logger.error(err); // writes out file without error, but it's not a valid image
        //     });
        //
        // }
    }

    /**
     * Sauvegarde de d'un artefact de la ZC.
     * Version asynchrone de la methode.
     *
     * @param id
     * @param {simpleCallback} callback - callback a appeler
     * @returns {Promise} - indique si la sauvegarde s'est bien terminee
     *
     * @author Stephane Talbot
     */
     saveArtifact(id, callback) {
        let monArtifact=this.getArtifact(id);
        let p;
        if (monArtifact){
            p =  monArtifact.save(this.pathArtifacts);
        } else {
            let err = new Error("No artefact with id : " +id);
            logger.error(err,'=> saveArtifact :  pas d\'artefact avec cet id : ' + id);
            p = Promise.reject(err);
        }
        // appel callback
        if (callback && callback instanceof Function) {
            p.then(() => callback(null)).catch(callback);
        }
        return p;
    }

    /**
     * Sauvegarde des artefacts de la ZC.
     * Version synchrone de la methode.
     *
     * @deprecated
     * @throws {Error} erreur d'acces au systeme de fichier
     */
    saveArtifactsSync(){
        let path = this.pathArtifacts;
        this.getAllArtifacts().forEach((artifact, id, map) => artifact.save(path));
    }

     /**
     * Sauvegarde des artefacts de la ZC.
     *
     * @param {simpleCallback} callback - callback
     * @returns {Promise}
     *
     * @author Stephane Talbot
     */
    saveArtifacts(callback){
        let path = this.pathArtifacts;
        let p = Promise.resolve();
        if (this.getAllArtifacts().size > 0) {
            p = Promise.all(Array.from(this.getAllArtifacts().values()).map((artifact) => artifact.save(path)));
        }
        // appel callback
        if (callback && callback instanceof Function) {
            p.then(() => callback(null)).catch(callback);
        }
        return p;
    }
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


    /**
     * Charge les artefacts depuis la session associée dans les ZP
     *
     * todo : decider ce que l'on fait des artefacts en ZE
     *
     * @public
     * @deprecated
     * @param {Array.<string>} artifactIds - liste des ids des artefacts a charger
     * @author philippe pernelle
     * @author Stephane Talbot
     */
    loadArtifactsSync(artifactIds) {
        var tmpfile;
        var fileExt;
        var file;


        var path = this.pathArtifacts;
        var nb = 0;
        var i = 0;
        logger.info('=> loadArtifactsSync : chargement des artefacts depuis path = ' + path);
        /*
         fs.readdirSync(path).forEach( file=> {

         fileExt = file.split('.').pop();
         if (fileExt==file) {
         logger.debug('=> loadArtefacts : chargement du fichier  = '+file);
         tmpfile = fs.readFileSync(path+file, "UTF-8");
         logger.debug('=> loadArtefacts : chargement du fichier [OK] chaine JSON = '+tmpfile);

         // création de l'artifact à partir du JSON
         var monArtifact = Artifact.fromJSON(tmpfile);
         logger.info('=> loadArtefacts : creation artifact depuis un json id = ' + monArtifact.getId());

         logger.info('=> loadArtefacts : type de conteneur de l artefact = ' + monArtifact.getTypeContainer());
         // si l'artefact étaient en ZP on le remet dedans
         if (monArtifact.getTypeContainer() == constant.type.container.ZP)
         {
         this.artifacts.set(monArtifact.getId(),monArtifact);
         this.setArtifactIntoZP(monArtifact.getId(), monArtifact.getIdContainer());
         logger.info('=> loadArtefacts : chargement artefac en ZP =' + monArtifact.getIdContainer() );

         this.getZP(monArtifact.getIdContainer()).loadSession=true;
         logger.info('=> loadArtefacts : flag relaod de  ZP ' + monArtifact.getIdContainer()+') à TRUE' );

         i++;
         }
         nb++;

         }
         });
        */
        if (artifactIds && artifactIds instanceof Array) {
            artifactIds.forEach((id) => {
                logger.debug('=> loadArtifactsSync : chargement du fichier  = ' + this.pathArtifacts + id);
                try {
                    // création de l'artifact à partir du JSON
                    let monArtifact = Artifact.loadSync(this.pathArtifacts + id);
                    logger.info('=> loadArtifactsSync : type de conteneur de l artefact = ' + monArtifact.getTypeContainer());
                    // si l'artefact étaient en ZP on le remet dedans
                    if (monArtifact.getTypeContainer() == constant.type.container.ZP) {
                        this.artifacts.set(monArtifact.getId(), monArtifact);
                        // pas besoin de la ligne suivante normalement
                        //this.setArtifactIntoZP(monArtifact.getId(), monArtifact.getIdContainer());
                        logger.info('=> loadArtifactsSync : chargement artefac en ZP =' + monArtifact.getIdContainer());

                        this.getZP(monArtifact.getIdContainer()).loadSession = true;
                        logger.info('=> loadArtifactsSync : flag relaod de  ZP ' + monArtifact.getIdContainer() + ') à TRUE');

                        i++;
                    }
                } catch (err) {
                    logger.error(err, '=> loadArtifactsSync : erreur lors du chargement du fichier  = ' + this.pathArtifacts + id);
                }
                nb++;
            });
        }
        logger.info('=> loadArtifactsSync : chargement des artefacts [OK] nb fichier chargé = ' + i + ' sur un total de ' + nb);
    }

    /**
     * Charge les artefacts depuis la session associée dans les ZP
     * Il s'agit de la version asynchrone de la methode.
     *
     * todo : decider ce que l'on fait des artefacts en ZE
     *
     * @param {Array.<string>} artifactIds - liste des ids des artefacts a charger
     * @param {loadArtifactsCallback} callback - callback
     * @returns {Promise.<number>} - nombre d'artefacts charges
     * @author Stephane Talbot
     */
    loadArtifacts(artifactIds, callback) {
        let i = 0;
        let p = Promise.resolve(0);
        logger.debug('=> loadArtifacts : chargement des artefacts depuis path = ' + + this.pathArtifacts);
        if (artifactIds && artifactIds instanceof Array && artifactIds.length) {
            p = Promise.all(artifactIds.map((id) =>
                Artifact.load(this.pathArtifacts + id, (err, artifact) => {
                    if (err) {
                        logger.error(err, '=> loadArtifacts : erreur lors du chargement du fichier  = ' + this.pathArtifacts + id);
                    } else {
                        logger.debug('=> loadArtifacts : type de conteneur de l artefact = ' + artifact.getTypeContainer());
                        // si l'artefact étaient en ZP on le remet dedans
                        if (artifact.getTypeContainer() == constant.type.container.ZP) {
                            this.artifacts.set(artifact.getId(), artifact);
                            // pas besoin de la ligne suivante normalement
                            //this.setArtifactIntoZP(artifact.getId(), artifact.getIdContainer());
                            logger.info('=> loadArtifacts : chargement artefac en ZP =' + artifact.getIdContainer());
                            this.getZP(artifact.getIdContainer()).loadSession = true;
                            logger.info('=> loadArtifacts : flag relaod de  ZP ' + artifact.getIdContainer() + ') à TRUE');
                            i++;
                        }
                    }
                }).catch(() => Promise.resolve())))
                .then(() => {
                    logger.info('=> loadArtifacts : chargement des artefacts [OK] nb fichier chargé = ' + i + ' sur un total de ' + artifactIds.length);
                    return Promise.resolve(i);
                });
        }
        // normalement on ne devrait jamais avoir d'erreur (la promesse est tjs tenue)
        if (callback && callback instanceof Function) {
            logger.debug('=> loadArtifacts : appel du callback de fin de chargement des artefacts');
            p.then((nb) => callback(null, nb)).catch((err) => callback(err, i));
        }
        return p;
    }


    /**
     * Fermeture de la ZC et de toutes ses ZP
     *
     * @param callback
     *
     * @author Stephane Talbot
     */
    close(callback){
        let server = this.server;
        let idZC = this.idZC;
        logger.debug('=> close : fermeture de la ZC ' + idZC);
        let zps = this.getAllZP();
        let promises = [];
        logger.debug('=> close : fermeture de des ZP de la ZC ' + idZC);
        for (let i in zps){
            let p = new Promise(function(resolve, reject){
                zps[i].close((err)=> ((err) ? reject(err) : resolve()));
            });
            promises.push(p);
        }
        if (callback && callback instanceof Function) {
            logger.debug('=> close : appel du callback de fermeture de la ZC ' + this.getId());
            if (promises.length >0 )Promise.all(promises).then(()=>callback(), (err)=>callback(err));
            else callback();
        }
    }
};


	  
