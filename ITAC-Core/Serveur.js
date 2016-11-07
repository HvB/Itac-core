


var express = require('express');
var app = express();
var server = require('http').createServer(app);
//var io = require('socket.io')(server);

var http2 = require('http');


var fs = require ('fs');
var util = require ("util");
var ZP = require('./ZonePartage');
var ZC = require("./ZoneCollaborative");
var Constantes = require('./Constante');


//création des constantes
var CONSTANTE = new Constantes();

var idZEP=0;

/**
 * Serveur de socket permettant de gérer les échanges entre une Zone de Partage (ZP), des Zones d'Echange (ZE)
 * et des tablettes (ZEP)
 * 
 * @param ZP : identifiant de la zone de partage associé au serveur de socket
 * @param port : numéro du port d'écoute serveur de socket
 *  
 * @author philippe pernelle 
 */
var Serveur = function(ZP, port) {

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
	
/*
	var srv = require('http').createServer(function(req, res) {	
		  res.writeHead(200, {'Content-Type': 'text/plain'});
		  res.end('Socket OK!');
		}).listen(this.port);
	
	//, this.address, 512, function(){ console.log('    ---- Server HTTP en ecoute sur port ' + port);});
	/


	// mise en ecoute de la socket sur le port passé en parametre
	this._io = require('socket.io')(srv);
		/* , function() {
		console.log('    ---- Socket en ecoute sur port ' + port);
	});
		*/
	
	console.log("       ---- Creation d'un serveur pour la ZP (" + ZP.getId()+ ") sur le port " + port);
	
	var srv=http2.createServer();
	srv.listen(this.port, function () {
	  console.log('Server listening at port %d', port);
	});
	this._io = require('socket.io').listen(srv,function () {
		console.log('    ---- Socket en ecoute sur port ' + port);
	});
	this._io.origins('*:*');
	
	/*
	
	this._io = require('socket.io')(server);
	
	this._io.origins('*:*');

	server.listen(port, function () {
	  console.log('Server listening at port %d', port);
	});
	*/
	/*
	var srv = http.createServer(function(req, res) {
		  res.writeHead(200);
		  res.end('Le serveur fonctionne.');
		});
	srv.listen(this.port, function() {
		console.log('       ---- Server HTTP en ecoute sur port ' + port);
	});
	*/
	//var srv = http.createServer(app);
//	var srv = app.listen(port,function() {
//		console.log('    ---- Serveur en ecoute sur port ' + port);
//	});
//	var io = require('socket.io')(app);
	
	// mise en ecoute de la socket sur le port passé en parametre
	/*this._io = require('socket.io').listen(srv, function() {
		console.log('    ---- Socket en ecoute sur port ' + port);
	});*/
	
	// mise en ecoute de la socket sur le port passé en parametre
/*	var allowedOrigins = "*:*";
	var path ='/collab'; // you need this if you want to connect to something other than the default socket.io path

	this._io = io(srv, {origins: allowedOrigins},function() {
		console.log('    ---- Socket en ecoute sur port ' + port);
	});
*/	
	console.log('       ---- Socket ok ');
	
	//this._io.origins('*:*');

	
/*	this._io = require('socket.io')(srv,function() {
	
		console.log('    ---- Socket en ecoute sur port ' + port);
	});
	*/
	//this._io.origins('*:*');
	//this._io.attach(srv);
/*	
	this._io.set('transports', [                     // enable all transports (optional if you want flashsocket)
	                                                       'websocket'
	                                                       , 'flashsocket'
	                                                       , 'htmlfile'
	                                                       , 'xhr-polling'
	                                                       , 'jsonp-polling'
	                                                     ]);
	this._io.set('origins', '*:*');

	

*/

	
	// declenchement de la fonction de traitement à l'arrivee d'une demande de connexion CONSTANTE.EVT_ConnexionSocketZEP
	this._io.sockets.on('connection', (function (socket) {
		
		console.log('    -----------------------------------------------------------------------');	    
		console.log('    ---- Arrive demande Connection SOCKET ----- ID='+socket.id);
		console.log('    -----------------------------------------------------------------------');
		
		
		/*
		console.log('    ----> les constantes :'+CONSTANTE.EVT_DemandeConnexionZA);
		socket.on(CONSTANTE.EVT_DemandeConnexionZA,  (function(pseudo,idZA ) {
		   	console.log('    ---- Demande de connexion d une ZA ( ' +idZA +' ) avec IP= ' + clientIp +' et pseudo= '+pseudo);
		    this.demandeConnexionZA(socket,pseudo,idZA);  		
		 }).bind(this));
		 */
		
		this.traitementSurConnexion(socket);
		
	}).bind(this));

	this._io.sockets.on('disconnect', (function() {

		console.log('    ---------------------------------------------');	    
		console.log('    ---- Arrive demande deconnexion SOCKET ----- ID=');
		console.log('    --------------------------------------------');
	
		
	}).bind(this));

	

};

module.exports = Serveur;
/**
*/
Serveur.prototype.getSocketZA = function(){
	return this.clientZAsocket;
};

Serveur.prototype.isZAConnected = function() {
	return (this.clientZAsocket !== 0);
};

Serveur.prototype.getZESocketId = function(idZE) {
	
	var ret = null;
	for (var i = 0; i < this.clientZEid.length; i++) {

		if (this.clientZEid[i] === idZE)
			{
			ret = this.clientZEsocket[i];
			}
	}
	return ret;
};



/**
 * fonction de traitement des evenements de la socket ZEP
 * 
 * @param socket
 * 
 * @autor philippe pernelle
 */
Serveur.prototype.traitementSurConnexion = function(socket) {
	
    // recupération de l'adresse IP de la socket
	var clientIp = socket.request.connection.remoteAddress ; 
	//var clientIp = socket.handshake.address;
	//var clientIp = socket.request.conn.remoteAddress ; 
	
	console.log('    ---- Server.js : TraitementSurConnexion - evenement en provenance de l adresse = '+ clientIp);
	
	//var tt= util.inspect(socket.handshake);
	//console.log(tt);

	/* 
	 * 0 - Demande de connexion d'une ZA
	 *     Cet evenement est normalement émis par une Zone d'Affichage associé à une Zone de partage
	 *     un acquitement est envoyé en retour     
	 */
	socket.on(CONSTANTE.EVT_DemandeConnexionZA,  (function(urldemande,zpdemande ) {
	   	console.log('******** '+CONSTANTE.EVT_DemandeConnexionZA+' ***** ---- Demande de connexion d une ZA ( ' +urldemande +' ) avec IP= ' + clientIp +' et ZP demande= '+zpdemande);
	    this.demandeConnexionZA(socket,urldemande,zpdemande);  		
	 }).bind(this));
	
	/* 
	 * 1 - demande de connexion d'une ZEP --> demande de création d'une ZE associé
	 *     Cet evenement est envoye par une ZEP (tablette)
	 *     un acquitement est envoyé en retour à la ZEP ainsi qu'a la ZA pour declancher son affichage 
	 */ 
	socket.on(CONSTANTE.EVT_DemandeConnexionZEP  , (function(pseudo,posAvatar ) {
	   	console.log('******** '+CONSTANTE.EVT_DemandeConnexionZEP+' ***** --- Demande de connexion de la ZEP avec IP= ' + clientIp +' et pseudo= '+pseudo);
	    this.demandeConnexionZE(socket,clientIp,pseudo,posAvatar); 
	 }).bind(this));
		
	/*
	 * 2 - reception d'un artefact d'une ZEP --> ZE
	 *     cet evenement est envoye par une ZEp (tablette) lorsque qu'un utilisateur deplace un artefact vers sa zone d echange
	 *     un acquitement est envoye à la ZEP et a la ZA pour signaler la reception de cet artifact
	 */ 
	socket.on(CONSTANTE.EVT_NewArtefactInZE, (function(pseudo, idZEP, idZE, artefactenjson) {
	 	console.log('******** '+CONSTANTE.EVT_NewArtefactInZE+' ***** ---- Reception Artifact d une ZEP (' +idZEP+ ' ) vers la ZE ='+ idZE);
	   	this.receptionArtefactIntoZE(socket,pseudo, idZEP, idZE, artefactenjson);	 
	 }).bind(this));
	
	/*
	 * 3 - reception d'un artefact d'une ZEP --> ZP
	 *     cet evenement est envoye par une ZEp (tablette) lorsque qu'un utilisateur deplace un artefact directement vers la  zone de partage
	 *     un acquitement est envoye à la ZEP et a la ZA pour signaler la reception de cet artifact	 * 
	 */ 
	socket.on(CONSTANTE.EVT_NewArtefactInZP, (function(pseudo, idZEP, idZE, artefactenjson) {
	 	console.log('******** '+CONSTANTE.EVT_NewArtefactInZP+' ***** ---- Reception Artifact d une ZEP (' +idZEP+ ')  pousser vers la ZP ('+this.ZP.getId()+')');
	   	this.receptionArtefactIntoZP(socket,pseudo, idZEP, idZE, artefactenjson);	 
	 }).bind(this));
	
	/*
	 * 4 - envoie d'un artefact d'une ZE ---> ZP 
	 *     cet evenement est emis par une zone d'affichage (ZA) lorsqu 'un utilisateur deplace un artefact d'une ZE vers la zone commune de partage (ZP)
	 *     le traitement consite a demander a la ZC de changer le conteneur de l'artifact
	 *     un evenement est ensuite emis pour informer la tablette qu'elle doit supprimer l'artifact
	 */
	socket.on(CONSTANTE.EVT_EnvoieArtefactdeZEversZP, (function (idAr,idZE, idZP) {
		console.log('******** '+CONSTANTE.EVT_EnvoieArtefactdeZEversZP+' ***** --- Envoie artefact '+idAr+ ' vers la zone de partage '+this.ZP.getId());
		this.envoiArtefacttoZP(socket,idAr,idZE, idZP);
	}).bind(this));
	
	/* 
	 * 5 - envoie d'un artefact d'une ZP ---> ZE 
	 *     cet evenement est emis par une zone d'affichage (ZA) lorsqu 'un utilisateur deplace un artefact la zone commune de partage (ZP)  vers  une ZE
	 *     le traitement consite a demander a la ZC de changer le conteneur de l'artifact
	 *     un evenement est ensuite emis pour informer la tablette qu'elle receptionner l'artifact
	 */
	socket.on(CONSTANTE.EVT_EnvoieArtefactdeZPversZE, (function (idAr, idZE) {
		console.log('******** '+CONSTANTE.EVT_EnvoieArtefactdeZPversZE+' ***** --- Envoie artefact '+idAr+ ' vers la zone dechange '+idZE);
		this.envoiArtefacttoZE(socket,idAr, idZE);
	}).bind(this));
 	 

	/*
	 * 6 - envoie d'un artefact d'une ZE ----> EP
	 *     cet evenement est envoye par une ZEp (tablette) lorsque qu'un utilisateur deplace un artefact de  sa zone d echange vers son EP
	 */
	socket.on(CONSTANTE.EVT_EnvoieArtefactdeZEversEP, (function(idAr, idZE, idZEP){		
		console.log('******** '+CONSTANTE.EVT_EnvoieArtefactdeZEversEP+' ***** ---- deplace Artifact('+idAr+') d une ZE (' +idZE+ ')   vers la EP ('+idZEP+')');		
		this.envoiArtefacttoEP(socket, idAr, idZE,idZEP);		
	}).bind(this));
	
 	
	/*
	 * 7 - demande de deconnexion
	 */

	socket.on(CONSTANTE.EVT_SuppressZEinZP, (function (pseudo, idZE) {
		console.log('******** '+CONSTANTE.EVT_SuppressZEinZP+' ***** ---- deconnexion d une ZE (' +idZE+ ')'  );
		this.envoiArtefacttoEP(socket, idAr, idZE,idZEP);	
	}).bind(this));
	
	
	/*
	 * 8 - envoie d'un artefact d'une Zp ---> ZP
	 *     cet evenement est envoye par une ZA depuis le menu ITAC pour transferer des artifacts d'une ZP à une autre ZP
	 */

	socket.on(CONSTANTE.EVT_Envoie_ArtefactdeZPversZP, (function(idAr, idZPsource, idZPcible) {
		console.log('******** '+CONSTANTE.EVT_Envoie_ArtefactdeZPversZP+' ***** ---- envoi artifact('+idAr+') depuis ZP('+idZPsource+') vers  ZP(' +idZPcible+ ')'  );
		this.envoiArtefactZPtoZP(socket, idAr, idZPsource,idZPcible);
	}).bind(this));
	
	
	/*
	 * 9 - suppression d'un artefact d'une Zp 
	 *     cet evenement est envoye par une ZA depuis le menu ITAC pour supprimer des artifacts d'une ZP 
	 */

	socket.on(CONSTANTE.EVT_ArtefactDeletedFromZP, (function(idAr) {
		console.log('******** '+CONSTANTE.EVT_ArtefactDeletedFromZP+' ***** ---- supression artifact('+idAr+') '  );
		this.suppresArtefactFromZP(socket, idAr);
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

Serveur.prototype.demandeConnexionZE = function(socket, clientIp, pseudo, posAvatar) {
	
	// creation de l'identifiant ZEP
	var idZEP=clientIp; 
	
	if (! this.isZAConnected()) {
		// connexion refusé par de ZA connecté
		socket.emit(CONSTANTE.EVT_ReponseNOKConnexionZEP, CONSTANTE.ConnexionZEP_Erreur1);
		console.log('    ---- socket : envoi accusé de reception à ZEP (' + idZEP+')  Evenement envoyé= '+CONSTANTE.EVT_ReponseNOKConnexionZEP );
		
	} 
	else
	{
		
		console.log('    ---- socket : demande de creation ZE (automatique) pour la ZEP= ' +idZEP+' avec le pseudo= '+ pseudo);
		var idZE=this.ZP.createZE(idZEP);

		
		if ( idZE !== null)
		{
			console.log('    ---- socket : creation automatique de ZE  pour pseudo=' +pseudo+' et idZEO='+ idZEP+ ' [OK] et creation de : '+this.ZP.getZEbyZEP(idZEP).getId());	

			// création d'une ROOM pour la ZP
			socket.join(this.ZP.getId());

			// emission accusé de reception
			socket.emit(CONSTANTE.EVT_ReponseOKConnexionZEP,  idZE,idZEP);
			console.log('    ---- socket : envoi accusé de reception à ZEP (' + idZEP+')  Evenement envoyé= '+CONSTANTE.EVT_ReponseOKConnexionZEP );	
			
			this.clientZEsocket.push(socket.id);
			this.clientZEid.push(idZE);
			
		
			// il faut emmetre à la ZA la nouvelle connexion
		   	this._io.sockets.to(this.getSocketZA()).emit(CONSTANTE.EVT_NewZEinZP,pseudo, idZE ,idZEP,posAvatar);
		   	console.log('    ---- socket : envoi d un evenement a la ZA (' + this.getSocketZA()+') pour lui indique la nouvelle connexion   Evenement envoyé= '+CONSTANTE.EVT_NewZEinZP);				
	   			
		}
		else
		{
			console.log('    ---- socket : creation automatique de ZE  pour ' +pseudo+' '+ idZEP+ ' [NOK]');
			
			// emission accusé de reception
			socket.emit(CONSTANTE.EVT_ReponseNOKConnexionZEP, CONSTANTE.ConnexionZEP_Erreur2);
			console.log('    ---- socket : envoi accusé de reception à ZEP (' + idZEP+')  Evenement envoyé= '+CONSTANTE.EVT_ReponseNOKConnexionZEP );
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
Serveur.prototype.demandeConnexionZA = function(socket, urldemande, idZPdemande) {
	
	var myZC= {};
	
	if ( !this.isZAConnected())
	{
		console.log('    ---- socket : demande de connexion ZA Url-Demandé = ' +urldemande+' ZP-Demandé = '+ idZPdemande );	

		// création d'une ROOM pour la ZP
		socket.join(this.ZP.getId());

		this.clientZAsocket = socket.id;
		
		myZC=this.ZP.ZC.getJSON();
		
		console.log('    ---- socket : demande connexion ZA [OK], ZC identifié associe a la ZP =  '+JSON.stringify(myZC));
		// emission accusé de reception avec en JSON la ZC associé
		socket.emit(CONSTANTE.EVT_ReponseOKConnexionZA, myZC);
		console.log('    ---- socket : envoi accusé de reception à ZA (' + this.getSocketZA()+')  Evenement envoyé= '+CONSTANTE.EVT_ReponseOKConnexionZA );
			
	}
	else
	{
		console.log('    ---- socket : demande de connexion ZA refusé, déja connecté');
		
		// emission accusé de reception
		socket.emit(CONSTANTE.EVT_ReponseNOKConnexionZA,myZC);
		console.log('    ---- socket : envoi accusé de reception à ZA (' + this.getSocketZA()+')  Evenement envoyé= '+CONSTANTE.EVT_ReponseNOKConnexionZA );
		
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
Serveur.prototype.envoiArtefacttoZE = function (socket,idAr, idZE)
{
	// cette fonction traite un changement de conteneur d'une ZP vers une ZE 
	this.ZP.sendArFromZPtoZE(idAr, idZE);
	
	// il faut informer aussi la ZEP qui doit ajouter cet Artifact a sa zone
	
	// on recupere la socket de associe a la ZE
	var id= this.getZESocketId(idZE);
	var artifactenjson= JSON.stringify(this.ZP.ZC.getArtifact(idAr));
	this._io.sockets.to(id).emit(CONSTANTE.EVT_EnvoieArtefactdeZPversZE, artifactenjson );
	
};
/**
 * cette fonction traite l'envoie d'un artefact d'une Zone d'Echange (ZE) vers la zone de partage (ZP)  
 * en fait l'artéfact reste dans sa zone collaborative mais change de conteneur
 * 
 * @param {socket} socket
 * @param {number} idAr
 * @param {string} idZE
 * @param {string} idZP
 * @author philippe pernelle 
 */
Serveur.prototype.envoiArtefacttoZP = function (socket,idAr,idZE,idZP)
{
	// cette fonction traite un changement de conteneur d'une ZE vers la ZP 
	this.ZP.sendArFromZEtoZP(idAr,  idZP);
	
	// il faut informer la ZEP qui doit le suprimer de son ZEP
	//on recupere l'ID de la socket 
	var id= this.getZESocketId(idZE);
	this._io.sockets.to(id).emit(CONSTANTE.EVT_EnvoieArtefactdeZEversZP, idAr,idZE );

	
};

/**
 * cette fonction traite la recéption d'un artefact de la Zone d'Echange Personnelle vers la zone d'Echange
 * 
 * @param {socket} socket
 * @param {string} idZEP
 * @param {string} IdZE
 * @param {string} artefactenjson
 * @author philippe pernelle 
 */
Serveur.prototype.receptionArtefactIntoZE = function(socket, pseudo, idZEP, idZE, artefactenjson) {

	console.log('    ---- socket : reception Artefact en json =',artefactenjson);
	// transfert de l'artifact à la ZC et association de cet artefact à la ZE associée à la ZEP
	var newidAr=this.ZP.addArtifactFromZEPtoZE(pseudo,idZEP, idZE, artefactenjson);  
	
	if (newidAr !== 0)
		{
		// retour à la ZEP pour mettre à jour les données de l'artefact
		var chaineJSON= JSON.stringify(this.ZP.ZC.getArtifact(newidAr));
		socket.emit(CONSTANTE.EVT_ReceptionArtefactIntoZE, pseudo, idZE ,chaineJSON);
		console.log('    ---- socket : envoi à ZE [EVT_ReceptionArtefactIntoZE]  ('+idZE+") ");
		
		// envoi d'un evenement pour mettre à jour le client ZA, s'il est connecté
		if (this.isZAConnected())
			{
			
			//sockets.connected(this.clientIHMsocket).emit(CONSTANTE.EVT_NewArtefactInZE, pseudo, idZE ,chaineJSON);
			this._io.sockets.to(this.getSocketZA()).emit(CONSTANTE.EVT_ReceptionArtefactIntoZE,pseudo, idZE ,chaineJSON);
			console.log('    ---- socket : envoi à IHM [EVT_ReceptionArtefactIntoZE]  ('+idZE+") --->"+chaineJSON);
			}	
		else
			{ console.log('    ---- socket : pas d IHM pour [EVT_ReceptionArtefactIntoZE] '); }
		
		}
};

/**
 * cette fonction traite la recéption d'un artefact de la Zone d'Echange Personnelle (ZEP) vers la zone de partage (ZP)
 * 
 * @param {socket} socket
 * @param {string} idZEP
 * @param {string} IdZE
 * @param {string} artefactenjson
 * @author philippe pernelle 
 */
Serveur.prototype.receptionArtefactIntoZP = function(socket, pseudo, idZEP, idZE,  artefactenjson) {


	console.log('    ---- socket : reception depuis une ZEP ('+ idZEP+') artifact =',artefactenjson);
	// transfert de l'artifact à la ZC et association de cet artefact à la ZE associée
	var newidAr=this.ZP.addArtifactFromZEPtoZP(pseudo,idZEP, idZE, artefactenjson);  
	
	console.log('    ---- socket : reception depuis une ZEP ('+ idZEP+') idArtifact [Ok] =',newidAr);
	if (newidAr !== 0)
		{
		// retour à la ZEP pour mettre à jour les données de l'artefact
		var chaineJSON= JSON.stringify(this.ZP.ZC.getArtifact(newidAr));
		socket.emit(CONSTANTE.EVT_ReceptionArtefactIntoZP, pseudo, this.ZP.getId(),chaineJSON );
		console.log('    ---- socket : envoi à ZEP [EVT_ReceptionArtefactIntoZP]  ('+this.ZP.getId()+") --> "+chaineJSON);

		
		// envoi d'un evenement pour mettre à jour le client associé à la ZP, s'il est connecté
		if (this.isZAConnected())
			{
			
			//sockets.connected(this.clientIHMsocket).emit(CONSTANTE.EVT_NewArtefactInZE, pseudo, idZE ,chaineJSON);
			this._io.sockets.to(this.getSocketZA()).emit(CONSTANTE.EVT_ReceptionArtefactIntoZP,pseudo, this.ZP.getId() ,chaineJSON);
			console.log('    ---- socket : envoi à IHM [EVT_ReceptionArtefactIntoZP]  ('+this.ZP.getId()+") --> "+chaineJSON);
			}
		else
			{
			console.log('    ---- socket : pas d IHM pour [EVT_ReceptionArtefactIntoZP] ');
			}
		
		}
};
/**
 * cette fonction envoi un artifact de la ZE vers EP
 */
Serveur.prototype.envoiArtefacttoEP = function (socket,idAr, idZE, idZEP)
{
	
	if (idAr==null) {
		console.log("    ---- socket : erreur envoie vers EP idArt est null");
	}
	else {
		
	
		console.log("    ---- socket : appel sendArFromZEPtoEP avec idArt " +idAr+ " de ZE = " +idZE+ " ---  vers " +idZEP);
		this.ZP.sendArFromZEPtoEP(idAr, idZE, idZEP);
	
		// envoi d'un evenement pour mettre à jour le client ZA, s'il est connecté
	
		if (this.isZAConnected())
			{
			this._io.sockets.to(this.getSocketZA()).emit(CONSTANTE.EVT_ArtefactDeletedFromZE, idAr , idZE,idZEP);
	
			console.log("    ---- socket : envoie art " +idAr+ " de ZE = " +idZE+ " POUR IHM = ---  vers " +idZEP);
			}	
		else
			{ console.log('    ---- socket : pas d IHM pour [EVT_ArtefactDeletedFromZE] '); }
	}
}

/**
 * cette fonction envoi un artifact de la ZP source vers la ZP cible
 */
Serveur.prototype.envoiArtefactZPtoZP = function (socket, idAr, idZPsource,idZPcible)
{
	var transfert = false;
	var ZPcible= null;
	var artifact = {};
	
	if (idAr==null) {
		console.log("    ---- socket : erreur envoie ZP vers ZP,  idArt est null");
	}
	else {
		ZPcible= this.ZP.ZC.getZP(idZPcible);
		
		if (ZPcible != null){
			if (ZPcible.isZAConnected()){
				this.ZP.ZC.transfertArtefactZPtoZP(idAr, idZPsource,idZPcible);
				transfert = true;
				artifact.this.ZC.getArtifact(idAr);
				// marche pas pas la bonne socket
				//this._io.sockets.to(this.getSocketZA()).emit(CONSTANTE.EVT_ReceptionArtefactIntoZP,'', idZPcible.getId() ,JSON.stringify(artifact));
				
			}
			
		}
		if (!transfert){
			
			socket.emit(CONSTANTE.EVT_ReponseNOKEnvoie_ArtefactdeZPversZP, idAr);
			console.log("    ---- socket : envoie art [ok]" +idAr+ " de ZP = " +idZPsource+ " POUR IHM = ---  vers " +idZPcible);
		}
		else
		{
			socket.emit(CONSTANTE.EVT_ReponseOKEnvoie_ArtefactdeZPversZP, idAr);
			console.log("    ---- socket : envoie art [nok]" +idAr+ " de ZP = " +idZPsource+ " POUR IHM = ---  vers " +idZPcible);
		}


	}
}

/**
* cette fonction supprime un artifact de la ZP source vers la ZP cible
*/
Serveur.prototype.suppresArtefactFromZP = function (socket, idAr)
{
	console.log("    ---- socket : surpress art ---- de la ZC="+ this.ZP.ZC.getId());
	if (idAr==null) {
		console.log("    ---- socket : erreur pas d Artefact a supprimer ,  idArt est null");
	}
	else {
		if (this.ZP.ZC.delArtifact(idAr)) {
			console.log("    ---- socket : surpress art [ok]" +idAr+ " ");
		}
		else
			{
			console.log("    ---- socket : surpress art [Nok]" +idAr+ " ");
			}
		
		
	}
}


/** cette fonction traite la deconnexion
 * 
 * 
 * 
 */

Serveur.prototype.deconnexion = function (socket,pseudo, idZE)

{
	// il faut liberer la zone echange 
	
	//je récupere la socket de la ZE recherché
	//var idsock= getZESocketId(idZE);
	
	console.log("    ---- socket : suppresion de la liste des ZE de la ZP ZE=" +idZE);
	this.ZP.destroyZE(idZE);

	// envoi d'un evenement pour mettre à jour le client ZA, s'il est connecté

	if (this.isZAConnected())

		{
		this._io.sockets.to(this.getSocketZA()).emit("EVT_Deconnexion", pseudo , idZE);

		console.log('    ---- socket : suppression de ZE POUR IHM ='+idZE+"---"+pseudo);

		}	

	else

		{ console.log('    ---- socket : pas d IHM pour [EVT_Deconnexion] '); }

	

};
	

	
