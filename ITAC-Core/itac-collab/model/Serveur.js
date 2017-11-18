var http = require('http');
var fs = require('fs');
var util = require("util");
var ZP = require('./ZonePartage');
var ZC = require("./ZoneCollaborative");
var constant = require('../constant');
var ERROR = constant.error;
var EVENT = constant.event;

// utilisation logger
const itacLogger = require('../utility/loggers').itacLogger;

var logger = itacLogger.child({component: 'Serveur'});

var idZEP = 0;

/**
 * Serveur de socket permettant de gérer les échanges entre une Zone de Partage (ZP), des Zones d'Echange (ZE)
 * et des tablettes (ZEP)
 *
 * @param ZP : identifiant de la zone de partage associé au serveur de socket
 * @param port : numéro du port d'écoute serveur de socket
 *
 * @author philippe pernelle
 */
module.exports = class Serveur {
    constructor(ZP, port) {
        /**
         * zone de partage (ZP) associée au serveur
         */
        this.ZP = ZP;
        /**
         * port d'écoute serveur
         */
        this.port = port;
        /**
         * adresse d'écoute serveur
         */
        this.address = "localhost";

        logger.info("Creation serveur --> serveur HTTP pour la ZP (" + ZP.getId() + ") sur le port " + port);
        var srv = http.createServer();
        srv.listen(this.port, function () {
            logger.info("Creation serveur --> Serveur en ecoute sur le port %d", port);
        });
        this._io = require('socket.io').listen(srv, function () {
            logger.info('Creation serveur --> Lancement de la Socket en ecoute sur port ' + port);
        });
        this._io.origins('*:*');
        logger.info('Creation serveur --> Socket en ecoute [OK] ');

        // declenchement de la fonction de traitement à l'arrivee d'une demande de connexion de socket d'une tablette :EVENT.ConnexionSocketZEP
        this._io.sockets.on('connection', (function (socket) {
            logger.info('--------------------------------------------------------------------------------');
            logger.info('---- Arrive d une demande de connection --- SOCKET ID=' + socket.id + ' ---');
            logger.info('--------------------------------------------------------------------------------');
            this.traitementSurConnexion(socket);
        }).bind(this));
    }

    /**
     * Fonction permettant de tester un login et un mot de passe
     *
     * @param {string} login
     * @param {string} password
     *
     * @returns {Promise} une promesse contenant le user id.
     *
     * @author philippe pernelle
     * @author Stephane talbot
     */
    getAuthentification (login, password)
    {
        // recuperation de la fabrique associé à la session
        var auth = this.ZP.ZC.session.authIds;

        // appel du test d'authentification
        var authPromise=auth.verifyCredential(auth.createCredential(login,password))

        // retourne la promesse
        return authPromise;
    }

    /**
     * fonction principale de traitement des evenements de la socket intégrant les
     * connexion de ZEP et de ZA
     *
     * @param socket
     *
     * @autor philippe pernelle
     */
    traitementSurConnexion(socket) {
        // recupération de l'adresse IP de la socket
        var clientIp = socket.request.connection.remoteAddress;
        //var clientIp = socket.handshake.address;
        //var clientIp = socket.request.conn.remoteAddress ;

        /*
         * 0 - Demande de connexion d'une ZA
         *     Cet evenement est normalement émis par une Zone d'Affichage associé à une Zone de partage
         *     un acquitement est envoyé en retour
         */
        socket.on(EVENT.DemandeConnexionZA, (function (urldemande, zpdemande) {
            logger.info('*** EVENT : ' + EVENT.DemandeConnexionZA + ' from IP('+clientIp+')*** --> Demande de connexion d une ZA ( ' + urldemande + ' ) avec IP= ' + clientIp + ' et ZP demande= ' + zpdemande);
            this.demandeConnexionZA(socket, urldemande, zpdemande);
            logger.debug('*** fin EVENT :' + EVENT.DemandeConnexionZA + ' *** ');
        }).bind(this));

        /*
         * 1 - demande de connexion d'une ZEP --> demande de création d'une ZE associé
         *     Cet evenement est envoye par une ZEP (tablette)
         *     un acquitement est envoyé en retour à la ZEP ainsi qu'a la ZA pour declancher son affichage
         */
        socket.on(EVENT.DemandeConnexionZEP, (function (pseudo, posAvatar,login,password) {
            logger.info('*** EVENT : ' + EVENT.DemandeConnexionZEP + ' from IP('+clientIp+')*** --> Demande de connexion de la ZEP avec IP= ' + clientIp + ' et pseudo= ' + pseudo);
            // Comme la verification de l'authetification est asynchrone, cette methode l'est aussi !!!!
            this.demandeConnexionZE(socket, clientIp,  pseudo, posAvatar,login,password);
            // plus pertinent ici car le methode precedente est asynchrone
        }).bind(this));

        /*
         * 2 - reception d'un artefact d'une ZEP --> ZE
         *     cet evenement est envoye par une ZEp (tablette) lorsque qu'un utilisateur deplace un artefact vers sa zone d echange
         *     un acquitement est envoye à la ZEP et a la ZA pour signaler la reception de cet artifact
         */
        socket.on(EVENT.NewArtefactInZE, (function (pseudo, idZEP, idZE, artefactenjson) {
            logger.info('*** EVENT : ' + EVENT.NewArtefactInZE + ' *** --> Reception Artifact d une ZEP (' + idZEP + ' ) vers la ZE =' + idZE);
            this.receptionArtefactIntoZE(socket, pseudo, idZEP, idZE, artefactenjson);
            logger.debug('*** fin EVENT :' + EVENT.NewArtefactInZE + ' *** ');
        }).bind(this));

        /*
         * 3 - reception d'un artefact d'une ZEP --> ZP
         *     cet evenement est envoye par une ZEp (tablette) lorsque qu'un utilisateur deplace un artefact directement vers la  zone de partage
         *     un acquitement est envoye à la ZEP et a la ZA pour signaler la reception de cet artifact	 *
         */
        socket.on(EVENT.NewArtefactInZP, (function (pseudo, idZEP, idZE, artefactenjson) {
            logger.info('*** EVENT : ' + EVENT.NewArtefactInZP + ' *** --> Reception Artifact d une ZEP (' + idZEP + ')  pousser vers la ZP (' + this.ZP.getId() + ')');
            this.receptionArtefactIntoZP(socket, pseudo, idZEP, idZE, artefactenjson);
            logger.debug('*** fin EVENT :' + EVENT.NewArtefactInZP + ' *** ');
        }).bind(this));

        /*
         * 4 - envoie d'un artefact d'une ZE ---> ZP
         *     cet evenement est emis par une zone d'affichage (ZA) lorsqu 'un utilisateur deplace un artefact d'une ZE vers la zone commune de partage (ZP)
         *     le traitement consite a demander a la ZC de changer le conteneur de l'artifact
         *     un evenement est ensuite emis pour informer la tablette qu'elle doit supprimer l'artifact
         */
        socket.on(EVENT.EnvoieArtefactdeZEversZP, (function (idAr, idZE, idZP) {
            logger.info('*** EVENT : ' + EVENT.EnvoieArtefactdeZEversZP + ' *** --> Envoie artefact=' + idAr + ' de ZE = ' + idZE + 'vers la zone de partage =' + idZP); //this.ZP.getId());
            this.envoiArtefacttoZP(socket, idAr, idZE, idZP);
            logger.debug('*** fin EVENT :' + EVENT.EnvoieArtefactdeZEversZP + ' *** ');
        }).bind(this));

        /*
         * 5 - envoie d'un artefact d'une ZP ---> ZE
         *     cet evenement est emis par une zone d'affichage (ZA) lorsqu 'un utilisateur deplace un artefact la zone commune de partage (ZP)  vers  une ZE
         *     le traitement consite a demander a la ZC de changer le conteneur de l'artifact
         *     un evenement est ensuite emis pour informer la tablette qu'elle receptionner l'artifact
         */
        socket.on(EVENT.EnvoieArtefactdeZPversZE, (function (idAr, idZE) {
            logger.info('*** EVENT : ' + EVENT.EnvoieArtefactdeZPversZE + ' ***** --> Envoie artefact ' + idAr + ' vers la zone dechange ' + idZE);
            this.envoiArtefacttoZE(socket, idAr, idZE);
            logger.debug('*** fin EVENT :' + EVENT.EnvoieArtefactdeZPversZE + ' *** ');
        }).bind(this));

        /*
         * 6 - envoie d'un artefact d'une ZE ----> EP
         *     cet evenement est envoye par une ZEp (tablette) lorsque qu'un utilisateur deplace un artefact de  sa zone d echange vers son EP
         */
        socket.on(EVENT.EnvoieArtefactdeZEversEP, (function (idAr, idZE, idZEP) {
            logger.info('*** EVENT : ' + EVENT.EnvoieArtefactdeZEversEP + ' ***** --> deplace Artifact(' + idAr + ') d une ZE (' + idZE + ')   vers la EP (' + idZEP + ')');
            this.envoiArtefacttoEP(socket, idAr, idZE, idZEP);
            logger.debug('*** fin EVENT :' + EVENT.EnvoieArtefactdeZEversEP + ' *** ');
        }).bind(this));

        /*
         * 7 - demande de deconnexion
         *     cet evenement est envoye par une ZEp (tablette) lorsque qu'un utilisateur se deconnecte
         *     la ZE de l'utilisateur est alors supprime ainsi que tous les artefacts qu'elle contient
         */
        socket.on(EVENT.SuppressZEinZP, (function (pseudo, idZE) {
            logger.info('*** EVENT : ' + EVENT.SuppressZEinZP + ' ***** --> deconnexion d une ZE (' + idZE + ')');
            var ZEaSupprimer = this.ZP.getZE(idZE);
            if (ZEaSupprimer != null) this.deconnexionZE( ZEaSupprimer);
            logger.debug('*** fin EVENT :' + EVENT.SuppressZEinZP + ' *** ');
        }).bind(this));

        /*
         * 8 - envoie d'un artefact d'une Zp ---> ZP
         *     cet evenement est envoye par une ZA depuis le menu ITAC pour transferer des artifacts d'une ZP à une autre ZP
         */
        socket.on(EVENT.EnvoieArtefactdeZPversZP, (function (idAr, idZPsource, idZPcible) {
            logger.info('*** EVENT : ' + EVENT.EnvoieArtefactdeZPversZP + ' ***** --> envoi artifact(' + idAr + ') depuis ZP(' + idZPsource + ') vers  ZP(' + idZPcible + ')');
            this.envoiArtefactZPtoZP(socket, idAr, idZPsource, idZPcible);
            logger.debug('*** fin EVENT :' + EVENT.EnvoieArtefactdeZPversZP + ' *** ');
        }).bind(this));

        /*
         * 9 - suppression d'un artefact d'une Zp
         *     cet evenement est envoye par une ZA depuis le menu ITAC pour supprimer des artifacts d'une ZP
         */
        socket.on(EVENT.ArtefactDeletedFromZP, (function (idAr) {
            logger.info('*** EVENT : ' + EVENT.ArtefactDeletedFromZP + ' ***** --> supression artifact(' + idAr + ') ');
            this.suppresArtefactFromZP(idAr);
            logger.debug('*** fin EVENT :' + EVENT.ArtefactDeletedFromZP + ' *** ');
        }).bind(this));

        /*
         * 10 - traitement de la deconnexion
         *
         */
        socket.on('disconnect', (function () {
            /*
             io.sockets.emit('count', {
             number: io.engine.clientsCount
             });
             */
            logger.info('*** EVENT : disconnect *** --> deconnexion de la socket (' + socket.id + ') ');

            // recheche de la ZE qui a declanché la deconnexion
            var ZEaSupprimer = this.ZP.getZEbySocket(socket.id);
            if (ZEaSupprimer != null) {
                // trairement de la deconnexion de'une ZE
                this.deconnexionZE( ZEaSupprimer);
            } else {
                // cas ou ce n'est pas une ZE donc  c'est la ZA qui se déconnecte
                if (this.ZP.getClientZAsocket() == socket.id )
                {
                    logger.info('=> traitementSurConnexion : attention il s agit de la ZA [Ok]');
                    // une deconnexion ZA avec des ZE encore connecté est probablement non souhaite

                    this.ZP.setClientZAreconnect(true);
                    logger.info('=> traitementSurConnexion : activation de la reconnnection ZA [Ok]');
                }
                else
                    logger.info('=> traitementSurConnexion : activation de la reconnnection ZA [Ok]');
            }
        }).bind(this));

        /*
         * 11 - Modification d'un artefact
         *     cet evenement est envoye par un client qui souhaite modifier un artefact
         *     La modification est la nouvelle version de l'artafact
         */
        socket.on(EVENT.ArtifactFullUpdate, (function (id, newArtefact, callback) {
            logger.info('*** EVENT : ' + EVENT.ArtifactFullUpdate + ' ***** --> modification d\'artefact');
            logger.debug({artifactId:id, newArtifact:newArtefact}, '*** EVENT : ' + EVENT.ArtifactFullUpdate + ' ***** --> modification d\'artefact');
            // res est null si la modification s'est bien passe, il contient une liste d'erreurs sinon
            let res = this.updateArtifact(id, newArtefact);
            // envoi de la notification
            if (callback && callback instanceof Function) {
                callback(res);
            }
            logger.info('*** fin EVENT :' + EVENT.ArtifactFullUpdate + ' *** ');
        }).bind(this));

        /*
         * 12 - Modification partielle d'un artefact
         *     cet evenement est envoye par un client qui souhaite modifier un artefact
         *     La modification est un patch JSON
         */
        socket.on(EVENT.ArtifactPartialUpdate, (function (id, patch, callback) {
            logger.info('*** EVENT : ' + EVENT.ArtifactPartialUpdate + ' ***** --> modification d\'artefact');
            logger.debug({artifactId:id, patch:patch},'*** EVENT : ' + EVENT.ArtifactPartialUpdate + ' ***** --> modification d\'artefact');
            // res est null si la modification s'est bien passe, il contient une liste d'erreurs sinon
            let res = this.patchArtifact(id, patch);
            // envoi de la notification
            if (callback && callback instanceof Function) {
                callback(res);
            }
            logger.info('*** fin EVENT :' + EVENT.ArtifactPartialUpdate + ' *** ');
        }).bind(this));

        /*
         * 13 - Modifications d'artefacts
         *     cet evenement est envoye par un client qui souhaite modifier des artefacts
         *     La modification est une liste de couples artifactId, patch : [{'id':'xxxx', 'patch': [...]}, {'id':'yyyy', 'patch': [...]}, ...]
         */
        socket.on(EVENT.ArtifactsPartialUpdates, (function (modifications, callback) {
            logger.info('*** EVENT : ' + EVENT.ArtifactsPartialUpdates + ' ***** --> modification d\'artefacts');
            logger.debug({modifications:modifications}, '*** EVENT : ' + EVENT.ArtifactsPartialUpdates + ' ***** --> modification d\'artefacts');
            // res est vide si les modifications se sont bien passee, il contient une liste de listes d'erreurs sinon
            let res = this.patchArtifacts(modifications);
            // envoi de la notification
            if (callback && callback instanceof Function) {
                callback(res);
            }
            logger.info('*** fin EVENT :' + EVENT.ArtifactsPartialUpdates + ' *** ');
        }).bind(this));
    };

    /**
     * cette fonction traite la demande de connexion d'une ZEP en creant une ZE associée si c'est possible
     * elle envoie un accuse de reception à la ZEP emmetrice dans tous les cas
     * elle envoie aussi un evenement à la zone d'affichage pour lui indiqué une nouvelle connexion
     *
     * @param {socket} socket en cours
     * @param {string} clientIp : adresse IP de la tablette
     * @param {string} pseudo
     * @param {string} posAvatar : numero avatar
     *
     * @author philippe pernelle
     * @author Stephane Talbot
     */
    demandeConnexionZE(socket, clientIp, pseudo, posAvatar, login , password ) {
        // creation de l'identifiant ZEP on choisit l'adresse IP
        var idZEP = clientIp;

        logger.info('=> demandeConnexionZE : test authentification  pour la ZEP = ' + idZEP + ' | login = ' + login+ ' | pseudo = '+pseudo);
        // recuperation de la promesse d'authentification
        let authPromise = this.getAuthentification(login,password);
        authPromise.then(
            // est appele quand la promesse est tenue (authentification OK)
            (userId)=>{
                logger.info('=> demandeConnexionZE : authentification [OK] pour le login = '+login+ ' | pseudo = '+pseudo );
                if (!this.ZP.isZAConnected()) {
                    // connexion refusé pour les ZE tant qu'il n'y a pas au moins une ZA connecté
                    socket.emit(EVENT.ReponseNOKConnexionZEP, ERROR.ConnexionZEP_Erreur1);
                    logger.info('=> demandeConnexionZE : pas de ZA connecté, envoi dun [NOK] à ZEP (' + idZEP + ')  Evenement envoyé = ' + EVENT.ReponseNOKConnexionZEP);
                    socket.disconnect(true);
                    logger.info('=> demandeConnexionZE : on force deconnexion socket ZE (' + idZEP + ') ');
                } else {
                    var idZE = this.ZP.createZE(idZEP,socket.id, true, pseudo, posAvatar, login);

                    if (idZE != null) {
                        logger.info('=> demandeConnexionZE : creation  de ZE  pour pseudo=' + pseudo +' [OK] --> idZE calcule =' + idZE );
                        // création d'une ROOM pour la ZP
                        socket.join(this.ZP.getId());
                        // emission accusé de reception
                        socket.emit(EVENT.ReponseOKConnexionZEP, idZE, idZEP);
                        logger.info('=> demandeConnexionZE : envoi AR-[OK] à ZEP (' + idZEP + ') | idZE = '+idZE+' Evenement envoyé = ' + EVENT.ReponseOKConnexionZEP);

                        // il faut emmetre à la ZA la nouvelle connexion
                        this._io.sockets.to(this.ZP.getClientZAsocket()).emit(EVENT.NewZEinZP, pseudo, idZE, idZEP, posAvatar);
                        logger.info('=> demandeConnexionZE : envoi d un evenement a la ZA (' + this.ZP.getClientZAsocket() + ') pour lui indique la nouvelle connexion   Evenement envoyé = ' + EVENT.NewZEinZP);
                    } else {
                        // disctinguer le cas ou la ZE est deja conectee du cas ou il n'y a plus d'emplacement disponible
                        if (this.ZP.getNbZE()>= this.ZP.getNbZEmax()) {var codeerr= ERROR.ConnexionZEP_Erreur2; }
                        else {var codeerr= ERROR.ConnexionZEP_Erreur4; }
                        // emission accusé de reception
                        socket.emit(EVENT.ReponseNOKConnexionZEP, codeerr);
                        logger.info('=> demandeConnexionZE : envoi AR-[NOK] à ZEP (' + idZEP + ')  Evenement envoyé = ' + EVENT.ReponseNOKConnexionZEP + ' avec '+codeerr);

                        socket.disconnect(true);
                        logger.info('=> demandeConnexionZE : on force deconnexion socket ZE (' + idZEP + ') ');
                    }
                }
                logger.debug('*** fin EVENT :' + EVENT.DemandeConnexionZEP + ' *** ');
            }).catch(
            // est appele quand la promesse n'est tenue (authentification KO)
            (raison)=>{
                socket.emit(EVENT.ReponseNOKConnexionZEP, ERROR.ConnexionZEP_Erreur3);
                logger.info('=> demandeConnexionZE : mauvaise authentification, envoi AR-[NOK] à ZEP (' + idZEP + ')  Evenement envoyé = ' + EVENT.ReponseNOKConnexionZEP + ' avec '+ERROR.ConnexionZEP_Erreur3);

                socket.disconnect(true);
                logger.info('=> demandeConnexionZE : on force deconnexion socket ZE (' + idZEP + ') ');

                logger.debug('*** fin EVENT :' + EVENT.DemandeConnexionZEP + ' *** ');
            });
    };

    /**
     * cette fonction traite la demande de connexion d'une Zone d'Affichage aui est associé au une ZP
     *
     * @param {socket} socket
     * @param {string} urldemande
     * @param {string} idZPdemande
     *
     * @author philippe pernelle
     */
    demandeConnexionZA(socket, urldemande, idZPdemande) {
        var myZC = {};
        var pseudo;
        var posAvatar;
        var lesZE;
        var lesArtifacts;

        //  cas d'une premiere connexion de ZA ou d'une reconnexion ZA
        if (!this.ZP.isZAConnected() || this.ZP.isClientZAreconnect()) {

            if (this.ZP.isClientZAreconnect()) logger.info('=> demandeConnexionZA : on traite une demande de reconnexion');

            logger.info('=> demandeConnexionZA : demande de connexion ZA Url-Demandé = ' + urldemande + ' ZP-Demandé = ' + idZPdemande);
            // création d'une ROOM pour la ZP
            socket.join(this.ZP.getId());

            // affectation de la socket de la ZA
            this.ZP.setClientZAsocket(socket.id);

            // recupération de la ZC parent
            myZC = this.ZP.ZC.getJSON();
            logger.info('=> demandeConnexionZA : demande connexion ZA [OK], ZC identifié associe a la ZP =  ' + JSON.stringify(myZC));

            // emission accusé de reception avec en JSON la ZC associé
            socket.emit(EVENT.ReponseOKConnexionZA, myZC);
            logger.info('=> demandeConnexionZA : envoi accusé de reception à ZA (' + this.ZP.getClientZAsocket() + ')  Evenement envoyé= ' + EVENT.ReponseOKConnexionZA);

            // cas spécifique d'une re-connexion
            if (this.ZP.isClientZAreconnect())
            {
                // on ferme le flag de reconnexion
                this.ZP.setClientZAreconnect(false);

                // lancement du repeuplement ZP et ZE
                this.repeuplementZA(socket,constant.type.repeuplement.ZPetZE);

            }

            // cas spécifique d'un load
            if (this.ZP.loadSession)
            {
                // on ferme le flag de reconnexion
                this.ZP.loadSession=false;

                // lancement du repeuplement ZP et ZE
                this.repeuplementZA(socket,constant.type.repeuplement.uniquementZP);

            }
        }
        else {
            logger.info('=> demandeConnexionZA : demande de connexion ZA refusé, déja connecté');
            // emission accusé de reception
            socket.emit(EVENT.ReponseNOKConnexionZA, myZC);
            logger.info('=> demandeConnexionZA : envoi accusé de reception à ZA (' + this.ZP.getClientZAsocket() + ')  Evenement envoyé= ' + EVENT.ReponseNOKConnexionZA);
            socket.disconnect(true);
            logger.info('=> demandeConnexionZA : on force deconnexion socket ZA (' + this.ZP.getClientZAsocket() + ') ');
        }
    };

    /**
     * cette fonction traite l'envoie d'un artefact de la Zone d'Echange vers la zone de partage
     *
     * @param {socket} socket
     * @param {number} idAr
     * @param {string} IdZP
     * @param {string} artefact
     *
     * @author philippe pernelle
     */
    envoiArtefacttoZE(socket, idAr, idZE) {
        // cette fonction traite un changement de conteneur d'une ZP vers une ZE
        if (this.ZP.sendArFromZPtoZE(idAr, idZE))
        {
            // il faut informer aussi la ZEP qui doit ajouter cet Artifact a sa zone
            // on recupere la socket de associe a la ZE
            var id = this.ZP.getZE(idZE).getIdSocket();
            var artifactenjson = JSON.stringify(this.ZP.ZC.getArtifact(idAr));
            this._io.sockets.to(id).emit(EVENT.EnvoieArtefactdeZPversZE, artifactenjson);

        };

    };

    /**
     * cette fonction traite l'envoie d'un artefact d'une Zone d'Echange (ZE) vers la zone de partage (ZP)
     * en fait l'artéfact reste dans sa zone collaborative mais change de conteneur.
     * cette fonction est déclanché par une interaction en ZA, il faut donc aussi informer
     * la tablette
     *
     * @param {socket} socket
     * @param {number} idAr
     * @param {string} idZE
     * @param {string} idZP
     * @author philippe pernelle
     */
    envoiArtefacttoZP(socket, idAr, idZE, idZP) {
        // cette fonction traite un changement de conteneur d'une ZE vers la ZP
        this.ZP.sendArFromZEtoZP(idAr, idZP);
        // il faut informer la ZEP qui doit le suprimer de son ZEP
        //on recupere l'ID de la socket ou la tablette est connecté
        var id = this.ZP.getZE(idZE).getIdSocket();
        // dans ce cas on indique juste artefact et la ZE
        // pas besoin de donner la ZP
        this._io.sockets.to(id).emit(EVENT.EnvoieArtefactdeZEversZP, idAr, idZE);
    };

    /**
     * cette fonction traite la reception d'un artefact de la Zone d'Echange Personnelle vers la zone d'Echange
     *
     * @param {socket} socket
     * @param {string} idZEP
     * @param {string} IdZE
     * @param {string} artefactenjson
     *
     * @author philippe pernelle
     */
    receptionArtefactIntoZE(socket, pseudo, idZEP, idZE, artefactenjson) {
        logger.info('=> receptionArtefactIntoZE : reception Artefact en json =', artefactenjson);
        // transfert de l'artifact à la ZC et association de cet artefact à la ZE associée à la ZEP
        var newidAr = this.ZP.addArtifactFromZEPtoZE(pseudo, idZEP, idZE, artefactenjson);

        // verifier si le test est correct quand artefact envoyé avec id

        if (newidAr !== 0) {
            // retour à la ZEP pour mettre à jour les données de l'artefact
            var chaineJSON = JSON.stringify(this.ZP.ZC.getArtifact(newidAr));
            // à la place de la chaine on envoie l'idard dans acquittement pour la tablette
            socket.emit(EVENT.ReceptionArtefactIntoZE, pseudo, idZE, newidAr);
            logger.info('=> receptionArtefactIntoZE : envoi à ZE [EVT_ReceptionArtefactIntoZE]  (' + idZE + ") ");
            // envoi d'un evenement pour mettre à jour le client ZA, s'il est connecté
            if (this.ZP.isZAConnected()) {
                //sockets.connected(this.clientIHMsocket).emit(EVENT.NewArtefactInZE, pseudo, idZE ,chaineJSON);
                this._io.sockets.to(this.ZP.getClientZAsocket()).emit(EVENT.ReceptionArtefactIntoZE, pseudo, idZE, chaineJSON);
                logger.info('=> receptionArtefactIntoZE : envoi à IHM [EVT_ReceptionArtefactIntoZE]  (' + idZE + ") --->" + chaineJSON);
            } else {
                logger.info('=> receptionArtefactIntoZE : pas d IHM pour [EVT_ReceptionArtefactIntoZE] ');
            }
        }
    };

    /**
     * cette fonction traite la réception d'un artefact de la Zone d'Echange Personnelle (ZEP) vers la zone de partage (ZP)
     *
     * @param {socket} socket
     * @param {string} idZEP
     * @param {string} IdZE
     * @param {string} artefactenjson
     *
     * @author philippe pernelle
     */
    receptionArtefactIntoZP(socket, pseudo, idZEP, idZE, artefactenjson) {
        console.log('    ---- socket : reception depuis une ZEP (' + idZEP + ') artifact =', artefactenjson);
        // transfert de l'artifact à la ZC et association de cet artefact à la ZE associée
        var newidAr = this.ZP.addArtifactFromZEPtoZP(pseudo, idZEP, idZE, artefactenjson);
        logger.info('=> receptionArtefactIntoZP : reception depuis une ZEP (' + idZEP + ') idArtifact [Ok] =', newidAr);
        if (newidAr !== 0) {
            // retour à la ZEP pour mettre à jour les données de l'artefact
            var chaineJSON = JSON.stringify(this.ZP.ZC.getArtifact(newidAr));
            // à la place de la chaine on envoie l'idard dans acquittement pour la tablette
            socket.emit(EVENT.ReceptionArtefactIntoZP, pseudo, this.ZP.getId(), newidAr);
            logger.info('=> receptionArtefactIntoZP : envoi à ZEP [EVT_ReceptionArtefactIntoZP]  (' + this.ZP.getId() + ") --> " + chaineJSON);
            // envoi d'un evenement pour mettre à jour le client associé à la ZP, s'il est connecté
            if (this.ZP.isZAConnected()) {
                //demande de david envoie lasteZE
                var lastZE=idZE;
                this._io.sockets.to(this.ZP.getClientZAsocket()).emit(EVENT.ReceptionArtefactIntoZP, lastZE, this.ZP.getId(), chaineJSON);
                logger.info('=> receptionArtefactIntoZP : envoi à IHM [EVT_ReceptionArtefactIntoZP] LASTZE('+lastZE+') ZP(' + this.ZP.getId() + ") --> " + chaineJSON);
            } else {
                logger.info('=> receptionArtefactIntoZP : pas d IHM pour [EVT_ReceptionArtefactIntoZP] ');
            }
        }
    };


    /**
     * cette fonction envoi un artifact de la ZE vers EP (l'espace personnelle de la tablette)
     * pour cela on efface l'artefact de la ZC et on envoie à la ZA associé l'information
     *
     * @public
     *
     * @param {idAr}    artefact
     * @param {idZE}    identifiant de la ZE associé à la ZEP
     * @param {idZEP}   identifiant de la tablette ZEP
     *
     * @author philippe pernelle
     */
    envoiArtefacttoEP(socket, idAr, idZE, idZEP) {

        if (idAr == null) {
            logger.error('=> envoiArtefacttoEP : erreur envoie vers EP idArt est null');
        } else {
            logger.info("=> envoiArtefacttoEP : sendArFromZEPtoEP avec idArt " + idAr + " de ZE = " + idZE + " ---  vers " + idZEP);
            // en fait on efface l artefact de la ZP, ZE
            this.ZP.sendArFromZEPtoEP(idAr, idZE, idZEP);

            // acquittement pour stepahen
            socket.emit(EVENT.ArtefactDeletedFromZE, idZE, idAr);
            logger.info('=> envoiArtefacttoEP : envoi à ZEP ['+EVENT.ArtefactDeletedFromZE+']  (' + this.ZP.getId() + ") --> artefact id= "+idAr );

            // envoi d'un evenement pour mettre à jour le client ZA, s'il est connecté
            if (this.ZP.isZAConnected()) {
                this._io.sockets.to(this.ZP.getClientZAsocket()).emit(EVENT.ArtefactDeletedFromZE, idAr, idZE, idZEP);

                logger.info("=> envoiArtefacttoEP : envoie art " + idAr + " de ZE = " + idZE + " POUR IHM = ---  vers " + idZEP);
            } else {
                logger.info('=> envoiArtefacttoEP : pas d IHM pour [EVT_ArtefactDeletedFromZE] ');
            }
        }
    };

    /**
     * cette fonction envoi un artifact de la ZP source vers la ZP cible
     */
    envoiArtefactZPtoZP(socket, idAr, idZPsource, idZPcible) {
        var transfert = false;
        var ZPcible = null;
        var artifact = {};
        if (idAr == null) {
            logger.info('=> envoiArtefactZPtoZP : : erreur envoie ZP vers ZP,  idArt est null');
        } else {
            ZPcible = this.ZP.ZC.getZP(idZPcible);
            if (ZPcible != null) {
                if (ZPcible.isZAConnected()) {
                    this.ZP.ZC.transfertArtefactZPtoZP(idAr, idZPsource, idZPcible);
                    transfert = true;
                    artifact = this.ZP.ZC.getArtifact(idAr);
                    // marche pas pas la bonne socket
                    ZPcible.server._io.sockets.to(ZPcible.getClientZAsocket()).emit(EVENT.ReceptionArtefactIntoZP, '', ZPcible.getId(), JSON.stringify(artifact));
                }
            }
            if (!transfert) {
                socket.emit(EVENT.ReponseNOKEnvoie_ArtefactdeZPversZP, idAr);
                logger.info("=> envoiArtefactZPtoZP : envoie art [NO]" + idAr + " de ZP = " + idZPsource + " POUR IHM = ---  vers " + idZPcible);
            } else {
                socket.emit(EVENT.ReponseOKEnvoie_ArtefactdeZPversZP, idAr);
                logger.info("=> envoiArtefactZPtoZP : envoie art [OK] " + idAr + " de ZP = " + idZPsource + " POUR IHM = ---  vers " + idZPcible);
            }
        }
    };

    /**
     * cette fonction supprime un artifact de la zone collaborative
     *
     * @param {socket} socket   identifiantde la socket
     * @param {string} idAr     identifiant de l'artefact a supprimer
     *
     * @author philippe pernelle
     */
    suppresArtefactFromZP( idAr) {
        logger.debug("=> suppresArtefactFromZP : surpression artefact de la ZC=" + this.ZP.ZC.getId());
        if (idAr == null) {
            logger.error("=> suppresArtefactFromZP : erreur pas d Artefact a supprimer,  idArt est null");
        } else {
            if (this.ZP.ZC.delArtifact(idAr)) {
                logger.debug("=> suppresArtefactFromZP : surpression artefact [OK]" + idAr + " ");
            } else {
                logger.debug("=> suppresArtefactFromZP : surpression artefact [NOK]" + idAr + " ");
            }
        }
    };

    /**
     * Cette fonction traite la deconnexion d'une ZE . Elle supprime la ZE et tous les artefact contenu et
     * informe la ZA
     *
     * @param {socket} socket - identifiant de la socket connecté
     * @param {string} pseudo - pseudo connecté
     * @param {string} idZE - identifiant de la ZE à deconnecter
     *
     * @author philippe pernelle
     */
    deconnexionZE(myZE) {

        var idZE = myZE.getId();
        var artefact2ZP = [];

        logger.info('=> deconnexionZE : lancement de la suppression de la ZE =' + idZE +' pour la ZP courante ='+this.ZP.getId());
        this.ZP.destroyZE(idZE);

        logger.info('=> deconnexionZE : lancement du transfert des artefact de la ZE =' + idZE +' pour la ZP courante ='+this.ZP.getId());
        artefact2ZP = this.ZP.ZC.transfertAllArtifactsInZP(idZE,this.ZP.getId());

        // envoi d'un evenement pour mettre à jour le client ZA, s'il est connecté
        if (this.ZP.isZAConnected()) {


            this._io.sockets.to(this.ZP.getClientZAsocket()).emit(EVENT.SuppressZEinZP, "", idZE);
            logger.debug('=> deconnexionZE : event suppression de ZE (' + idZE + ") pour la ZA [OK]" );

            for (var i = 0 ; i < artefact2ZP.length ; i++) {
                this._io.sockets.to(this.ZP.getClientZAsocket()).emit(EVENT.ReceptionArtefactIntoZP, idZE,this.ZP.getId(),JSON.stringify(this.ZP.ZC.getArtifact(artefact2ZP[i])));
                logger.debug('=> deconnexionZE : event ZE2ZP pour artefact (' + artefact2ZP[i] + ") envoye à la ZA " );
            }

        }
        else {
            logger.debug('=> deconnexionZE : pas de ZA connecté connecté pour recevoir ' + EVENT.SuppressZEinZP );
        }
        logger.info('=> deconnexionZE : fin du traitement de deconnexin pour la ZE = '+idZE);
    };

    /**
     * Cette fonction permet de repeupler une ZA
     *
     * @param {constante} type  - type de repeuplement
     *
     * @author philippe pernelle
     */
    repeuplementZA( socket,type) {

        var lesZE;
        var lesArtifacts;
        //var socket=this.ZP.clientZAsocket;

        if (type == constant.type.repeuplement.ZPetZE) {
            // on recupere toutes les ZE encore connecté
            lesZE = this.ZP.getAllZE();
            logger.info('=> repeuplementZA : lancement re-activation des ZE nb=' + lesZE.length);

            // pour chaque ZE, on emet un evenement de connexion pour la ZA
            lesZE.forEach((function (item, key, mapObj) {
                socket.emit(EVENT.NewZEinZP, item.getPseudo(), item.getId(), item.getIdZEP(), item.getPosAvatar());
                logger.info('=> repeuplementZA : re-activation des ZE -> envoi d un evenement a la ZA (' + this.ZP.getClientZAsocket() + ') pour lui indique la reconnexion  | Evenement envoyé= ' + EVENT.NewZEinZP);
            }).bind(this));

        }

        if (type == constant.type.repeuplement.ZPetZE || type == constant.type.repeuplement.uniquementZP) {
            // on recupere tous les artefacts encore présent en ZC ( soit en ZE ou en ZP)
            lesArtifacts = this.ZP.getALLArtifacts();
            logger.info('=> demandeConnexionZA : demande de connexion ZA (une demande de reconnexion) -> lancement re-activation des artefacts nb=' + lesArtifacts.size);

            // pour chaque artefacts, on emet levenement pour la ZE ou la ZP selon ou il se trouve
            lesArtifacts.forEach((function (item, key, mapObj) {
                var chaineJSON = JSON.stringify(item);
                logger.debug('=> demandeConnexionZA : re-activation des artefacts : traitement de l artefact ===>' + chaineJSON);

                logger.debug('=> demandeConnexionZA : re-activation des artefacts : conteneur artefact =' + item.getTypeContainer());

                // si l'artefact est en ZP
                if (item.isInto(this.ZP.getId(), constant.type.container.ZP))    {
                    socket.emit(EVENT.ReceptionArtefactIntoZP, "", this.ZP.getId(), chaineJSON);
                    logger.debug('=> demandeConnexionZA : re-activation des artefact dans la ZP (' + this.ZP.getId() + ') | Evenement envoyé= ' + EVENT.ReceptionArtefactIntoZP);
                }

                // sinon l'artefact est en ZE et on veut un repeuplement aussi de ZE
                else if (type == constant.type.repeuplement.ZPetZE){
                    logger.debug('=> demandeConnexionZA : re-activation des artefact dans la ZE (' + item.getIdContainer() + ') ');
                    var maZE = this.ZP.getZE(item.getIdContainer());
                    if (maZE == null) {
                        logger.error('=> demandeConnexionZA : impossible recuperer ZE de l artefact  (' + item.getIdContainer() + ') ');
                    }
                    else {
                        socket.emit(EVENT.ReceptionArtefactIntoZE, maZE.getPseudo(), maZE.getId(), chaineJSON);
                        logger.info('=> demandeConnexionZA : re-activation des ZE -> envoi d un evenement a la ZA (' + this.ZP.getClientZAsocket() + ') pour lui indique la reconnexion  | Evenement envoyé= ' + EVENT.ReceptionArtefactIntoZE);
                    }
                }
            }).bind(this));

        }
    }

    /**
     * Retourne un artefact identifie par son id
     *
     * @param {String} id - artifact id
     * @returns {Artifact} artefact recherche
     *
     * @author Stephane Talbot
     */
    getArtifact(id){
        return this.ZP.getArtifact(id);
    }

    /**
     * Applique une liste de modifications aux artefacts.
     * La liste de modifications est une liste de couples artifactId, patch :
     * [{'id':'xxxx', 'patch': [...]}, {'id':'yyyy', 'patch': [...]}, ...]
     *
     * @param modifications
     * @return {Array.<Array>} liste de problemes lors de l'application du patch (empty si pas de pb)
     *
     * @author Stephane Talbot
     */
    patchArtifacts(modifications){
        let res = [];
        try {
            //let modifs = JSON.parse(modifications);
            let modifs = modifications;
            logger.debug({modif: modifs}, "=> patchArtifacts : debut application modifications");
            if (modifs && modifs instanceof Array) {
                logger.debug({modif: modifs}, "=> patchArtifacts : modifications est un tableau [OK]");
                // validation des modifications
                modifs.forEach(({id, patch}) => {
                    let artifact = this.getArtifact(id);
                    let validation = ["Unknown artifact "+id];
                    if (artifact) {
                        validation = artifact.validatePatch(patch);
                    } else {
                        logger.debug({artifactId: id, patch: patch}, "=> patchArtifacts : artifact non trouve : %s", id);
                    }
                    if (validation) res.push(validation);
                });
                if (res.length === 0) {
                    modifs.forEach(({id, patch}) => {
                        try {
                            let artifact = this.getArtifact(id);
                            if (artifact) {
                                artifact.patch(patch);
                            }
                        } catch (err) {
                            logger.error(err, "=> patchArtifacts : probleme lors de l'application du patch sur l'artifact : %s", id, patch);
                        }
                    });
                } else {
                    logger.error({errors: res}, "=> patchArtifacts : liste de modifications non valides : %s", modifications);
                }
            }
        } catch (err) {
            logger.error({err:err, modifications:modifications}, "=> patchArtifacts : probleme lors de la lecture des modifications");
        }
        return res;
    }

    /**
     * Applique un patch JSON a un artefact.
     *
     * @param {String} id - artifcat id
     * @param patch - patch JSON
     * @return problemes lors de l'application du patch (undefined si pas de pb)
     *
     * @author Stephane Talbot
     */
    patchArtifact(id, jsonPatch){
        let res = undefined;
        try {
            //let patch = JSON.parse(jsonPatch);
            let patch = jsonPatch;
            logger.debug({artifactId: id, patch: patch}, "=> patchArtifact : debut application modifications");
            let artifact = this.getArtifact(id);
            let res = ["Unknown artifact " + id];
            if (artifact) {
                res = artifact.validatePatch(patch);
                if (!res) {
                    try {
                        artifact.patch(patch);
                        console.log('---------------------------=====================--------------------')
                        console.log(artifact)
                        console.log('---------------------------=====================--------------------')
                    } catch (err) {
                        logger.error({err: err, artifactId: id, patch: patch},
                            "=> patchArtifact : probleme lors de l'application du patch sur l'artifact : %s", id);
                    }
                } else {
                    logger.error({errors: res}, "=> patchArtifact : JSON path non valides : %s");
                }
            } else {
                logger.debug({artifactId: id, patch: patch}, "=> patchArtifact : artifact non trouve : %s", id);
            }
        } catch (err) {
            logger.error({err:err, patch:jsonPatch}, "=> patchArtifacts : probleme lors de la lecture des modifications");
        }
        return res;
    }

    /**
     * Mise a jour complete d'un artefact.
     *
     * @param {String} id - artifcat id
     * @param newArtifact - nouvel artefact
     * @return probleme lors de l'application de la mise a jour (ou null si pas de pb)
     *
     * @author Stephane Talbot
     */
    updateArtifact(id, myNewArtifact){
         let res;
        try {
            //let newArtifact = JSON.parse(myNewArtifact);
              let newArtifact = myNewArtifact;
            logger.debug({artifactId:id, newArtifact:newArtifact}, "=> updateArtifact : debut application modifications");
            let artifact = this.getArtifact(id);
            try {
                if (artifact) {
                    artifact.updateFromJSON(newArtifact);
                } else {
                    logger.debug({artifactId: id, newArtifact: newArtifact}, "=> updateArtifact : artifact non trouve : %s", id);
                }
            } catch (err) {
                logger.error({err: err, artifactId: id, newArtifact: newArtifact}, "=> updateArtifact : probleme lors de l'application du modifications sur l'artifact : %s", id);
            }
        } catch (err) {
            logger.error({err:err, newArtifact:myNewArtifact}, "=> updateArtifact : probleme lors de la lecture des modifications");
        }
        return res;
    }

    /**
     * @callback closeCallback
     * @param  {Error} err - Erreur qui s'est produite lors de la fermeture ou rien si tout s'est bien passe.
     */
    /**
     * Methode permetant de fermer le serveur.
     * Elle ferme toutes les socketes clientes avant d'arreter la sockt serveur
     *
     * @param {closeCallback} callback - callback appele apres la fermeture de la socket serveur
     *
     * @author Stephane Talbot
     */
    close(callback){
        let port = this.port;
        let io = this._io;
        logger.info('=> fermeture des listeners');
        // tentative de fermeture de sockets clientes ?
        if (this._io.sockets.connected) {
            Object.keys(io.sockets.sockets).forEach((socket) => {
                io.sockets.sockets[socket].disconnect(true);
            });
        }
        // fermeture de la socket serveur
        logger.debug('=> fermeture de la socket sur le port %d', port);
        this._io.close((err) => {
            if (err) {
                logger.debug(err, '=> erreur lors fermeture de la socket sur le port %d', port);
            } else {
                logger.debug('=> fermeture de la socket sur le port %d : 0K', port);
            }
            // appel du callback
            if (callback && callback instanceof Function) {
                callback(err);
            }
        });
     }
};
