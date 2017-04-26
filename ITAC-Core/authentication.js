const fs = require('fs');
const crypto = require('crypto');


class Credential {
	constructor(){
		if (this.constructor === Credential) {
			throw new TypeError('Abstract class "Credential" cannot be instantiated directly.'); 
		}
		this.uid='';
	}
}

class LoginPwdCredential extends Credential {
	constructor(login, pwd, uid){
		super();
		this.login = login;
		this.password = pwd;
		this.uid = login;
	}
}

let _registred_authenticators = new Array();
let _registred_authenticator_factories = new Array();

class Authenticator {
	constructor(){
		if (this.constructor === Authenticator) {
			throw new TypeError('Abstract class "Authentificator" cannot be instantiated directly.'); 
		}
	}
	verifyCredential( credential){
	}
	static registerAuthenticator(classes){
		if (classes && classes.prototype instanceof Authenticator){
			_registred_authenticators[classes.name] = classes;
		} else {
			for (var i in classes){
				Authenticator.registerAuthenticator(classes[i]);
			}
		}
	}
	static registredAuthenticators(){
		return Object.keys(_registred_authenticators)
	}
	static getAuthenticator(name){
		return _registred_authenticators[name]
	}
	static registerFactory(classes){
		if (classes && typeof classes == 'function'){
			_registred_authenticator_factories[classes.name] = classes;
		} else {
			for (var i in classes){
				Authenticator.registerFactory(classes[i]);
			}
		}
	}
	static registredFactories(){
		return Object.keys(_registred_authenticator_factories)
	}
	static getFactory(name){
		return _registred_authenticator_factories[name]
	}
	createCredential(){
		throw new Error('Abstract method "createCredential" should be redefined in subclasses.');
	}
}

class YesAuthenticator extends Authenticator {
	
	verifyCredential(credential ){
		if ( credential instanceof Credential){
			return credential.uid;
		} else {
			throw new TypeError('Invalid credential: '+credential); 
		}
	}
	createCredential(uid){
		return new LoginPwdCredential(uid);
	}
}

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

class LoginPwdAuthenticator extends Authenticator {
	constructor(userDB){
		super();
		if ( ! userDB instanceof LoginPwdDB) {
			throw new TypeError('Invalid user DB : '+userDB); 
		} else {
			this.userDB = Object.freeze(userDB);
		}
	}
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
	createCredential(login, password){
		return new LoginPwdCredential(login, password);
	}
}

class FileLoginPwdAuthenticator extends LoginPwdAuthenticator {
	constructor(myfile){
		console.log('password file : '+ myfile);
		var data = fs.readFileSync(myfile, {flag:'r', encoding:'utf8'});
		super(new LoginPwdDB(JSON.parse(data)));
	}
}

// enregistrement de la liste des fournisseurs de service d'auhtentification
Authenticator.registerAuthenticator({ YesAuthenticator:  YesAuthenticator, LoginPwdAuthenticator: LoginPwdAuthenticator, FileLoginPwdAuthenticator: FileLoginPwdAuthenticator });

// fabrique d'authetificateur par defaut
var factory = function (config){
	var classname = config.type;
	var params = config.params;
	if (classname == "LoginPwdAuthenticator"){
		return new LoginPwdAuthenticator(LoginPwdDB(params));
	} else if (classname) {
		return new (Authenticator.getAuthenticator(classname))(params);
	}
}
// enregistrement de la fabrique
Authenticator.registerFactory(factory);

console.log('Authenticators: '+Authenticator.registredAuthenticators());
console.log('Factories: '+Authenticator.registredFactories());

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
module.exports = {Authenticator, YesAuthenticator, LoginPwdCredential, 
		LoginPwdAuthenticator, LoginPwdDB, FileLoginPwdAuthenticator};
