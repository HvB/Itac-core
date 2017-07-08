/**
 * Cette classe permet de créer une Zone de Partage qui est associé à une Zone collaborative . Un objet Server est associé
 * à cette zone de partage afin de gérer l'échange de flux par socket
 *
 *
 * @requires ZoneCollaborative
 * @requires ZoneEchange
 * @requires Artifact
 * @requires Serveur
 * @requires bunyan
 * @requires loggers
 *
 * @author philippe pernelle
 *
 */

var ZC = require('./ZoneCollaborative');
var ZoneEchange = require('./ZoneEchange');
var Art = require('./Artifact');
var Serveur = require('./Serveur');
var fs = require("fs");

const uuidv4 = require('uuid/v4');

//utilisation logger
const itacLogger = require('../utility/loggers').itacLogger;

var logger = itacLogger.child({component: 'ZonePartage'});

/**
 * constructeur de ZonePartage
 *
 * @param  {string} idZP - identifiant de la ZP à créée
 * @param  {string} type - type de la ZP (ecran, table)
 * @param  {integer} ZEmin - nombre minimun de ZoneEchange
 * @param  {integer} ZEmax - nombre maximum de ZoneEchange
 */
module.exports = class ZonePartage {
    get clientZAsocket() {
        return this._clientZAsocket;
    }

    set clientZAsocket(value) {
        this._clientZAsocket = value;
    }
    constructor(ZC, idZP, typeZP, nbZEmin, nbZEmax, urlWebSocket, portWebSocket) {

        this.ZC = ZC;
        this.idZP = idZP;

        /**
         * type d'affichage de la Zone de partage
         *
         * @private
         */
        this.typeZP = typeZP;

        /**
         * nombre minimum de Zone d'Echange que l'on doit créer sur la Zone de partage
         *
         * @private
         */
        this.nbZEmin = nbZEmin;

        /**
         * nombre maximun de Zone d'Echange que l'on peut créer sur la Zone de partage
         *
         * @private
         */
        this.nbZEmax = nbZEmax;
        this.urlWebSocket = urlWebSocket;
        this.portWebSocket = portWebSocket;



        /**
         * liste des "ZoneEchanges" associées à la zone de partage
         *
         * @private
         */
        this.listeZE = new Map();

        /**
         * socket de la ZA associé
         *
         * @private
         */
        this.clientZAsocket = 0;

        /**
         * indicateur permettant de savoir s'il faut reconnecter la ZA
         */
        this.clientZAreconnect = false;

        // création du serveur de socket associée
        this.server = new Serveur(this, portWebSocket);
        logger.info('Creation ZonePartage | ZC parent = ' + this.ZC.getId() + ' | IdZP = ' + this.idZP + ' | typeZP = ' + this.typeZP + ' | nbZEMin = ' + this.nbZEmin + ' | nbZEMax = ' + this.nbZEmax + ' | port = ' + this.portWebSocket);

    };


    /**
     * Retourne le type de ZP
     *
     */
    getClientZAsocket() {
        return this.clientZAsocket;
    };

    setClientZAsocket(socketZA) {
        this.clientZAsocket= socketZA;
    };

    /**
     *  Indique si la ZA est connecté à la socket
     */
    isClientZAreconnect() {
        return this.clientZAreconnect ;
    };

    setClientZAreconnect(val) {
        this.clientZAreconnect=val;
    }

    /**
     *  Indique si la ZA est connecté à la socket
     */
    isZAConnected() {
        return (this.clientZAsocket != 0);
    };

    /**
     *  Indique si la ZA est connecté à la socket
     */
    isZAConnected() {
        return (this.clientZAsocket != 0);
    };


    /**
     * Retourne le type de ZP
     *
     */
    getTypeZP() {
        return this.typeZP;
    };

    /**
     * Retourne
     *
     */
    getNbZEmax() {
        return this.nbZEmax;
    };





    /**
     * Retourne d'ID de la zone de partage
     *
     */
    getId() {
        return this.idZP;
    };

    /**
     * Retourne d'ID de la zone de partage
     *
     * @author philippe pernelle
     */
    getALLArtifacts() {
        return this.ZC.getAllArtifacts();
    };

    /**
     * retourne le nombre de Zone d'echange associé à la Zone de Partage
     *
     * @public
     * @returns {Number} Nb de ZE
     * @author philippe pernelle
     */
    getNbZE() {
        return this.listeZE.size;
    };


    /**
     * creation d'une Zone d'Echange (ZE) associée à une ZEP (tablette)
     *
     * @param {string} idZEP identifiant de la tablette (son adresse IP)
     * @param {string} pseudo pseudo envoyé par la ZEP
     * @param {number} posAvatar numero avatar  envoyé par la ZEP
     * @param {string} login login envoyé par la ZEP
     * @param {string} password mot de passe envoyé par la ZEP
     *
     * @return {string} idZE identifiant de la ZE
     *
     * @autor philippe pernelle
     */

    createZE(idZEP,idSocket, visible, pseudo, posAvatar, login, password) {

        var ret = null;

        logger.debug('=> createZE : recherche du IdZE disponible pour client ='+idZEP+', nb de ZE dans la liste = ' + this.listeZE.size);
        var maZE=this.getZEbyZEP(idZEP);

        if (maZE == null)
        {
            logger.debug('=> createZE : resultat recherche du IdZE disponible [NOK] --> la ZE n existe pas');
            if (this.getNbZE() < this.nbZEmax) {

                //calcul de l'ID de la ZE crée
                //var idze = 'ZE'+this.getIdZEcurrent();
                var idze=uuidv4();
                logger.debug('=> createZE : pas de ZE existante --> generation idZE  = ' + idze);

                this.listeZE.set(idze, new ZoneEchange(this, idze,idZEP, idSocket, visible, pseudo, posAvatar, login, password));

                logger.debug('=> createZE :  ZE créée = ' + idze + ' pour la ZEP = ' + idZEP + ' associé a la ZP (' + this.idZP + ') ');
                ret = idze;
            }
            else {
                logger.debug('=> createZE : demande de creation de ZE - [NOK] --> plus NbZEmax atteind pour la ZP(' + this.idZP + ')');
            }
        }
        else
        {
            logger.debug('=> createZE : ZE existante déjà connecté sur adresse IP --> retour NULL sur demande de creation');
        }

        logger.debug('=> createZE : récapitulatif, le nombre total de ZE est = ' + this.listeZE.length);
        return ret;
    };

    /**
     * suppression d'une Zone d'Echange (ZE) connectée qui est associée à une ZEP (tablette)
     * et suppression de tous les artefacts contenu dans cette ZE
     *
     * @param {string} idZE identifiant de la zone d'échange à supprimer
     *
     * @autor philippe pernelle
     */
    destroyZE(idZE) {

        this.listeZE.delete(idZE);

    };

    /**
     * Retourne une Zone d'Echange spécifique de la ZP
     *
     * @public
     * @param {String} idZE Identifiant de la ZE
     * @return {ZE} Zone echange
     * @autor philippe pernelle
     */
    getZE(idZE) {
        var ret = null;
        logger.debug('=> getZE : recherche de ZE dans la liste contenant nb=' + this.listeZE.size);
        var ret = this.listeZE.get(idZE);

        if (ret == null) logger.info('=> getZE : recherche ZE dans la ZP [NOK] idZE(' + idZE + ') nontrouve');
        else logger.info('=> getZE : recherche ZE dans la ZC [OK] idZE trouve=' + ret.getId());

        return ret;
    };

    /**
     * Retourne une Zone d'Echange spécifique de la ZP
     *
     * @public
     * @param {String} idZEP Identifiant de la ZEP associé
     * @return {ZE} Zone echange
     * @autor philippe pernelle
     */
    getZEbyZEP(idZEP) {

        var ret = null;

        logger.debug('=> getZEbyZEP : recherche de ZE par idZEP = ' + idZEP);

        this.listeZE.forEach((function (item, key, mapObj) {
            if (item.getIdZEP()== idZEP) {
                logger.debug('=> getZEbyZEP : recuperation ZE --> ZE avec IdZE=' + item.getId()+ ' et idZEP='+item.getIdZEP());
                ret = item;
            }
        }).bind(this));  // nodejs c'est de la merde si t'oublei e le bind change le referentielle du this

        return ret;
    };

/**
 * Retourne une Zone d'Echange spécifique de la ZP
 *
 * @public
 * @param {String} idZEP Identifiant de la ZEP associé
 * @return {ZE} Zone echange
 * @autor philippe pernelle
 */
getZEbySocket(idsocket) {

    var ret = null;

    logger.info('=>getZEbySocket : recherche de ZE par idsocket=' + idsocket);

    this.listeZE.forEach((function (item, key, mapObj) {
        if (item.getIdSocket()== idsocket) {
        logger.info('=> getZEbySocket : recuperation ZE  Id=' + item.getId());

        ret = item;
    }
    }).bind(this));  // nodejs c'est de la merde si t'oublei e le bind change le referentielle du this

    return ret;
};





    /**
     * Retourne la liste de toutes les Zones d'échanges de la ZP
     *
     * @public
     * @return {ZE[]} liste des ZE
     */
    getAllZE() {
        return this.listeZE;
    };

    /**
     * envoi d'un Artefact depuis une ZP vers une ZE .
     * en fait l'envoi est un simple changement de conteneur , c'est la ZC qui s'en charge
     *
     * @public
     * @param {idAr}    identifant de l'artefact à deplacer
     * @param {idZE}    Zone d'Echange cible
     */
    sendArFromZPtoZE(idAr, idZE) {
         return(this.ZC.setArtifactIntoZE(idAr, idZE));
    };

    /**
     * envoi d'un Artefact depuis une ZE vers une ZP .
     * en fait l'envoi est un simple changement de conteneur , c'est la ZC qui s'en charge
     *
     * @public
     * @param {idAr}    identifant de l'artefact à deplacer
     * @param {idZP}    Zone de Partage cible
     */
    sendArFromZEtoZP(idAr, idZP) {
        this.ZC.setArtifactIntoZP(idAr, idZP);
    };

    /**
     * ajoute un artifact envoyé d'une tablette (ZEP) vers une Zone d'échange spécifique de la ZP
     *  - creation de l'artifact dans la ZC (ZC.addArtifactFromJSON)
     *  - affectation de cet artifact dans la ZE (ZC.setArtifactIntoZE)
     *
     * @public
     *
     * @param {idZEP}   identifiant de la tablette ZEP
     * @param {idZE}    identifiant de la ZE associé à la ZEP
     * @param {artefactenjson}   artefact en JSON
     *
     * @return {IdArtefact} identifiant de l'artefact crée
     *
     * @author philippe pernelle
     */
    addArtifactFromZEPtoZE(pseudo, idZEP, idZE, artefactenjson) {
        // vérification que la ZEP est bien connecté avec la ZE
        var IdArtefact = 0;

        var maZE = this.getZE(idZE);
        logger.debug('=> addArtifactFromZEPtoZE :  recupération de la ZE par idZE=' + idZE );

        if (maZE == null)
        {
            logger.debug('=> addArtifactFromZEPtoZE : pas denvoi en ZE car ZE non trouvé');
        }
        else {
            logger.debug('=> addArtifactFromZEPtoZE : recuperation ZE [ok] idzep='+maZE.getIdZEP()+' ZEP cible ='+idZEP);
            if (maZE.getIdZEP() == idZEP)
            // cas ou elle est bien en lien avec la ZEP
            {
                logger.debug('=> addArtifactFromZEPtoZE : recuperation [OK]');
                // conversion json en objet
                IdArtefact = this.ZC.addArtifactFromJSON(artefactenjson);

                // affectation de l'artifact à la zone ZE
                if (!(this.ZC.setArtifactIntoZE(IdArtefact, idZE))) {
                    logger.debug('=> addArtifactFromZEPtoZE : pas denvoi en ZE car non trouvé');
                }
                ;
            }
        }
        // renvoie l'id de l'artifcat créé
        logger.debug('=> addArtifactFromZEPtoZE : renvoi IdArtefact utilise =' + IdArtefact);
        return IdArtefact;
    };


    /**
     * ajoute un artifact envoyé d'une tablette (ZEP) directement vers une Zone de partage ZP
     *  - creation de l'artifact dans la ZC (ZC.addArtifactFromJSON)
     *  - affectation de cet artifact dans la ZE (ZC.setArtifactIntoZE)
     *
     * @public
     *
     * @param {idZEP}   identifiant de la tablette ZEP
     * @param {idZP}    identifiant de la ZP
     * @param {artefactenjson}   artefact en JSON
     *
     * @return {IdArtefact} identifiant de l'artefact crée
     *
     * @author philippe pernelle
     */
    addArtifactFromZEPtoZP(pseudo, idZEP, idZE, artefactenjson) {
        // vérification que la ZEP est bien connecté avec la ZE
        var IdArtefact = 0;

        var maZE = this.getZE(idZE);
        logger.debug('=> addArtifactFromZEPtoZP : recupération de la ZE par idZE=' + idZE + ' et idZEP=' + idZEP);

        if (maZE.getIdZEP() == idZEP)
        // cas ou elle est bien en lien avec la ZEP
        {
            logger.debug('=> addArtifactFromZEPtoZP : addArtifactFromZEPtoZP , recuperation ZE [OK]');
            // conversion json en objet
            IdArtefact = this.ZC.addArtifactFromJSON(artefactenjson);
            logger.debug('=> addArtifactFromZEPtoZP : recuperation idArtefact [OK] = ' + IdArtefact);

            logger.debug('=> addArtifactFromZEPtoZP : changement de zone  vers ZP=' + this.getId());

            // affectation de l'artifact à la zone ZP
            this.ZC.setArtifactIntoZP(IdArtefact, this.getId());
        }
        // renvoie l'id de l'artifcat créé
        logger.debug('=> addArtifactFromZEPtoZP : renvoi IdArtefact utilise =' + IdArtefact);
        return IdArtefact;
    };

    /**
     * envoi d'un Artefact depuis une ZEP (ZE) vers une EP
     *
     * @public
     *
     * @param {idAr}    artefact
     * @param {idZEP}   identifiant de la tablette ZEP
     * @param {idZE}    identifiant de la ZE associé à la ZEP
     *
     * @author philippe pernelle
     */
    sendArFromZEPtoEP(idAr, idZE, idZEP) {
        this.ZC.setArtifactIntoEP(idAr, idZE, idZEP);
    };

    close(callback){
        let server = this.server;
        let idZP = this.idZP;
        logger.info('=> fermeture ZP %s', idZP);
        this.server.close((err)=>{
            if (err){
                logger.err(err, '=> erreur lors fermeture ZP %s', idZP);
            } else {
                logger.info('=> fermeture ZP %s', idZP);
            }
            if (callback && callback instanceof Function) {
                callback(err);
            }
        });
    }
};


