/**
 * cette classe représente un Artefact qui va être echangé

 * 
 * 
 */
//var Constantes=require('./Constante');

//var CONSTANTE = new Constantes();

/**
 * constructeur de la classe Artifact
 * 
 * @constructor
 * @param {Number} idAr Identifiant de l'artifact
 * @param {String} creator nom du createur de l'artifact
 *          
 * @author philippe pernelle
 */


var Artifact= function (idAr,createur,typeArtefact,idConteneur,typeConteneur,modificateurs,titre,contenu){	
	
	
	console.log('    ---- creation Artefact recu'+' | idAr = '+idAr+' | creator = '+createur+' | typeArtefact = '+typeArtefact+
			' | idConteneur = '+idConteneur+' | typeConteneur = '+typeConteneur);
	
	this.idAr=idAr;
	this.createur=createur;
	this.proprietaire=createur;
	this.typeArtefact=typeArtefact;
	this.idConteneur=idConteneur;
	this.typeConteneur=typeConteneur;
	this.dateCreation = Date.now();
	this.derniereModification = Date.now();
	this.modificateurs = [];
	this.titre = titre;
	this.contenu = contenu;
	
	console.log('    ---- creation Artefact'+' | idAr = '+this.idAr+' | creator = '+this.createur+' | typeArtefact = '+this.typeArtefact+
			' | idConteneur = '+this.idConteneur+' | typeConteneur = '+this.typeConteneur);
	
	
	// ajouter la sauvegarde de l'articat dans un repertoire temporaire
	
	
};




Artifact.fromJSON = function(artifact_json_string,idAr) {
	console.log('    ---- creation Artefact from JSON : CHAINE ='+artifact_json_string);
	console.log('    ---- creation Artefact from JSON : OBJ ='+JSON.parse(artifact_json_string));
	
	var temp = JSON.parse(artifact_json_string);
    var art = new Artifact(idAr, temp.createur, temp.typeArtefact, temp.idConteneur, temp.typeConteneur, temp.modificateurs,temp.titre,temp.contenu);
     art.idAr=idAr;
     return art;
};


module.exports=  Artifact;




Artifact.prototype.isInto = function(idConteneur,typeConteneur) {
	return ((this.typeConteneur === typeConteneur) && (this.idConteneur=== idConteneur));
};



/**
 * retourne l'identifiant de l'artefact
 * @return {String} Id Artefact
 */
Artifact.prototype.getId=function()
{
	return this.idAr;
};

/**
 * retourne le createur de l'artefact
 * @return {String} creator
 */
Artifact.prototype.getCreateur = function() {
	return this.createur;
};

/**
 * retourne l'identifiant de l'artefact
 * @return {String} Id Artefact
 */
Artifact.prototype.getIdConteneur=function()
{
	return this.idConteneur;
};

/**
 * retourne l'identifiant de l'artefact
 * @return {String} Id Artefact
 */
Artifact.prototype.getTypeConteneur=function()
{
	return this.typeConteneur;
};

/**
 * indique si l'artefact à un propriétaire
 * @return {Boolean} Id Artefact
 */
Artifact.prototype.hasOwner = function() {
	return this.proprietaire !== null;
};

/**
 * retourne le properietaire de l'artefact
 * @return {String} owner
 */

Artifact.prototype.getOwner=function()
{
return this.proprietaire;	
};


/**
 * retourne le typle de l'artefact
 * @return {String} type
 */ 
Artifact.prototype.getTypeArtefact=function()
{
	return this.typeArtefact;
};


Artifact.prototype.sizeModifier = function() {
	return this.modificateurs.length;
};

/**
 * retourne si lartefact est modifeir ou non
 * @return {Boolean} 
 */ 
Artifact.prototype.hasModifier = function(modifier) {
	for (var i = 0; i < this.modificateurs.length; i++) {
		if (this.modificateurs[i].equals(modifier)) {
			return true;
		}
	}
	return false;
};

/**
 * retourne les artefaacts modifiers
 * 
 */
Artifact.prototype.getModifier = function(n) {
	return this.modificateurs[n];
};

Artifact.prototype.addModifier = function(modifier) {
	if (!modifier.equals(this.creator) && !this.hasModifier(modifier)) {
		this.modificateurs.push(modifier);
	}
	this.derniereModification = Date.now();
};

/**
 * indique si l'artefact à un titre
 * @return {Boolean} title
 */

Artifact.prototype.hasTitle = function(titre) {
	return this.titre == titre;
};

/**
 * retourne le titre de l'artefact
 * @return {String} title 
 */
Artifact.prototype.getTitle = function() {
	return this.titre;
};

/**
 * set le titre de l'artefact
 * @return {String} title
 */
Artifact.prototype.setTitle = function(titre) {
	this.titre = titre;
};


Artifact.prototype.setOldTitle = function(oldTitle) {
	this.oldTitle = oldTitle;
};


/**
 * retourne le createur de l'artefact
 * @return {String} creator
 */



/**
 * set  le message de l'artefact
 * @return {String} message
 */ 

Artifact.prototype.setMessage = function(message) {
	this.message = message;
};


/**
 * mettre l'artefact dans la ZE
 * @return {number} idConteneur
 *  * @return {number} typeConteneur
 */

Artifact.prototype.setIntoZone=function(idConteneur,typeConteneur)
{
	this.idConteneur=idConteneur;
	this.typeConteneur=typeConteneur;
};




/**
 * comparaison entre 2 art pour voir s'il ya une modification
 * @return {Boolean} 
 */

Artifact.prototype.equals = function(artefact) {
	return this.idAr == artefact.getId();
};
