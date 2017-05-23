/**
 * Module de base pour le support de l'authentification.
 * 
 * @module
 * 
 * @requires crypto
 * @requires fs
 * 
 * @author Stephane Talbot
 */
const fs = require('fs');
const crypto = require('crypto');

/**
 * Class abstraite pour la representation des infos d'authentification.
 * 
  * @abstract 
 * 
 */
class Credential {
	/**
	 * Constructeur par defaut.
	 * 
	 * @throws {TypeError} c'est une classe abstraite.
	 */
	constructor(){
		if (this.constructor === Credential) {
			throw new TypeError('Abstract class "Credential" cannot be instantiated directly.'); 
		}
		this.uid='';
	}
}

/**
 * Class pour la representation des infos d'authentification de type login/mot de passe. 
 * 
 * @augments {Credential}
 * 
 */
class LoginPwdCredential extends Credential {
	/**
	 * Constructeur.
	 * 
	 * @param login - the login 
	 * @param pwd - the password 
	 */
	constructor(login, pwd, uid){
		super();
		this.login = login;
		this.password = pwd;
		this.uid = login;
	}
}

// gestion de la liste des authentificateurs utilisables
let _registred_authenticators = {};
//gestion de la liste des fabriques d'authentificateur utilisables
let _registred_authenticator_factories = {};

/**
 * Class abstraite pour les authentificateurs. 
 * 
  * @abstract 
 * 
 */
class Authenticator {
	/**
	 * Constructeur par defaut.
	 * 
	 * @throws {TypeError} c'est une classe abstraite.
	 */
	constructor(){
		if (this.constructor === Authenticator) {
			throw new TypeError('Abstract class "Authentificator" cannot be instantiated directly.'); 
		}
	}
	/**
	 * Methode permettant de verifier des informations d'authentifications.
	 * 
	 * @method 
	 * @param {Credential} credential - credential identifiant l'utilisateur a authentifier
	 * @returns 
	 */
	verifyCredential( credential){
	}
	/**
	 * Methode statique d'enregistrer une ou plusieurs methodes d'authentification (an Authenticator).
	 * 
	 * @static
	 * @method 
	 * @param {Authenticator|Authenticator[]|Object.<key, Authenticator>} classes -classe ou liste de classes a enregistrer.
	 */
	static registerAuthenticator(classes){
		if (classes && classes.prototype instanceof Authenticator){
			_registred_authenticators[classes.name] = classes;
		} else {
			for (var i in classes){
				Authenticator.registerAuthenticator(classes[i]);
			}
		}
	}
	/**
	 * Methode permettant d'obtenir la liste des methodes d'authentification enregistrées.
	 * 
	 * @method 
	 * @static
	 * @returns {string[]} la liste des methodes d'autentifications enregistrees
	 */
	static registredAuthenticators(){
		return Object.keys(_registred_authenticators)
	}
	/**
	 * Methode permettant d'obtenir une des methodes authentification enregistrées.
	 * 
	 * @method 
	 * @static
	 * @param {string} name - nom de la classes correspondant à la methode d'authentification
	 * @returns {Authenticator}
	 */
	static getAuthenticator(name){
		return _registred_authenticators[name]
	}
	/**
	 * Methode statique d'enregistrer une ou plusieurs fabriques pour les methodes d'authentification.
	 * 
	 * @static
	 * @method 
	 * @param {function|function[]|Object.<key, function>} factories -fonction ou liste de fonctions a enregistrer.
	 */
	static registerFactory(factories){
		if (factories && typeof factories == 'function'){
			_registred_authenticator_factories[factories.name] = factories;
		} else {
			for (var i in factories){
				Authenticator.registerFactory(factories[i]);
			}
		}
	}
	/**
	 * Methode permettant d'obtenir la liste des fabriques enregistrées pour les methodes d'authentification.
	 * 
	 * @method 
	 * @static
	 * @returns {string[]} la liste des fabriques enregistrees
	 */
	static registredFactories(){
		return Object.keys(_registred_authenticator_factories)
	}
	/**
	 * Methode permettant d'obtenir une des fabriques enregistrées pour les methodes d'authentification.
	 * 
	 * @method 
	 * @static
	 * @param {string} name - nom de la fabrique recherche
	 * @returns {function} la fabrique
	 */
	static getFactory(name){
		return _registred_authenticator_factories[name]
	}
	/**
	 * Methode permettant de creer des informations d'authentification adaptées a la methodes d'authentifications courrante..
	 * 
	 * @method 
	 * @abstract
	 * @param informations d'authentification
	 * @returns {Credential} un credentaila adapté
	 * @throws {Error} la classe est abtraite et la methode doit etre redefinie dans les sous classes.
	 */
	createCredential(){
		throw new Error('Abstract method "createCredential" should be redefined in subclasses.');
	}
}

/**
 * Authentificateurs qui accepte tout. 
 * 
 * @augments {Authenticator}
 * 
 */
class YesAuthenticator extends Authenticator {
	
	/**
	 * Methode permettant de verifier des informations d'authentifications.
	 * La reponse est toujours positive.
	 * 
	 * @method 
	 * @override
	 * @param {Credential} credential - credential identifiant l'utilisateur a authentifier
	 * @returns 
	 */
	verifyCredential(credential ){
		if ( credential instanceof Credential){
			return credential.uid;
		} else {
			throw new TypeError('Invalid credential: '+credential); 
		}
	}
	/**
	 * Methode permettant de creer des informations d'authentification adaptées a la methodes d'authentifications courrante..
	 * 
	 * @method 
	 * @override
	 * @param uid - informations d'authentification
	 * @returns {Credential} un credential adapte
	 */
	createCredential(uid){
		return new LoginPwdCredential(uid);
	}
}

/**
 * Authentificateurs qui refuse tout. 
 * 
 * @augments {Authenticator}
 */
class NoAuthenticator extends Authenticator {
	
	/**
	 * Methode permettant de verifier des informations d'authentifications.
	 * La reponse est toujours negative.
	 * 
	 * @method 
	 * @override
	 * @param {Credential} credential - credential identifiant l'utilisateur a authentifier
	 * @returns 
	 */
	verifyCredential(credential ){
		return undefined;
	}
	/**
	 * Methode permettant de creer des informations d'authentification adaptées a la methodes d'authentifications courrante..
	 * 
	 * @method 
	 * @override 
	 * @param uid - informations d'authentification
	 * @returns {Credential} un credential adapté
	 */
	createCredential(uid){
		return new LoginPwdCredential(uid);
	}
}

/**
 * Classe pour la representation d'une base d'utilisateurs de type login/mot de passe. 
 * 
 */
class LoginPwdDB {
	constructor(userArray){
		this.users = Object.freeze(userArray);
	}
	getUid(login){
		var i = 0;
		var uid;
		while (i < this.users.length && this.users[i].login != login){
			i++;
		}
		if (i < this.users.length){
			uid = this.users[i].login;
		} 
		return uid;
	}
	getPwdHash(login){
		var i = 0;
		var hash;
		while (i < this.users.length && this.users[i].login != login){
			i++;
		}
		if (i < this.users.length){
			hash = this.users[i].hash;
		} 
		return hash;
	}
	static createPassword(secret){
		var algo='pbkdf2';
		var iter=1<<17;
		var keylen=32;
		var digest='sha256';
		var salt = crypto.randomBytes(32);
		var hash=crypto.pbkdf2Sync(secret, salt, iter, keylen, digest);
		var res=algo+'$'+iter+'$'+keylen+'$'+digest+'$'+salt.toString('base64')+'$'+hash.toString('base64');
		console.log('salt: '+salt.toString('hex'));
		console.log('hash: '+hash.toString('hex'));
		return res;
	}
}

/**
 * Authentificateur associe a une base de type login/mot de passe. 
 * 
 * @augments {Authenticator}
 */
class LoginPwdAuthenticator extends Authenticator {
	/**
	 * Constructeur par defaut.
	 * 
	 * @param {LoginPwdDB} userDB - fbase des couples login/mot de passe.
	 */
	constructor(userDB){
		super();
		if ( ! userDB instanceof LoginPwdDB) {
			throw new TypeError('Invalid user DB : '+userDB); 
		} else {
			this.userDB = Object.freeze(userDB);
		}
	}
	/**
	 * Methode permettant de verifier des informations d'authentifications.
	 * On verifie si le couple {login, password} du credential est dans la base d'utilisateurs.
	 * 
	 * @method 
	 * @override
	 * @param {LoginPwdCredential} credential - credential de l'utilisateur a authentifier
	 * @returns 
	 */
	verifyCredential(credential ){
		if ( credential instanceof LoginPwdCredential){
			var hash = this.userDB.getPwdHash(credential.login);
			if (hash){
				var key = hash.split('$');
				console.log('login: '+credential.login);
				console.log('pwd: '+credential.password);
				console.log('hash: '+hash);
				if (key.length != 6 || key[0] != 'pbkdf2'){
					console.log('Invalid password hashd for' +login+': '+hash);
					return undefined;
				} else {
					var algo=key[0];
					var iter=Number(key[1]);
					var keylen=Number(key[2]);
					var digest=key[3]
					var salt=new Buffer(key[4],'base64');
					//var hashedpwd=new Buffer(key[5],'base64');
					var hashedpwd=key[5];
				}
				var hashedcandidate = crypto.pbkdf2Sync(credential.password, salt, iter, keylen, digest);
				console.log('hashed candidate: '+hashedcandidate.toString('base64'));
				console.log('salt: '+salt.toString('hex'));
				console.log('hash: '+new Buffer(hashedpwd,'base64').toString('hex'));
				console.log('hashed candidate: '+hashedcandidate.toString('hex'));
				var ok = (hashedcandidate.toString('base64') == hashedpwd);
				if (ok) {
					console.log('password OK ');
					console.log('uid: '+ this.userDB.getUid(credential.login));
					return this.userDB.getUid(credential.login);
				} else {
					console.log('password KO ');
					return undefined;
				}
			}
		} else {
			throw new TypeError('Invalid credential: '+credential); 
		}
	}
	/**
	 * Methode permettant de creer des informations d'authentification adaptées a la methodes d'authentifications.
	 * 
	 * @method 
	 * @param login - the login 
	 * @param password - the password 
	 * @returns {LoginPwdCredential} un credential adapté
	 */
	createCredential(login, password){
		return new LoginPwdCredential(login, password);
	}
}

/**
 * Authentificateur associe a une base de type login/mot de passe, stockee dans un fichier. 
 * 
 * @augments {LoginPwdAuthenticator}
 */
class FileLoginPwdAuthenticator extends LoginPwdAuthenticator {
	/**
	 * Constructeur par defaut.
	 * 
	 * @param {string} path - fichier contenant la base des couples login/mot de passe (au format JSON).
	 */
	constructor(path){
		console.log('password file : '+ path);
		var data = fs.readFileSync(path, {flag:'r', encoding:'utf8'});
		super(new LoginPwdDB(JSON.parse(data)));
	}
}

// enregistrement de la liste des fournisseurs de service d'auhtentification
Authenticator.registerAuthenticator({ YesAuthenticator:  YesAuthenticator, NoAuthenticator:  NoAuthenticator, LoginPwdAuthenticator: LoginPwdAuthenticator, FileLoginPwdAuthenticator: FileLoginPwdAuthenticator });

// fabrique d'authetificateur par defaut
/**
 * Factory for the authenticators. On cree l'autentificateur a partir du nom
 * de sa classe et de sa configuration.
 * 
 * @function
 * @param {json} configuration de l'authenticator
 * @return {Authenticator} instance cree
 */
var factory = function factory(config){
	// nom de la classe a utiliser
	var classname = config.type;
	// configuration de l'authentificateur (depend du type d'authetificateur)
	var params = config.params;
	if (classname == "LoginPwdAuthenticator"){
		return new LoginPwdAuthenticator(new LoginPwdDB(params));
	} else if (classname) {
		return new (Authenticator.getAuthenticator(classname))(params);
	}
}
// enregistrement de la fabrique
Authenticator.registerFactory(factory);

// liste des authetificateurs et fabriques 
console.log('Authenticators: '+Authenticator.registredAuthenticators());
console.log('Factories: '+Authenticator.registredFactories());

module.exports = {Authenticator, YesAuthenticator, LoginPwdCredential, 
		LoginPwdAuthenticator, LoginPwdDB, FileLoginPwdAuthenticator};

/*  Exemples d'utilisations : 

//creation d'un authenticator (qui dit tjs oui)
var authenticator = new YesAuthenticator();
//creation d'un jeton de connexion
var credential = authenticator.createCredential('joe');
//verification (on obtieni un id si c'est bon et undefined sinon -- normalement c'est tjs bon) 
var id1 = authenticator.verifyCredential(new LoginPwdCredential('joe','xxx'));
console.log('joe: '+ id1);

//creation d'une liste d'utilisateurs
var users =    [ { login: 'joe' }, {login: 'jeanne'} ];
//on cree les mots de passes
users[0].hash=LoginPwdDB.createPassword('joe');
users[1].hash=LoginPwdDB.createPassword('jeanne');
//creation de la base de login
var db = new LoginPwdDB(users);
//creation d'un authenticator
var authenticator2 = new LoginPwdAuthenticator(db);
//verifications
var id2 = authenticator2.verifyCredential(authenticator2.createCredential('joe','xxx')); // faux
var id3 = authenticator2.verifyCredential(authenticator2.createCredential('jeanne','jeanne')); // vrai
console.log('joe/xxx: '+ id2);
console.log('jeanne/jeanne: '+ id3);
//avec une liste d'utilisateur dans un fichier
var authenticator3 = new FileLoginPwdAuthenticator('./users.json');
//verifications
var id4 = authenticator3.verifyCredential(authenticator3.createCredential('joe','joe')); // vrai
var id5 = authenticator3.verifyCredential(authenticator3.createCredential('jeanne','jeanne')); // faux
console.log('joe/joe: '+ id4);
console.log('jeanne/jeanne: '+ id5);

*/