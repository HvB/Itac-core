/*
 *     Copyright © 2016-2018 AIP Primeca RAO
 *     Copyright © 2016-2018 Université Savoie Mont Blanc
 *     Copyright © 2017 David Wayntal
 *
 *     This file is part of ITAC-Core.
 *
 *     ITAC-Core is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
/**
 * Module pour le support de l'authentification via l'annuaire ldap de l'USMB.
 * 
 * @module
 * 
 * @requires bunyan
 * @requires loggers
 * @requires LdapAuthenticator
 * @requires authentication
 * 
 * @author Stephane Talbot
 */
const BaseAuthentication = require('./authentication');
const LdapAuthenticator = require('./LdapAuthenticator');
const itacLogger = require('./loggers').itacLogger;

var log = itacLogger.child({component: 'UsmbLdapAuthenticator'});

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
			log.warn('*** USMB LDAP authenticator, credential verification: invalid credential ');
			return Promise.reject(new TypeError('Invalid credential: '+credential));
		} else {
			let login=credential.login;
			let password=credential.password;
			let search = this.search('(|(uid='+login+')(mail='+login+')(cn='+login+'))');
			function firstResolved(l,foo){
				let v = l.pop();
				if (v) {
					log.debug('*** USMB LDAP authenticator, trying  matching user: dn='+v);
					return (foo(v).catch((err)=>{
								log.debug('*** USMB LDAP authenticator, authentication failed with matching user: dn='+v);
								return firstResolved(l,foo);
					}));
				} else {
					log.debug('*** USMB LDAP authenticator, end of list or no matching user ');
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