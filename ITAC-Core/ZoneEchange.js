/**
 * Cette classe permet de créer une Zone d'Echange qui est associé à une Zone de Partage .
 * 
 * @requires ZonePartage
 * @requires Artifact
 * @requires Serveur
 * @requires Constantes
 * 
 * @author philippe pernelle
 * 
 */
var Artifact = require('./Artifact');
var ZP = require('./ZonePartage');

var ZoneEchange = function(ZP, idZE, idZEP, visible) {
	
	this.ZP = ZP;
	this.idZE = idZE;
	this.idZEP = idZEP; 
	this.visible = true;
	console.log('   	 +++ Zone Echange créée : ZP parent = ' + this.ZP.idZP+' | idZE = ' + this.idZE +' | idZEP associé = ' + this.idZEP+' | visibility = ' + this.visible);
};

module.exports = ZoneEchange;


ZoneEchange.prototype.getId = function() {
	return this.idZE;
};

ZoneEchange.prototype.getIdZEP = function() {
	return this.idZEP;
};

ZoneEchange.prototype.SetVisibility = function(ZEmin, ZEmax) {
	return this.visible;
};
