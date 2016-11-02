/**

 * Cette classe permet de créer une Zone Collaborative dans laquelle il sera

 * possible de définir des Zones de Partages

 * 

 * @requires ZonePartage

 * @requires artifact

 * 

 * @author philippe pernelle

 */


var Artifact = require('./Artifact');

var ZonePartage = require('./ZonePartage');

var Constantes=require('./Constante');

var ZoneEchange = require ('./ZoneEchange');
var fs = require("fs");


//création des constantes

var CONSTANTE = new Constantes();


/**

 * constructeur de la classe ZoneCollaborative

 * 

 * @constructor

 * @param {json}

 *            parametreZC - parametre de configuration de la ZC

 * @author philippe pernelle

 */

var ZoneCollaborative = function(parametreZC) {

	console.log('*************************');
	console.log('*** ZoneCollaborative ***');
	console.log('*************************');

	/**
	 * listes de artefacts associée à la liste
	 * 
	 * @private
	 */
	this.artifacts = [];


	// artifacs qui seront envoyé vers ZP

	this.artifactsInZP = [];

	

	// artifacs qui seront envoyé vers ZE

	this.artifactsInZE = [];


	/**
	 * repertoire contenant les fichiers artefact
	 * 
	 * @private
	 */
	this.pathArtifacts = 'artifacts/';


	/**
	 * identifiant de la zone collaborative
	 * 
	 * @private
	 */
	this.idZC = parametreZC.idZC;

	console.log('*** idZC cree = ' + this.idZC);


	/**

	 * liste des "ZonePartage" associé à la zone collaborative

	 * 

	 * @private

	 */

	this.listeZP = [];


	// chargement de la liste des ZP

	for (var i = 0; i < parametreZC.nbZP; i++) {


		// id ZP défini dans le fichier de parametre

		console.log('\n*** idZP = ' + parametreZC.ZP[i].idZP);


		// creation des ZP

		this.listeZP[i] = new ZonePartage(this, parametreZC.ZP[i].idZP,

				parametreZC.ZP[i].nbZEmin, parametreZC.ZP[i].nbZEmax,

				parametreZC.ZP[i].urlWebSocket, parametreZC.ZP[i].portWebSocket);

		



	}

	console.log('\n*************************');

	console.log('*** nbZP total creees = ' + this.getNbZP());

	console.log('*************************');


};

module.exports = ZoneCollaborative;

/**
 * retourne l'identifiant de la zone collaborative
 * 
 * @public
 * @returns {String} identifiant ZC
 * @author philippe pernelle
 */

ZoneCollaborative.prototype.getJSON = function() {

	/*
	var myjson =
		{
			idZC:this.getId(),
			nbZP:this.getNbZP()
			
		};
		*/
	// la premiere ZP est toujours présente
	var paramZP = JSON.stringify({idZP:this.listeZP[0].idZP, typeZP:'' , nbZEmin:this.listeZP[0].ZEmin, nbZEmax:this.listeZP[0].ZEmax,urlWebSocket:this.listeZP[0].urlWebSocket,portWebSocket:this.listeZP[0].portWebSocket});

	for (var i=1; i<this.getNbZP() ; i++)
	{
		//paramZP=merge(paramZP, {idZP:tab[i], nbZEmin:tab[i+1], nbZEmax:tab[i+2]});
		ajout = {idZP:this.listeZP[i].idZP, typeZP:'' , nbZEmin:this.listeZP[i].ZEmin, nbZEmax:this.listeZP[i].ZEmax,urlWebSocket:this.listeZP[i].urlWebSocket,portWebSocket:this.listeZP[i].portWebSocket};
		paramZP = paramZP+','+JSON.stringify(ajout);			
		console.log('i='+i+'ZP'+paramZP);				
	}
	paramZP= "{\"idZC\":\""+this.getId()+"\", \"nbZP\":\""+this.getNbZP()+"\", \"ZP\":["+paramZP+"]}";
	console.log(paramZP);
	var myjson= JSON.parse((paramZP).replace(/}{/g,","))
	
	return myjson;
	
	

};



/**

 * retourne l'identifiant de la zone collaborative

 * 

 * @public

 * @returns {String} identifiant ZC

 * @author philippe pernelle

 */

ZoneCollaborative.prototype.getId = function() {

	return this.idZC;

};


/**

 * retourne la liste des ZP(Zone de Partage) la zone collaborative

 * 

 * @public

 * @returns {ZonePartage[]} liste des ZP

 * @author philippe pernelle

 */

ZoneCollaborative.prototype.getAllZP = function() {

	//console.log('   *** nbZP dans liste ='+this.listeZP.length);

	return this.listeZP;

};




/**

 * retourne le chemin contenant les artefacts de la zone collaborative

 * 

 * @public

 * @returns {String} path

 * @author philippe pernelle

 */

ZoneCollaborative.prototype.getPathArtifacts = function() {

	return this.pathArtifacts;

};


/**

 * retourne le nombre des artefacts associé à la zone collaborative

 * 

 * @public

 * @returns {Number} Nb de AR

 * @author philippe pernelle

 */

ZoneCollaborative.prototype.getNbArtifact = function() {

	return this.artifacts.length;

};


/**

 * retourne la liste des Artefacts de la zone collaborative

 * 

 * @public

 * @returns {artifacts} liste des artifacts

 * @author philippe pernelle

 */

ZoneCollaborative.prototype.getAllArtifacts = function() {

	//console.log('   *** nbArtifact dans liste ='+this.artifacts.length);

	return this.artifacts;

};


/**
 * retourne la liste des artefacts associés à la ZP
 * 
 * @public
 * @returns {Number} Nb de AR
 * @author philippe pernelle
 */

ZoneCollaborative.prototype.getAllArtifactsInZP = function(idZP) {

	var artifactsInZP = [];

	// parcours de tous les artefacts
	for (var i = 0; i < this.getNbArtifact(); i++) 
	{ 
		// test si l'artéfact est dans la ZP
		if (this.artifacts[i].isInto(idZP,CONSTANTE.typeConteneur_ZP))
			{
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

ZoneCollaborative.prototype.getArtifact = function(idAr) {

	var ret = null;

	for (var i = 0; i < this.getNbArtifact(); i++) 
	{ 
		if (this.artifacts[i].getId()===idAr) 
		{
			ret = this.artifacts[i];
		}
	}
	return ret;
};



/**

 * retourne le nombre des artefacts associé à la zone collaborative

 * 

 * @public

 * @returns {Number} Nb de AR

 * @author philippe pernelle

 */

ZoneCollaborative.prototype.getAllArtifactsInZE = function(idZE) {

	var artifactsInZE = [];

	//console.log('   ***  recherche artifact pour ZE='+idZE);

	for (var i = 0; i < this.getNbArtifact(); i++) { 

	

		if (this.artifacts[i].isInto(idZE,CONSTANTE.typeConteneur_ZE))

			{

			artifactsInZE.push(this.artifacts[i]);

			}

	}

	return artifactsInZE;

};


/**

 * retourne le nombre de Zone de Partage (ZP) associé à la zone collaborative

 * 

 * @public

 * @returns {Number} Nb de ZP

 * @author philippe pernelle

 */

ZoneCollaborative.prototype.getNbZP = function() {

	return this.listeZP.length;

};


/**

 * retourne un nouveau numero d'artefact

 * 

 * @public

 * @returns {Number} IdArtefact

 * @author philippe pernelle

 */

ZoneCollaborative.prototype.setIdAr = function() {

	var ret = 1;

	if (this.getNbArtifact() !== 0) {

		// on récupere le dernier IdArtefact du tableau et on ajoute 1

		ret = this.artifacts[this.getNbArtifact() - 1].getId() + 1;

	}

	return ret;

};


/**
 * ajoute un nouveau artefact à la zone collaborative
 * 
 * @public
 * @param {String} creator - pseudo du créateur de l'artifact
 * @param {String} typeArtifact -
 * @param {String} idConteneur -
 * @param {String} typeConteneur - type du conteneur ZE ou ZP
 * @param {JSON } contenu - contenu de l'artifact
 * 
 * @author philippe pernelle
 */

ZoneCollaborative.prototype.addArtifact = function(creator, typeArtifact,idConteneur, typeConteneur,contenu) {

	// calcul d'un nouvel identifiant
	var id = this.setIdAr();
	console.log('    *** ZC : calcul nouveau IdArtifact = '+id);


	// création de l'artifact
	var monArtifact = new Artifact(id, creator, typeArtifact, idConteneur,typeConteneur,contenu);
	console.log('    *** ZC : creation artifact'+monArtifact.getId() );

	// ajout à la liste
	this.artifacts.push(monArtifact);

	console.log('    *** ZC : total artifact ='+ this.artifacts.length);

	};

	
	
/**
 * ajoute un nouveau artefact à la zone collaborative à partir d'un JSON
 * 
 * @public
 * @param {JSON } artifact_json_string - contenu de l'artifact
 * 
 * @author philippe pernelle
 */
ZoneCollaborative.prototype.addArtifactFromJSON = function(artifact_json_string) {
	
	// calcul d'un nouvel identifiant
	var id = this.setIdAr();
	console.log('    *** ZC : calcul nouveau IdArtifact = '+id);

	// création de l'artifact
	
	var monArtifact = Artifact.fromJSON(artifact_json_string,id);
	console.log('    *** ZC : creation artifact depuis un json'+monArtifact.getId() );

	// ajout à la liste
	this.artifacts.push(monArtifact);
	console.log('    *** ZC : total artifact ='+ this.artifacts.length);
	
	//sauvegarde fichier
	var chaine = JSON.stringify(monArtifact);
	var path = this.getPathArtifacts() + monArtifact.getId();
	fs.writeFileSync(path, chaine, "UTF-8");
	console.log('    *** ZC : sauvegarde artifact depuis un json, de type='+monArtifact.getTypeArtefact()+' de path ='+path );
	
	
	if (monArtifact.getTypeArtefact() === CONSTANTE.typeArtefact_Image)
		{
		
		path= path+'.png';
		console.log('    *** ZC : creation artifact : creation image '+path );
		var base64Data  =   monArtifact.contenu.replace(/^data:image\/png;base64,/, "");
		base64Data  +=  base64Data.replace('+', ' ');
		var binaryData  =   new Buffer(base64Data, 'base64').toString('binary');

		fs.writeFile(path, binaryData, "binary", function (err) {
		    console.log(err); // writes out file without error, but it's not a valid image
		});
		
		}
	
	return id;
	
	};

/**
 * ajoute un nouveau artefact à la zone collaborative à partir d'un JSON
 * 
 * @public
 * @param {JSON } 
 * 
 * @author philippe pernelle
 */
ZoneCollaborative.prototype.setArtifactIntoZE = function(idArtifact, IdZE) {
	
	var monArtifact= this.getArtifact(idArtifact);
	monArtifact.setIntoZone(IdZE,CONSTANTE.typeConteneur_ZE);
	
}
ZoneCollaborative.prototype.setArtifactIntoZP = function(idArtifact, IdZP) {
	
	var monArtifact= this.getArtifact(idArtifact);
	monArtifact.setIntoZone(IdZP,CONSTANTE.typeConteneur_ZP);
	
}

/**
 * envoyer un artefact vers la zone de partage
 * @param {string}
 * 				idZP- id de la zone de partage 
 * @param {number } 
 * 				idAr- id de l'artefact à envoyer 
 */


ZoneCollaborative.prototype.addArtifactFromZEPToZP = function(idZP, idAr) {


	this.idZP = idZP;

	this.idAr = idAr;


	for (i = 0; i < this.artifacts.length; i++) {


		if (this.artifacts[i].idAr == idAr) // && (this.listeZP[i].idZP===

											// idZP)) //chercher lartifact ayant l'id correspendante

		{

			this.artifactsInZP.push(this.artifacts[i]);

			console.log( this.artifacts);

			this.artifacts.splice(i,1);//effacer l'artefact déja ajouter à la zone partage


			console.log('........................................................................')


			console.log('*** Artifact numéro # ' +this.idAr + ' est ajouté à la zone de partage , total = '+ this.artifactsInZP.length);

			console.log();

			console.log (this.artifactsInZP[i] );

			console.log();

			(this.newID=this.setIdAr()+i);

			console.log('-- new id =  ' + this.newID);

		}

	}

	console.log('========================================================================')

	console.log('les artifacts envoyés vers la zone de partage sont : \n')

	console.log(this.artifactsInZP);

	console.log('........................................................................')

	console.log('========================================================================')

	console.log('========================================================================')


};


/**

 * Envoie d'artefacts from ZEP to ZE 

 * 

 * @param {string} 

 * 				idZE - id de la zone d'echange

 * @param {number} 

 * 				idAr - id de l'artefact à envoyer 

 */   


ZoneCollaborative.prototype.addArtifactFromZEPToZE = function(idZE, idAr) {


	this.idZE = idZE;

	this.idAr = idAr;

	console.log('========================================================================')


	for (i = 0; i < this.artifacts.length; i++) {


		if (this.artifacts[i].idAr == idAr) // && (this.listeZE[i].idZE===

											// idZE)) //chercher lartifact ayant l'id correspendante

		{

			this.artifactsInZE.push(this.artifacts[i]);

			console.log('*** Artifact ajouté à la zone dechange , total = '+ this.artifactsInZE.length);

			console.log();

			console.log (this.artifactsInZE[i] );

			console.log();

			(this.newArID=this.setIdAr()+i);

			console.log('-- new id =  ' + this.newArID);

		}

	}

	console.log('........................................................................')


	console.log('========================================================================')

	console.log('les artifacts envoyés vers les zones dechanges sont : \n')

	console.log(this.artifactsInZE);

	console.log('========================================================================')

	console.log('========================================================================')

};



/**

 * Envoie d'artefacts from ZE to ZEP 

 * 

 * @param {string} 

 * 				idZEP - id de la zone personnelle

 * @param {number} 

 * 				idAr - id de l'artefact à envoyer 

 */   


ZoneCollaborative.prototype.addArtifactFromZEtoZEP = function(idZEP, idAr) {


	this.idZEP = idZEP;

	this.idAr = idAr;

	console.log('========================================================================')


	for (i = 0; i < this.artifactsInZE.length; i++) {


		if (this.artifactsInZE[i].idAr == idAr) 

		{

			this.artifacts.push(this.artifactsInZE[i]);

			console.log('*** Artifact ajouté à la zone personnelle , total = '+ this.artifacts.length);

			console.log();

			console.log (this.artifacts[i] );

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



/**

 * supprimer artefact de la zone ZE à partir d'un JSON

 * 

 * @public

 * @param {JSON } 

 * 

 * @author philippe pernelle

 */

ZoneCollaborative.prototype.setArtifactIntoEP = function(idAr, idZE, idZEP) {

	
	
	var monArtifact= this.getArtifact(idAr);
	console.log(idAr)
	console.log(idZEP)
	//this.artifacts.pop(monArtifact);
	console.log("artefact supprimé")
	//console.log(this.artifacts)

	monArtifact.setIntoZone(idZEP,CONSTANTE.typeConteneur_EP);


}





/**

 * Envoie d'artefacts from ZP to ZE 

 * 

 * @param {string } 

 * 			idZE - id de la zone de partage

 * @param {number } 

 * 			idAr - id de l'artefact

 */

this.artifactsInZE = [];

this.artifactsInZP = ZoneCollaborative.artifactsInZP ; 



 ZoneCollaborative.prototype.addArtifactFromZPtoZE = function ( idZE, idAr)  {


 this.idAr=idAr;

 this.idZE=idZE; 


 for (var i=0 ; i < this.artifactsInZP.length ; i++)

 {

 if (this.artifactsInZP[i].idAr == idAr)

 {


 this.artifactsInZE.push(this.artifactsInZP[i]);

 console.log(' *** artefact numéro # ' + this.idAr + ' est ajouté à la zone d echange ayant idZE = ' +this.idZE);

 console.log('........................................................................')

 console.log(this.artifactsInZE);

 console.log('========================================================================')

	console.log('========================================================================')


 }

 }

 };

 

 /**

  * Envoie d'artefacts from ZE to ZP 

  * 

  * @param {string } 

  * 			idZP - id de la zone de partage

  * @param {number } 

  * 			idAr - id de l'artefact

  */

 this.artifactsInZP = [];

 this.artifactsInZE = ZoneCollaborative.artifactsInZE ; 



  ZoneCollaborative.prototype.addArtifactFromZEtoZP = function ( idZP, idAr)  {


  this.idAr=idAr;

  this.idZP=idZP; 


  for (var i=0 ; i < this.artifactsInZE.length ; i++)

  {

  if (this.artifactsInZP[i].idAr == idAr)

  {


  this.artifactsInZP.push(this.artifactsInZE[i]);

  console.log(' *** artefact numéro # ' +this.idAr + ' est ajouté à la zone de partage ayant idZP = ' +this.idZP);

  console.log('........................................................................')


  console.log(this.artifactsInZP);

  console.log('========================================================================')

	console.log('========================================================================')

  }

  }

  };


  

  ZoneCollaborative.prototype.consoleArtifacts = function ()  {

  

	  // charge la liste de ZP

	  var liste= [];

	  liste = this.getAllArtifacts();


	  // affiche  la liste total des artifact

	  console.log('    ******************************************************');

	  console.log('    liste totale d artifact de ZC ('+this.getId()+') ');

	  for (var i = 0; i < liste.length; i++) { 

		  console.log('         - Artefact Id='+liste[i].getId()+' | conteneur='+liste[i].getIdConteneur()+' | TypeConteneur='+liste[i].getTypeConteneur() );

	  }

	  console.log('    *******************************************************');

	  console.log('    ZC ('+this.getId()+')  possede '+this.getNbZP()+' ZP ');

	

	  var liste2= [];

	  var listeZE = [];

	  // liste des ZP

	  liste2=this.getAllZP();

  

	  for (i = 0; i < liste2.length; i++) { 

		  // liste des artifacts par ZP

		  liste = this.getAllArtifactsInZP(liste2[i].getId());

		  console.log('         *****   Contenu de ZP ('+liste2[i].getId()+') : Nb artifact trouve = '+liste.length+ ' ****');

		  for (var j = 0; j < liste.length; j++){

			  console.log('                    - Artefact Id='+liste[j].getId()+' | conteneur='+liste[j].getIdConteneur()+' | TypeConteneur='+liste[j].getTypeConteneur() );

		  }  

		  // liste des ZE par ZP

		  listeZE = liste2[i].getAllZE();

		  console.log('         *****   Contenu de ZP ('+liste2[i].getId()+') : Nb ZE trouve = '+listeZE.length);

		  for (j=0; j< listeZE.length; j++)

			  {

			  

			  liste = this.getAllArtifactsInZE(listeZE[j].getId());

			  console.log('                 --> Contenu de ZE ('+listeZE[j].getId()+')  Nb artifact trouve = '+liste.length+ ' <---');

			  for (var k = 0; k < liste.length; k++){

				  console.log('                    - Artefact ='+liste[k].getId());

			  }

			  

			  }

		  

		  

			  

		  

	  }

  }

	  
