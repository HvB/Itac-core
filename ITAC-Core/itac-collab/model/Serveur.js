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
     * fonction permettant de tester un login et un mot de passe
     *
     * @param {string} login
     * @param {string} password
     *
     * @return {iduser} id user ou undefined
     *
     * @autor philippe pernelle
     */
    getAuthentification (login, password)
    {
        // recuperation de la fabrique associé à la session
        var auth = this.ZP.ZC.session.authIds;

        // appek du test d'authentification
        var iduser=auth.verifyCredentialSync(auth.createCredential(login,password))

        // retourne vrai ou faux
        return !(iduser===undefined);
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
            this.demandeConnexionZE(socket, clientIp, pseudo, posAvatar,login,password);
            logger.debug('*** fin EVENT :' + EVENT.DemandeConnexionZEP + ' *** ');
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
            this.deconnexionZE(idZE);
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
     */
    demandeConnexionZE(socket, clientIp, pseudo, posAvatar, login , password) {


        // creation de l'identifiant ZEP on choisit l'adresse IP
        var idZEP = clientIp;

        logger.info('=> demandeConnexionZE : test authentification  pour la ZEP= ' + idZEP + ' avec le pseudo= ' + pseudo);
        if (!this.getAuthentification(login,password))
        {
            socket.emit(EVENT.ReponseNOKConnexionZEP, ERROR.ConnexionZEP_Erreur3);
            logger.info('=> demandeConnexionZE : mauvaise authentification, envoi dun [NOK] à ZEP (' + idZEP + ')  Evenement envoyé= ' + EVENT.ReponseNOKConnexionZEP);
        }
        else
        {
            logger.info('=> demandeConnexionZE :  authentification [OK] pour le login ='+login );
            if (!this.ZP.isZAConnected()) {
                // connexion refusé pour les ZE tant qu'il n'y a pas au moins une ZA connecté
                socket.emit(EVENT.ReponseNOKConnexionZEP, ERROR.ConnexionZEP_Erreur1);
                logger.info('=> demandeConnexionZE : pas de ZA connecté, envoi dun [NOK] à ZEP (' + idZEP + ')  Evenement envoyé= ' + EVENT.ReponseNOKConnexionZEP);
                socket.disconnect();
                logger.info('=> demandeConnexionZE : on force deconnexion socket ZE (' + idZEP + ') ');
            } else {


                var idZE = this.ZP.createZE(idZEP,socket.id, true, pseudo, posAvatar, login, password);

                if (idZE != null) {
                    logger.info('=> demandeConnexionZE : creation  de ZE  pour pseudo=' + pseudo +' [OK] --> idZE calcule =' + idZE );
                    // création d'une ROOM pour la ZP
                    socket.join(this.ZP.getId());
                    // emission accusé de reception
                    socket.emit(EVENT.ReponseOKConnexionZEP, idZE, idZEP);
                    logger.info('=> demandeConnexionZE : envoi accusé de reception à ZEP (' + idZEP + ') | idZE = '+idZE+' Evenement envoyé= ' + EVENT.ReponseOKConnexionZEP);

                    // il faut emmetre à la ZA la nouvelle connexion
                    this._io.sockets.to(this.ZP.getClientZAsocket()).emit(EVENT.NewZEinZP, pseudo, idZE, idZEP, posAvatar);
                    logger.info('=> demandeConnexionZE : envoi d un evenement a la ZA (' + this.ZP.getClientZAsocket() + ') pour lui indique la nouvelle connexion   Evenement envoyé= ' + EVENT.NewZEinZP);
                } else {
                    logger.info('=> demandeConnexionZE : creation de ZE  pour ' + pseudo + ' ' + idZEP + ' [NOK]');
                    // emission accusé de reception
                    socket.emit(EVENT.ReponseNOKConnexionZEP, ERROR.ConnexionZEP_Erreur2);
                    logger.info('=> demandeConnexionZE : envoi accusé de reception à ZEP (' + idZEP + ')  Evenement envoyé= ' + EVENT.ReponseNOKConnexionZEP);
                    socket.disconnect();
                    logger.info('=> demandeConnexionZE : on force deconnexion socket ZE (' + idZEP + ') ');
                }
            }
        }
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

        // on ajoute le cas ou la ZA s'est accidentellement déconnecté
        if (!this.ZP.isZAConnected() || this.ZP.isClientZAreconnect()) {

            if (this.ZP.isClientZAreconnect())  console.log('    ---- socket : demande de connexion ZA --> on traite  une demande de reconnexion');

            logger.info('=> demandeConnexionZA : demande de connexion ZA Url-Demandé = ' + urldemande + ' ZP-Demandé = ' + idZPdemande);
            // création d'une ROOM pour la ZP
            socket.join(this.ZP.getId());

            // affectation de la socket courante
            this.ZP.setClientZAsocket(socket.id);

            myZC = this.ZP.ZC.getJSON();
            logger.info('=> demandeConnexionZA : demande connexion ZA [OK], ZC identifié associe a la ZP =  ' + JSON.stringify(myZC));
            // emission accusé de reception avec en JSON la ZC associé
            socket.emit(EVENT.ReponseOKConnexionZA, myZC);
            logger.info('=> demandeConnexionZA : envoi accusé de reception à ZA (' + this.ZP.getClientZAsocket() + ')  Evenement envoyé= ' + EVENT.ReponseOKConnexionZA);

            if (this.ZP.isClientZAreconnect())
            {

                this.ZP.setClientZAreconnect(false);

                lesZE = this.ZP.getAllZE();
                logger.info('=> demandeConnexionZA : demande de connexion ZA (une demande de reconnexion) -> lancement re-activation des ZE nb='+lesZE.length);

                lesZE.forEach((function (item, key, mapObj) {
                    socket.emit(EVENT.NewZEinZP, item.getPseudo(), item.getId(), item.getIdZEP(), item.getPosAvatar());
                    logger.info('=> demandeConnexionZA : re-activation des ZE -> envoi d un evenement a la ZA (' + this.ZP.getClientZAsocket() + ') pour lui indique la reconnexion  | Evenement envoyé= ' + EVENT.NewZEinZP);
                }).bind(this));



                lesArtifacts = this.ZP.getALLArtifacts();
                logger.info('=> demandeConnexionZA : demande de connexion ZA (une demande de reconnexion) -> lancement re-activation des artefacts nb='+lesArtifacts.size);
                lesArtifacts.forEach((function (item, key, mapObj) {
                    var chaineJSON = JSON.stringify(item);
                    logger.debug('=> demandeConnexionZA : re-activation des artefacts : traitement de l artefact ===>'+chaineJSON);

                    logger.debug('=> demandeConnexionZA : re-activation des artefacts : conteneur artefact ='+item.getTypeContainer());
                    // à la place de la chaine on envoie l'idard dans acquittement pour la tablette
                    if (item.isInto(this.ZP.getId(),constant.type.container.ZP))
                    {
                        socket.emit(EVENT.ReceptionArtefactIntoZP, "", this.ZP.getId(),chaineJSON);
                        logger.debug('=> demandeConnexionZA : re-activation des artefact dans la ZP (' + this.ZP.getId() + ') | Evenement envoyé= ' + EVENT.ReceptionArtefactIntoZP);
                    }

                    // il faut emmetre à la ZA la nouvelle connexion
                    else {
                        logger.debug('=> demandeConnexionZA : re-activation des artefact dans la ZE (' + item.getIdContainer() + ') ');
                        var maZE= this.ZP.getZE(item.getIdContainer());
                        if (maZE == null)
                        {
                            logger.error('=> demandeConnexionZA : impossible recuperer ZE de l artefact  (' + item.getIdContainer() + ') ');
                        }
                        else
                        {
                            socket.emit(EVENT.ReceptionArtefactIntoZE, maZE.getPseudo(),maZE.getId() , chaineJSON);
                            logger.info('=> demandeConnexionZA : re-activation des ZE -> envoi d un evenement a la ZA (' + this.ZP.getClientZAsocket() + ') pour lui indique la reconnexion  | Evenement envoyé= ' + EVENT.ReceptionArtefactIntoZE);

                        }



                    }

                    /*
                     if (item.isInto(idZE, TYPE.container.ZE)) {
                     logger.info('=> tansfertAllArtifactsInZP : suppression artefacts Id=' + item.getId());

                     this.setArtifactIntoZP(item.getId(),idZP)
                     }
                     */
                }).bind(this));
            }
        }
        else {
            logger.info('=> demandeConnexionZA : demande de connexion ZA refusé, déja connecté');
            // emission accusé de reception
            socket.emit(EVENT.ReponseNOKConnexionZA, myZC);
            logger.info('=> demandeConnexionZA : envoi accusé de reception à ZA (' + this.ZP.getClientZAsocket() + ')  Evenement envoyé= ' + EVENT.ReponseNOKConnexionZA);
            socket.disconnect();
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
                //sockets.connected(this.clientIHMsocket).emit(EVENT.NewArtefactInZE, pseudo, idZE ,chaineJSON);
                this._io.sockets.to(this.ZP.getClientZAsocket()).emit(EVENT.ReceptionArtefactIntoZP, pseudo, this.ZP.getId(), chaineJSON);
                logger.info('=> receptionArtefactIntoZP : envoi à IHM [EVT_ReceptionArtefactIntoZP]  (' + this.ZP.getId() + ") --> " + chaineJSON);
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
                if (ZPcible.server.isZAConnected()) {
                    this.ZP.ZC.transfertArtefactZPtoZP(idAr, idZPsource, idZPcible);
                    transfert = true;
                    artifact = this.ZP.ZC.getArtifact(idAr);
                    // marche pas pas la bonne socket
                    ZPcible.server._io.sockets.to(ZPcible.server.getSocketZA()).emit(EVENT.ReceptionArtefactIntoZP, '', ZPcible.getId(), JSON.stringify(artifact));
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

            for (var i = 0 ; i < artefact2ZP.length ; i++) {
                this._io.sockets.to(this.ZP.getClientZAsocket()).emit(EVENT.EnvoieArtefactdeZEversZP, artefact2ZP[i], idZE);
                logger.debug('=> deconnexionZE : event ZE2ZP pour artefact (' + artefact2ZP[i] + ") envoye à la ZA " );
            }

            this._io.sockets.to(this.ZP.getClientZAsocket()).emit(EVENT.SuppressZEinZP, "", idZE);
            logger.debug('=> deconnexionZE : event suppression de ZE(' + idZE + ") pour la ZA [OK]" );

        }
        else {
            logger.debug('=> deconnexionZE : pas de ZA connecté connecté pour recevoir ' + EVENT.SuppressZEinZP+ ' et '+EVENT.EnvoieArtefactdeZEversZP);
        }
    };

    close(callback){
        let port = this.port;
        logger.info('=> fermeture de la socket sur le port %d', port);
        this._io.close((err)=>{
            if (err){
                logger.error(err, '=> erreur lors fermeture de la socket sur le port %d', port);
            } else {
                logger.info('=> fermeture de la socket sur le port %d : 0K', port);
            }
            if (callback && callback instanceof Function) {
                callback(err);
            }
        });
    }
};
	

	
