/**
 * Cette classe permet de créer une Zone de Partage qui est associé à une Zone collaborative . Un objet Server est associé 
 * à cette zone de partage afin de gérer l'échange de flux par socket
 * 
 * 
 * @requires ZoneCollaborative
 * @requires ZoneEchange
 * @requires Artifact
 * @requires Serveur
 * @requires Constantes
 * 
 * @author philippe pernelle
 * 
 */

var ZC = require('./ZoneCollaborative');
var ZoneEchange = require('./ZoneEchange');
var Art = require('./Artifact');
var Serveur = require('./Serveur');


var fs = require("fs");


//création des constantes
var Constantes=require('./Constante');
var CONSTANTE = new Constantes();


/**
 * constructeur de ZonePartage
 *
 * @param  {string} idZP - identifiant de la ZP à créée
 * @param  {integer} ZEmin - nombre minimun de ZoneEchange
 * @param  {integer} ZEmax - nombre maximum de ZoneEchange
 */
var ZonePartage = function(ZC, idZP, nbZEmin, nbZEmax, urlWebSocket, portWebSocket)
{

	console.log('      ===========================');

	this.ZC = ZC;
	this.idZP = idZP;
	
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

	this.IdZEcurrent = 0;
	this.nbIdZEPconnected = 0;
	
	/**
	 * liste des "ZoneEchanges" associées à la zone de partage
	 * 
	 * @private
	 */
	this.listeZE = [];

	
	console.log('      === ZonePartage | ZC parent = ' + this.ZC.getId()+ ' | IdZP = ' + this.idZP+ ' | nbZEMin = ' + this.nbZEmin+ ' | nbZEMax = ' + this.nbZEmax+ ' | port = ' + this.portWebSocket);
	console.log('      === ZonePartage : Creation serveur socket ');

    this.server = new Serveur(this,portWebSocket);
    
	console.log('      ===========================');

};


module.exports = ZonePartage;


/**
 * Retourne 
 *
 */
ZonePartage.prototype.getNbZEmax = function()
{
	return this.nbZEmax;
};

/**
 * Retourne 
 *
 */
ZonePartage.prototype.getNbIdZEPconnected = function()
{
	return this.nbIdZEPconnected;
};

/**
 * Retourne 
 *
 */
ZonePartage.prototype.getIdZEdispo = function()
{
	var ret=null;
	var trouve_i =false ;
	var trouve_j =false ;
	var j=0;
	var i=1;
	
	
	var max = this.listeZE.length;
	
	console.log('      === ZonePartage : recherche du IdZE disponible, nb de ZE dans la liste = '+max);
	while (! trouve_i && i<= max)
	{		
	    j=0;
	    trouve_j =false;
	    ret = 'ZE'+i;
	    console.log('      === ZonePartage : recherche du IdZE disponible, recherche sur id= '+ret);
		while (! trouve_j && j< max)
			{
			 // est que "ZEi" est dans la liste
			
			if (this.listeZE[j].getId()===ret) 
				{
				trouve_j = true;
				console.log('      === ZonePartage : recherche du IdZE disponible, recherche sur id= '+ret +' trouve dans tab pour j='+j);
				}
				
			else j++;
			}
		if (trouve_j) 
			{
			i++;
			console.log('      === ZonePartage : recherche du IdZE disponible, recherche sur id= '+ret+' trouve à la pos='+j);
			}
		else{
			trouve_i = true;
			console.log('      === ZonePartage : recherche du IdZE disponible, recherche sur id= '+ret+' pas trouve, il est donc dispo');
		} 
			
	}
	if (!trouve_i) 	
	{
		if (max == 0) i=1;
		ret= 'ZE'+i;
	} 
		
	console.log('      === ZonePartage : recherche du IdZE disponible, trouve  = '+ret);

	return ret;
};

ZonePartage.prototype.addIdZE = function()
{
	this.IdZEcurrent++ ;
};

/**
 * Retourne d'ID de la zone de partage
 *
 */
ZonePartage.prototype.getId = function()
{
	return this.idZP;
};


/**
 * Retourne d'ID de la zone de partage
 *
 * @author philippe pernelle
 */
ZonePartage.prototype.getALLArtifacts = function()
{
	return listArtifacts ;
};


/**
 * retourne le nombre de Zone d'echange associé à la Zone de Partage
 * 
 * @public
 * @returns {Number} Nb de ZE
 * @author philippe pernelle
 */

ZonePartage.prototype.getNbZE = function() {
	return this.listeZE.length;
};


/**
 * creation d'une Zone d'Echange (ZE) associée à une ZEP (tablette)
 * 
 * @param {string} idZEP identifiant de la tablette
 * @autor philippe pernelle
 */

ZonePartage.prototype.createZE = function(idZEP) {

var ret= null;	

if (this.getNbZE() < this.nbZEmax)
	{
	console.log('      === ZonePartage (' + this.idZP+') : demande de creation de ZE - [ok]');
	
	
	//calcul de l'ID de la ZE crée
	//var idze = 'ZE'+this.getIdZEcurrent();
	var idze = this.getIdZEdispo();
	
	// création de la ZE et mise dans la liste
	this.listeZE.push( new ZoneEchange(this, idze, idZEP, true));

	console.log('      === ZonePartage (' + this.idZP+') : ZE créée = '+idze +' pour la ZEP = '+idZEP);
	ret=idze;
	}
else
	{
	console.log('      === ZonePartage (' + this.idZP+') : demande de creation de ZE - [NOK]');
	}

console.log('      === ZonePartage : le nombre total de ZE est = ' + this.listeZE.length);

return ret;

};

/**
 * suppresion  d'une Zone d'Echange (ZE) associée à une ZEP (tablette)
 * 
 * @param {string} idZEP identifiant de la tablette
 * @autor philippe pernelle
 */

ZonePartage.prototype.destroyZE = function(idZE) {
	
	for (var i=0; i  <this.listeZE.length ; i ++)
	{

	if (this.listeZE[i].getId()===idZE)
		{
		this.listeZE.splice(i,1);
		}
	}
}


/**
 * Retourne une Zone d'Echange spécifique de la ZP
 * 
 * @public
 * @param {String} idZE Identifiant de la ZE
 * @return {ZE} Zone echange
 * @autor philippe pernelle
 */

ZonePartage.prototype.getZE = function(idZE) {

	var ret=null;

	console.log('      === ZonePartage : recherche de ZE dans la liste contenant bn='+ this.listeZE.length);
	var i=0;
	while (i <this.listeZE.length && ret==null)
		
		{
		if (this.listeZE[i].getId()===idZE)
			{
			ret= this.listeZE[i];
			console.log('      === ZonePartage : recherche de ZE dans la liste [OK] idZE='+ret.getId()+' idZEP='+ret.getIdZEP())
			}
		else  i ++;
		}
	if (ret == null) console.log('      === ZonePartage : recherche de ZE dans la liste [NOK] pour idZE='+idZE);
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

ZonePartage.prototype.getZEbyZEP = function(idZEP) {

	var ret=null;

	for (var i=0; i  <this.listeZE.length ; i ++)
		{

		if (this.listeZE[i].getIdZEP()===idZEP)
			{
			ret= this.listeZE[i];
			}
		}
	return ret;
};


/**
 * Retourne la liste de toutes les Zones d'échanges de la ZP
 * 
 * @public
 * @return {ZE[]} liste des ZE
 */

ZonePartage.prototype.getAllZE =  function() 
{
	return this.listeZE;
};

/**
 * envoi d'un Artefact depuis une ZP vers une ZE .
 * en fait l'envoi est un simple changement de conteneur , c'est la ZC qui s'en charge
 * 
 * @public
 * @param {idAr} 	identifant de l'artefact à deplacer
 * @param {idZE} 	Zone d'Echange cible
 */
ZonePartage.prototype.sendArFromZPtoZE = function(idAr, idZE) 
{
	this.ZC.setArtifactIntoZE(idAr,idZE);

};


/**
 * envoi d'un Artefact depuis une ZE vers une ZP .
 * en fait l'envoi est un simple changement de conteneur , c'est la ZC qui s'en charge
 * 
 * @public
 * @param {idAr} 	identifant de l'artefact à deplacer
 * @param {idZP} 	Zone de Partage cible
 */
ZonePartage.prototype.sendArFromZEtoZP = function(idAr, idZP) 
{
	this.ZC.setArtifactIntoZP(idAr,idZP);
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
ZonePartage.prototype.addArtifactFromZEPtoZE = function(pseudo, idZEP, idZE, artefactenjson) {

	
	// vérification que la ZEP est bien connecté avec la ZE
	var IdArtefact =0;
	
	var maZE = this.getZE(idZE);
	console.log('      === ZonePartage : addArtifactFromZEPtoZE , recupération de la ZE par idZE='+idZE); 
	
	if (maZE.getIdZEP() === idZEP )
		// cas ou elle est bien en lien avec la ZEP
		{
		console.log('      === ZonePartage : addArtifactFromZEPtoZE , recuperation [OK]');
		// conversion json en objet
		IdArtefact= this.ZC.addArtifactFromJSON(artefactenjson);

		// affectation de l'artifact à la zone ZE
		this.ZC.setArtifactIntoZE(IdArtefact,idZE);
		
		
		}
	// renvoie l'id de l'artifcat créé
	console.log('      === ZonePartage : addArtifactFromZEPtoZE , renvoi IdArtefact utilise ='+IdArtefact);
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

ZonePartage.prototype.addArtifactFromZEPtoZP = function(pseudo, idZEP, idZE, artefactenjson) {

	
	// vérification que la ZEP est bien connecté avec la ZE
	var IdArtefact =0;
	
	var maZE = this.getZE(idZE);
	console.log('      === ZonePartage : addArtifactFromZEPtoZP , recupération de la ZE par idZE='+idZE +' et idZEP='+idZEP); 

	if (maZE.getIdZEP() === idZEP )
		// cas ou elle est bien en lien avec la ZEP
		{
		console.log('      === ZonePartage : addArtifactFromZEPtoZP , recuperation ZE [OK]');
		// conversion json en objet
		IdArtefact= this.ZC.addArtifactFromJSON(artefactenjson);
		console.log('      === ZonePartage : addArtifactFromZEPtoZP , recuperation idArtefact [OK] = '+IdArtefact);
		
		console.log('      === ZonePartage : addArtifactFromZEPtoZP , changement de zone  vers ZP='+this.getId());

		// affectation de l'artifact à la zone ZP
		this.ZC.setArtifactIntoZP(IdArtefact,this.getId());
		
		
		}
	// renvoie l'id de l'artifcat créé
	console.log('      === ZonePartage : addArtifactFromZEPtoZP , renvoi IdArtefact utilise ='+IdArtefact);
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
ZonePartage.prototype.sendArFromZEPtoEP = function(idAr, idZE,idZEP) 
{
	
	this.ZC.setArtifactIntoEP(idAr,idZE,idZEP);

};


