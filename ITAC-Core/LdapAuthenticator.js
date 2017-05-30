const ldap = require('ldapjs');
const BaseAuthentification = require("./authentication");

class LdapAuthenticator extends BaseAuthentification.LoginPwdAuthenticator {
	constructor(ldapConfig){
		super();
		this.ldapClient = ldap.createClient(ldapConfig.config);
		this.ldapBaseDN = ldapConfig.baseDn;
	}
	/**
	 * Methode permettant de verifier des informations d'authentifications (version synchrone).
	 * Le methode n'est pas supporte pour l'authentification LDAP et elle renvoie tjs une exception !!!
	 * 
	 * @deprecated since ever
	 * @method 
	 * @param {Credential} credential - credential identifiant l'utilisateur a authentifier
	 * @returns id de l'utilisteur en cas de succes, undefined sinon 
	 * @throws {Error} la verification synchrone n'est pas supportee.
	 */
	verifyCredentialSync( credential){
		throw new Error('unsupported.');
	}
	/**
	 * Methode permettant de verifier des informations d'authentifications (version asynchrone).
	 * 
	 * @method 
	 * @param {Credential} credential - credential identifiant l'utilisateur a authentifier
	 * @returns {Promise} une promesse contenant l'id de l'utilisteur en cas de succesn 
	 * @throws {Error} si la verification synchrone n'est pas supportee.
	 */
	verifyCredential(credential ){
		let promise =  new Promise((resolve, reject) => {
			if ( credential instanceof BaseAuthentification.LoginPwdCredential){
				if (credential.password){
					//let dn = 'uid='+credential.login+','+this.ldapBaseDN;
					let dn = credential.login;
					console.log('dn:'+dn)
					let password = credential.password;
					this.ldapClient.bind(dn, password, (err)=>{
						if (err ){
							 console.log('*** error durinf LDAP credential verification :'+err);
							 reject(err);
						} else {
							resolve(credential.login);
						}
					});
				} else {
					console.log('*** LDAP authenticator, credential verification: empty password ');
					throw new TypeError('Invalid credential: '+credential); 
				}
			} else {
				console.log('*** LDAP authenticator, credential verification: invalid credential ');
				throw new TypeError('Invalid credential: '+credential); 
			}
		});
		return promise;
	}
}

module.exports=LdapAuthenticator;