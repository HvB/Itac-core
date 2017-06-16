/**
 * Module pour le support de l'authentification via l'annuaire ldap de l'USMB.
 * 
 * @module
 * 
 * @requires LdapAuthenticator
  * @requires authentication
  * 
 * @author Stephane Talbot
 */
const BaseAuthentication = require('./authentication');
const LdapAuthenticator = require('./LdapAuthenticator');

/**
 * Authentificateur associe a l'annuaire LDAP de l'USMB. 
 * 
 * @example
 * let ldapAuth = new UsmbLdapAuthenticator();
 * let p=ldapAuth.verifyCredential(ldapAuth.createCredential('John Doe', 'password'));
 * 
 * @augments {LdapAuthenticator}
 * @author Stephane Talbot
 */
class UsmbLdapAuthenticator extends LdapAuthenticator {
	/**
	 * Constructeur par defaut sans parametres.
	 * Il cree une connection securisee sur le port 636 avec comme DN de  base 'ou=people,ou=uds,dc=agalan,dc=org'.
	 * 
	 * @example
	 * let ldapAuth = new UsmbLdapAuthenticator();
	 */
	constructor(){
		super({baseDn:'ou=people,ou=uds,dc=agalan,dc=org', config:{url:'ldaps://ldap-bourget.univ-savoie.fr', tlsOptions:{rejectUnauthorized:false,ciphers:"SSLv3"}}});
	}
	/**
	 * Methode permettant de verifier des informations d'authentifications (version asynchrone).
	 * L'identifiant de connection peut être le login, l'adresse mail ou le nom complet (champs uid,mail,cn).
	 *  
	 *  @example
	 *  var p1=ldapAuth.verifyCredential(ldapAuth.createCredential('jdoe', 'password'));
	 *  
	 *  @example
	 *  var p2=ldapAuth.verifyCredential(ldapAuth.createCredential('John Doe', 'password'));
	 *  
	 *  @example
	 *  var p2=ldapAuth.verifyCredential(ldapAuth.createCredential('John.Doe@univ-savoie.fr', 'password'));
	 *  
	 * @method 
	 * @param {Credential} credential - credential identifiant l'utilisateur a authentifier (ident + password)
	 * @returns {Promise} une promesse contenant le dn de l'utilisteur en cas de succes. 
	 * 
	 */
	verifyCredential(credential ){
		if ( ! (credential instanceof BaseAuthentication.LoginPwdCredential)){
			console.log('*** USMB LDAP authenticator, credential verification: invalid credential ');
			return Promise.reject(new TypeError('Invalid credential: '+credential));
		} else {
			let login=credential.login;
			let password=credential.password;
			let search = this.search('(|(uid='+login+')(mail='+login+')(cn='+login+'))');
			function firstResolved(l,foo){
				let v = l.pop();
				if (v) {
					console.log('*** USMB LDAP authenticator, trying  matching user: dn='+v);
					return (foo(v).catch((err)=>{
								console.log('dn: '+v+'-->'+err);
								return firstResolved(l,foo);
					}));
				} else {
					console.log('*** USMB LDAP authenticator, end of list or no matching user ');
					return Promise.reject(new Error("invalid user or password"));
				}
			}
			return search.then((l)=>{return firstResolved(l,(dn)=>{return super.verifyCredential(super.createCredential(dn,password));});});
		}
	}
}
// var UsmbLdapAuthenticator=require("./LdapAuthenticator.js");
// ldapAuth = new UsmbLdapAuthenticator();
//var p1=ldapAuth.verifyCredential(ldapAuth.createCredential('stalb', 'password'));
//var p2=ldapAuth.verifyCredential(ldapAuth.createCredential('Stephane Talbot', 'password'));
//
// Enregistrement de l'authentificateur
UsmbLdapAuthenticator.registerAuthenticator(UsmbLdapAuthenticator)

module.exports=UsmbLdapAuthenticator;