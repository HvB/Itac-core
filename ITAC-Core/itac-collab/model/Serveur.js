var http = require('http');
var fs = require('fs');
var util = require("util");
var ZP = require('./ZonePartage');
var ZC = require("./ZoneCollaborative");
var constant = require('../constant');
var ERROR = constant.error;
var EVENT = constant.event;

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
        /**
         * liste d'identifiant des sockets des zone d'échange ZE connectées
         */
        this.clientZEsocket = [];
        /**
         * liste d'identifiant des zones d'échange ZE connectées
         */
        this.clientZEid = [];
        /**
         * identifiant de la socket de la zone d'affichage ZA
         */
        this.clientZAsocket = 0;

        // lancement serveur socket
        console.log("       ---- Creation d'un serveur pour la ZP (" + ZP.getId() + ") sur le port " + port);
        var srv = http.createServer();
        srv.listen(this.port, function () {
            console.log("       ---- Serevur en ecoute sur %d", port);
        });
        this._io = require('socket.io').listen(srv, function () {
            console.log('    ---- Socket en ecoute sur port ' + port);
        });
        this._io.origins('*:*');
        console.log('       ---- Socket [ok] ');

        // declenchement de la fonction de traitement à l'arrivee d'une demande de connexion de socket d'une tablette :EVENT.ConnexionSocketZEP
        this._io.sockets.on('connection', (function (socket) {
            console.log('    --------------------------------------------------------------------------------');
            console.log('    ---- Arrive d une demande de connection --- SOCKET ID=' + socket.id + ' ---');
            console.log('    --------------------------------------------------------------------------------');
            this.traitementSurConnexion(socket);
        }).bind(this));
    }

    /**
     *  retour l'identifiant de soket de la zone d'affichage
     */
    getSocketZA() {
        return this.clientZAsocket;
    };


    /**
     *  Indique si la ZA est connecté à la socket
     */
    isZAConnected() {
        return (this.clientZAsocket !== 0);
    };

    /**
     * fonction retournant l'identifiant de la socket associé à une ZE
     * qui est connectée au serveur
     *
     * @param idZE
     * @return identifiant socket
     *
     * @autor philippe pernelle
     */
    getZESocketId(idZE) {
        var ret = null;
        for (var i = 0; i < this.clientZEid.length; i++) {
            if (this.clientZEid[i] === idZE) {
                ret = this.clientZEsocket[i];
            }
        }
        return ret;
    };

    /**
     * fonction retournant l'identifiant de la ZE
     * qui est connectée au serveur en fonction de son idsocket
     *
     * @param idsocket identifiant socket
     * @return identifiant ZE
     *
     * @autor philippe pernelle
     */
    getZEbySocketId(idsocket) {
        var ret = null;
        for (var i = 0; i < this.clientZEsocket.length; i++) {
            if (this.clientZEsocket[i] === idsocket) {
                ret = this.clientZEid[i];
            }
        }
        return ret;
    };

    /**
     * fonction supprimmant une ZE de la liste par son idZE
     *
     * @param idsocket identifiant socket
     *
     * @autor philippe pernelle
     */
    removeZEbyId(idZE) {
        for (var i = 0; i < this.clientZEid.length; i++) {
            if (this.clientZEid[i] === idZE) {
                this.clientZEid.splice(i, 1);
                this.clientZEsocket.splice(i, 1);
            }
        }
    };


    /**
     * fonction supprimmant une ZE de la liste par son socketID
     *
     * @param idsocket identifiant socket
     *
     * @autor philippe pernelle
     */
    removeZEbySocketId(idsocket) {
        for (var i = 0; i < this.clientZEsocket.length; i++) {
            if (this.clientZEsocket[i] === idsocket) {
                this.clientZEid.splice(i, 1);
                this.clientZEsocket.splice(i, 1);
            }
        }
    };

    /**
     * fonction de traitement des evenements de la socket ZEP+ZA
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
        console.log('    ---- Server.js : TraitementSurConnexion - evenement en provenance de l adresse = ' + clientIp);

        //var tt= util.inspect(socket.handshake);
        //console.log(tt);

        /*
         * 0 - Demande de connexion d'une ZA
         *     Cet evenement est normalement émis par une Zone d'Affichage associé à une Zone de partage
         *     un acquitement est envoyé en retour
         */
        socket.on(EVENT.DemandeConnexionZA, (function (urldemande, zpdemande) {
            console.log('******** ' + EVENT.DemandeConnexionZA + ' ***** ---- Demande de connexion d une ZA ( ' + urldemande + ' ) avec IP= ' + clientIp + ' et ZP demande= ' + zpdemande);
            this.demandeConnexionZA(socket, urldemande, zpdemande);
            console.log('******** FIN TRAITEMENT DE :' + EVENT.DemandeConnexionZA + ' ***** ');
        }).bind(this));

        /*
         * 1 - demande de connexion d'une ZEP --> demande de création d'une ZE associé
         *     Cet evenement est envoye par une ZEP (tablette)
         *     un acquitement est envoyé en retour à la ZEP ainsi qu'a la ZA pour declancher son affichage
         */
        socket.on(EVENT.DemandeConnexionZEP, (function (pseudo, posAvatar) {
            console.log('******** ' + EVENT.DemandeConnexionZEP + ' ***** --- Demande de connexion de la ZEP avec IP= ' + clientIp + ' et pseudo= ' + pseudo);
            this.demandeConnexionZE(socket, clientIp, pseudo, posAvatar);
            console.log('******** FIN TRAITEMENT DE :' + EVENT.DemandeConnexionZEP + ' ***** ');
        }).bind(this));

        /*
         * 2 - reception d'un artefact d'une ZEP --> ZE
         *     cet evenement est envoye par une ZEp (tablette) lorsque qu'un utilisateur deplace un artefact vers sa zone d echange
         *     un acquitement est envoye à la ZEP et a la ZA pour signaler la reception de cet artifact
         */
        socket.on(EVENT.NewArtefactInZE, (function (pseudo, idZEP, idZE, artefactenjson) {
            console.log('******** ' + EVENT.NewArtefactInZE + ' ***** ---- Reception Artifact d une ZEP (' + idZEP + ' ) vers la ZE =' + idZE);
            this.receptionArtefactIntoZE(socket, pseudo, idZEP, idZE, artefactenjson);
            console.log('******** FIN TRAITEMENT DE :' + EVENT.NewArtefactInZE + ' ***** ');
        }).bind(this));

        /*
         * 3 - reception d'un artefact d'une ZEP --> ZP
         *     cet evenement est envoye par une ZEp (tablette) lorsque qu'un utilisateur deplace un artefact directement vers la  zone de partage
         *     un acquitement est envoye à la ZEP et a la ZA pour signaler la reception de cet artifact	 *
         */
        socket.on(EVENT.NewArtefactInZP, (function (pseudo, idZEP, idZE, artefactenjson) {
            console.log('******** ' + EVENT.NewArtefactInZP + ' ***** ---- Reception Artifact d une ZEP (' + idZEP + ')  pousser vers la ZP (' + this.ZP.getId() + ')');
            this.receptionArtefactIntoZP(socket, pseudo, idZEP, idZE, artefactenjson);
        }).bind(this));

        /*
         * 4 - envoie d'un artefact d'une ZE ---> ZP
         *     cet evenement est emis par une zone d'affichage (ZA) lorsqu 'un utilisateur deplace un artefact d'une ZE vers la zone commune de partage (ZP)
         *     le traitement consite a demander a la ZC de changer le conteneur de l'artifact
         *     un evenement est ensuite emis pour informer la tablette qu'elle doit supprimer l'artifact
         */
        socket.on(EVENT.EnvoieArtefactdeZEversZP, (function (idAr, idZE, idZP) {
            console.log('******** ' + EVENT.EnvoieArtefactdeZEversZP + ' ***** --- Envoie artefact=' + idAr + ' de ZE = ' + idZE + 'vers la zone de partage =' + idZP); //this.ZP.getId());
            this.envoiArtefacttoZP(socket, idAr, idZE, idZP);
            console.log('******** FIN TRAITEMENT DE :' + EVENT.EnvoieArtefactdeZEversZP + ' ***** ');
        }).bind(this));

        /*
         * 5 - envoie d'un artefact d'une ZP ---> ZE
         *     cet evenement est emis par une zone d'affichage (ZA) lorsqu 'un utilisateur deplace un artefact la zone commune de partage (ZP)  vers  une ZE
         *     le traitement consite a demander a la ZC de changer le conteneur de l'artifact
         *     un evenement est ensuite emis pour informer la tablette qu'elle receptionner l'artifact
         */
        socket.on(EVENT.EnvoieArtefactdeZPversZE, (function (idAr, idZE) {
            console.log('******** ' + EVENT.EnvoieArtefactdeZPversZE + ' ***** --- Envoie artefact ' + idAr + ' vers la zone dechange ' + idZE);
            this.envoiArtefacttoZE(socket, idAr, idZE);
        }).bind(this));

        /*
         * 6 - envoie d'un artefact d'une ZE ----> EP
         *     cet evenement est envoye par une ZEp (tablette) lorsque qu'un utilisateur deplace un artefact de  sa zone d echange vers son EP
         */
        socket.on(EVENT.EnvoieArtefactdeZEversEP, (function (idAr, idZE, idZEP) {
            console.log('******** ' + EVENT.EnvoieArtefactdeZEversEP + ' ***** ---- deplace Artifact(' + idAr + ') d une ZE (' + idZE + ')   vers la EP (' + idZEP + ')');
            this.envoiArtefacttoEP(socket, idAr, idZE, idZEP);
        }).bind(this));

        /*
         * 7 - demande de deconnexion
         *     cet evenement est envoye par une ZEp (tablette) lorsque qu'un utilisateur se deconnecte
         *     la ZE de l'utilisateur est alors supprime ainsi que tous les artefacts qu'elle contient
         */
        socket.on(EVENT.SuppressZEinZP, (function (pseudo, idZE) {
            console.log('******** ' + EVENT.SuppressZEinZP + ' ***** ---- deconnexion d une ZE (' + idZE + ')');
            this.deconnexion(socket, pseudo, idZE);
        }).bind(this));

        /*
         * 8 - envoie d'un artefact d'une Zp ---> ZP
         *     cet evenement est envoye par une ZA depuis le menu ITAC pour transferer des artifacts d'une ZP à une autre ZP
         */
        socket.on(EVENT.EnvoieArtefactdeZPversZP, (function (idAr, idZPsource, idZPcible) {
            console.log('******** ' + EVENT.EnvoieArtefactdeZPversZP + ' ***** ---- envoi artifact(' + idAr + ') depuis ZP(' + idZPsource + ') vers  ZP(' + idZPcible + ')');
            this.envoiArtefactZPtoZP(socket, idAr, idZPsource, idZPcible);
        }).bind(this));

        /*
         * 9 - suppression d'un artefact d'une Zp
         *     cet evenement est envoye par une ZA depuis le menu ITAC pour supprimer des artifacts d'une ZP
         */
        socket.on(EVENT.ArtefactDeletedFromZP, (function (idAr) {
            console.log('******** ' + EVENT.ArtefactDeletedFromZP + ' ***** ---- supression artifact(' + idAr + ') ');
            this.suppresArtefactFromZP(socket, idAr);
            console.log('******** FIN TRAITEMENT DE :' + EVENT.ArtefactDeletedFromZP + ' ***** ');
        }).bind(this));

        socket.on('disconnect', (function () {
            /*
             io.sockets.emit('count', {
             number: io.engine.clientsCount
             });
             */
            console.log('******** DECONNECT ***** ---- deconnexion de (' + socket.id + ') ');
            var ZEaSupprimer = this.getZEbySocketId(socket.id);
            if (ZEaSupprimer != null) {
                console.log('    ---- socket : recherche de la ZE associé ' + ZEaSupprimer);
                this.deconnexion(socket, "", ZEaSupprimer);
            } else {
                console.log('    ---- socket : pas de traitement');
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
    demandeConnexionZE(socket, clientIp, pseudo, posAvatar) {
        // creation de l'identifiant ZEP
        var idZEP = clientIp;
        if (!this.isZAConnected()) {
            // connexion refusé par de ZA connecté
            socket.emit(EVENT.ReponseNOKConnexionZEP, ERROR.ConnexionZEP_Erreur1);
            console.log('    ---- socket : envoi accusé de reception à ZEP (' + idZEP + ')  Evenement envoyé= ' + EVENT.ReponseNOKConnexionZEP);
        } else {
            console.log('    ---- socket : demande de creation ZE (automatique) pour la ZEP= ' + idZEP + ' avec le pseudo= ' + pseudo);
            var idZE = this.ZP.createZE(idZEP);
            if (idZE !== null) {
                console.log('    ---- socket : creation automatique de ZE  pour pseudo=' + pseudo + ' et idZEO=' + idZEP + ' [OK] et creation de : ' + this.ZP.getZEbyZEP(idZEP).getId());
                // création d'une ROOM pour la ZP
                socket.join(this.ZP.getId());
                // emission accusé de reception
                socket.emit(EVENT.ReponseOKConnexionZEP, idZE, idZEP);
                console.log('    ---- socket : envoi accusé de reception à ZEP (' + idZEP + ')  Evenement envoyé= ' + EVENT.ReponseOKConnexionZEP);
                this.clientZEsocket.push(socket.id);
                this.clientZEid.push(idZE);
                // il faut emmetre à la ZA la nouvelle connexion
                this._io.sockets.to(this.getSocketZA()).emit(EVENT.NewZEinZP, pseudo, idZE, idZEP, posAvatar);
                console.log('    ---- socket : envoi d un evenement a la ZA (' + this.getSocketZA() + ') pour lui indique la nouvelle connexion   Evenement envoyé= ' + EVENT.NewZEinZP);
            } else {
                console.log('    ---- socket : creation automatique de ZE  pour ' + pseudo + ' ' + idZEP + ' [NOK]');
                // emission accusé de reception
                socket.emit(EVENT.ReponseNOKConnexionZEP, ERROR.ConnexionZEP_Erreur2);
                console.log('    ---- socket : envoi accusé de reception à ZEP (' + idZEP + ')  Evenement envoyé= ' + EVENT.ReponseNOKConnexionZEP);
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
        if (!this.isZAConnected()) {
            console.log('    ---- socket : demande de connexion ZA Url-Demandé = ' + urldemande + ' ZP-Demandé = ' + idZPdemande);
            // création d'une ROOM pour la ZP
            socket.join(this.ZP.getId());
            this.clientZAsocket = socket.id;
            myZC = this.ZP.ZC.getJSON();
            console.log('    ---- socket : demande connexion ZA [OK], ZC identifié associe a la ZP =  ' + JSON.stringify(myZC));
            // emission accusé de reception avec en JSON la ZC associé
            socket.emit(EVENT.ReponseOKConnexionZA, myZC);
            console.log('    ---- socket : envoi accusé de reception à ZA (' + this.getSocketZA() + ')  Evenement envoyé= ' + EVENT.ReponseOKConnexionZA);
        } else {
            console.log('    ---- socket : demande de connexion ZA refusé, déja connecté');
            // emission accusé de reception
            socket.emit(EVENT.ReponseNOKConnexionZA, myZC);
            console.log('    ---- socket : envoi accusé de reception à ZA (' + this.getSocketZA() + ')  Evenement envoyé= ' + EVENT.ReponseNOKConnexionZA);
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
        this.ZP.sendArFromZPtoZE(idAr, idZE);
        // il faut informer aussi la ZEP qui doit ajouter cet Artifact a sa zone
        // on recupere la socket de associe a la ZE
        var id = this.getZESocketId(idZE);
        var artifactenjson = JSON.stringify(this.ZP.ZC.getArtifact(idAr));
        this._io.sockets.to(id).emit(EVENT.EnvoieArtefactdeZPversZE, artifactenjson);
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
        var id = this.getZESocketId(idZE);
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
        console.log('    ---- socket : reception Artefact en json =', artefactenjson);
        // transfert de l'artifact à la ZC et association de cet artefact à la ZE associée à la ZEP
        var newidAr = this.ZP.addArtifactFromZEPtoZE(pseudo, idZEP, idZE, artefactenjson);
        if (newidAr !== 0) {
            // retour à la ZEP pour mettre à jour les données de l'artefact
            var chaineJSON = JSON.stringify(this.ZP.ZC.getArtifact(newidAr));
            socket.emit(EVENT.ReceptionArtefactIntoZE, pseudo, idZE, chaineJSON);
            console.log('    ---- socket : envoi à ZE [EVT_ReceptionArtefactIntoZE]  (' + idZE + ") ");
            // envoi d'un evenement pour mettre à jour le client ZA, s'il est connecté
            if (this.isZAConnected()) {
                //sockets.connected(this.clientIHMsocket).emit(EVENT.NewArtefactInZE, pseudo, idZE ,chaineJSON);
                this._io.sockets.to(this.getSocketZA()).emit(EVENT.ReceptionArtefactIntoZE, pseudo, idZE, chaineJSON);
                console.log('    ---- socket : envoi à IHM [EVT_ReceptionArtefactIntoZE]  (' + idZE + ") --->" + chaineJSON);
            } else {
                console.log('    ---- socket : pas d IHM pour [EVT_ReceptionArtefactIntoZE] ');
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
        console.log('    ---- socket : reception depuis une ZEP (' + idZEP + ') idArtifact [Ok] =', newidAr);
        if (newidAr !== 0) {
            // retour à la ZEP pour mettre à jour les données de l'artefact
            var chaineJSON = JSON.stringify(this.ZP.ZC.getArtifact(newidAr));
            socket.emit(EVENT.ReceptionArtefactIntoZP, pseudo, this.ZP.getId(), chaineJSON);
            console.log('    ---- socket : envoi à ZEP [EVT_ReceptionArtefactIntoZP]  (' + this.ZP.getId() + ") --> " + chaineJSON);
            // envoi d'un evenement pour mettre à jour le client associé à la ZP, s'il est connecté
            if (this.isZAConnected()) {
                //sockets.connected(this.clientIHMsocket).emit(EVENT.NewArtefactInZE, pseudo, idZE ,chaineJSON);
                this._io.sockets.to(this.getSocketZA()).emit(EVENT.ReceptionArtefactIntoZP, pseudo, this.ZP.getId(), chaineJSON);
                console.log('    ---- socket : envoi à IHM [EVT_ReceptionArtefactIntoZP]  (' + this.ZP.getId() + ") --> " + chaineJSON);
            } else {
                console.log('    ---- socket : pas d IHM pour [EVT_ReceptionArtefactIntoZP] ');
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
            console.log("    ---- socket : erreur envoie vers EP idArt est null");
        } else {
            console.log("    ---- socket : appel sendArFromZEPtoEP avec idArt " + idAr + " de ZE = " + idZE + " ---  vers " + idZEP);
            // en fait on efface l artefact de la ZP, ZE
            this.ZP.sendArFromZEPtoEP(idAr, idZE, idZEP);
            // envoi d'un evenement pour mettre à jour le client ZA, s'il est connecté
            if (this.isZAConnected()) {
                this._io.sockets.to(this.getSocketZA()).emit(EVENT.ArtefactDeletedFromZE, idAr, idZE, idZEP);

                console.log("    ---- socket : envoie art " + idAr + " de ZE = " + idZE + " POUR IHM = ---  vers " + idZEP);
            } else {
                console.log('    ---- socket : pas d IHM pour [EVT_ArtefactDeletedFromZE] ');
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
            console.log("    ---- socket : erreur envoie ZP vers ZP,  idArt est null");
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
                console.log("    ---- socket : envoie art [NO]" + idAr + " de ZP = " + idZPsource + " POUR IHM = ---  vers " + idZPcible);
            } else {
                socket.emit(EVENT.ReponseOKEnvoie_ArtefactdeZPversZP, idAr);
                console.log("    ---- socket : envoie art [OK] " + idAr + " de ZP = " + idZPsource + " POUR IHM = ---  vers " + idZPcible);
            }
        }
    };

    /**
     * cette fonction supprime un artifact de la zone collabiratuve
     *
     * @param {socket} socket
     * @param {string} idAr
     *
     * @author philippe pernelle
     */
    suppresArtefactFromZP(socket, idAr) {
        console.log("    ---- socket : surpress artefact  de la ZC=" + this.ZP.ZC.getId());
        if (idAr == null) {
            console.log("    ---- socket : erreur pas d Artefact a supprimer ,  idArt est null");
        } else {
            if (this.ZP.ZC.delArtifact(idAr)) {
                console.log("    ---- socket : surpress artefact [OK]" + idAr + " ");
            } else {
                console.log("    ---- socket : surpress artefact [NOK]" + idAr + " ");
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
    deconnexion(socket, pseudo, idZE) {
        //je récupere la socket de la ZE recherché
        //var idsock= getZESocketId(idZE);
        var artifactsSendInfoEP = [];

        console.log("    ---- socket : suppresion de la liste des ZE pour la ZP courante de ZE=" + idZE);
        this.ZP.destroyZE(idZE);

        console.log("    ---- socket : suppresion de la liste des ZE pour la ZC de ZE=" + idZE);
        this.removeZEbyId(idZE);

        // envoi d'un evenement pour mettre à jour le client ZA, s'il est connecté
        if (this.isZAConnected()) {

            // evenement a utiliser ou alors considerer la regle de gestion suivante pour la ZA : si suppression ZE alors tous les artefacts en EP
            //this._io.sockets.to(this.getSocketZA()).emit(EVENT.EnvoieArtefactdeZEversEP, pseudo , idZE);

            this._io.sockets.to(this.getSocketZA()).emit(EVENT.SuppressZEinZP, pseudo, idZE);

            console.log('    ---- socket : suppression de ZE POUR IHM =' + idZE + "---" + pseudo);
        }
        else {
            console.log('    ---- socket : pas d IHM pour [EVT_Deconnexion] ');
        }
    };
};
	

	
