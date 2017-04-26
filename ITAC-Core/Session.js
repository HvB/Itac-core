/**
 * Classe pour la gestion des sessions
 *
 * La session est construite en fonction du contexte passe au constructeur.
 * @requires ZoneCollaborative
 * @requires authentification
 * @requires crypto
 * @requires fs
 * 
 * @author Stephane Talbot
 */
const ZoneCollaborative = require('./ZoneCollaborative');
const BaseAuthentification = require("./authentication");
const crypto = require('crypto');
const fs = require('fs');

class Session {
	/**
	 * Constructeur pour la session.
	 * Le contexte de la session permet de construire le syteme d'authentification et la ZC de la session
	 * 
	 * Exemple de contexte : 
	 * { // config specifique a la session : le nom de la session
	 *   "session": {
	 *     "name": "essai2"
	 *   },
	 *   // partie specifique pour l'authentification 
	 *   "authentification": {
	 *     // fabrique charge de la creation de l'autentificateur
	 *    "factory": "factory",
	 *    // configuration passee a la fabrique (type authetificateur + params d'initialisation)
	 *    "config": {
	 *      "type": "FileLoginPwdAuthenticator",
	 *      "params": "./users.json"
	 *    }
	 *  },
	 *  // config de la ZC a utiliser
	 *  "zc": {
	 *    "config": {
	 *      "idZC": "444",
	 *      "nbZP": "2",
	 *      "ZP": [
	 *        {
	 *          "idZP": "Table",
	 *          "typeZP": "TableTactile",
	 *          "nbZEmin": "2",
	 *          "nbZEmax": "4",
	 *          "urlWebSocket": "",
	 *          "portWebSocket": "8080"
	 *        },
	 *        {
	 *          "idZP": "test2",
	 *          "typeZP": "Ecran",
	 *          "nbZEmin": "1",
	 *          "nbZEmax": "6",
	 *          "urlWebSocket": "",
	 *          "portWebSocket": "8081"
	 *        }
	 *      ]
	 *    }
	 *  }
	 *}
	 * 
	 * @constructor
	 * @param {json} context: contexte de la session
	 */
	constructor(context){
		this.context = context;
		this.name = this.context.session.name;
		// creation dispositif d'authetification
		var confAuth = this.context.authentification;
		console.log("factory: "+confAuth.factory);
		var factory = BaseAuthentification.Authenticator.getFactory(confAuth.factory);
		this.auth = factory(confAuth.config);
		// creation de la ZC
		var confZC = this.context.zc.config;
		this.ZC =new ZoneCollaborative(confZC);
		this.ZC.session=this;	
	}
	
	/**
	 * Exportation JSON : en fait on exporte le contexte
	 * 
	 * @returns {json} : contexte de la session
	 */
	toJSON() {
		return this.context;
	}
	
	/**
	 * Methode de sauvegarde de la session (au format json) dans un fichier.
	 * Le nom du fichier depend du nom de la session.
	 * 
	 * @returns {string} nom du fichier de sauvegarde
	 */
	saveSession(){
		var filename = crypto.createHash('sha1').update(this.name,'utf8').digest('hex');
		var stream = fs.createWriteStream("./sessions/"+filename);
		stream.write(JSON.stringify(this, null, 2));
		stream.close();
	}
	/**
	 * Chargement d'une session precedente
	 * 
	 * @param {string} nom de la session a charger
	 * @returns {Session} la session sauvegardee
	 */
	static loadSession(name){
		var filename = crypto.createHash('sha1').update(name,'utf8').digest('hex');
		var data = fs.readFileSync("./sessions/"+filename);
		return new Session(JSON.parse(data));
	}
}

module.exports=Session;