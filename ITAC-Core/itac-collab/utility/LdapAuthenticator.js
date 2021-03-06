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
 * Module pour le support de l'authentification via un annuaire ldap.
 * 
 * @module
 * 
 * @requires ldapjs
 * @requires bunyan
 * @requires loggers
 * @requires authentication
 * 
 * @author Stephane Talbot
 */
const ldap = require('ldapjs');
const BaseAuthentication = require('./authentication');
const itacLogger = require('./loggers').itacLogger;

var log = itacLogger.child({component: 'LdapAuthenticator'});

/**
 * Authentificateur associe a un annuaire LDAP. 
 * 
 * @example
 * ldapAuth = new LdapAuthenticator({baseDn:'ou=people,ou=uds,dc=agalan,dc=org', config:{url:'ldaps://ldap-bourget.univ-savoie.fr', tlsOptions:{rejectUnauthorized:false,ciphers:"SSLv3"}}});
 * p1=ldapAuth.verifyCredential(ldapAuth.createCredential('uid=jdoe,ou=people,ou=uds,dc=agalan,dc=org', 'myPassword'));
 * 
 * @augments {AbstractLoginPwdAuthenticator}
 * @author Stephane Talbot
 */
class LdapAuthenticator extends BaseAuthentication.AbstractLoginPwdAuthenticator {
	/**
	 * Constructeur par defaut.
	 * 
	 * @param {Object} ldapConfig - config ldap: {baseDn: <base DN utilise  pour les recherches>, config:<ldapj config>}
	 * 
	 * @example 
	 * // connexion non securisee au ldap de l'USBM
	 * ldapAuth = new LdapAuthenticator({baseDn:'ou=people,ou=uds,dc=agalan,dc=org', config:{url:'ldap://ldap-bourget.univ-savoie.fr'}});
	 * 
	 * @example
	 * // connection securisee au ldap de l'USBM
	 * ldapAuth = new LdapAuthenticator({baseDn:'ou=people,ou=uds,dc=agalan,dc=org', config:{url:'ldaps://ldap-bourget.univ-savoie.fr', tlsOptions:{rejectUnauthorized:false,ciphers:"SSLv3"}}});
	 *   
	 */
	constructor(ldapConfig){
		super();
		//this.ldapClient = ldap.createClient(ldapConfig.config);
		this.ldapBaseDN = ldapConfig.baseDn;
		this.ldapConfig=ldapConfig.config;
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
	 * @param {Credential} credential - credential identifiant l'utilisateur a authentifier (dn + password)
	 * @returns {Promise} une promesse contenant le dn de l'utilisteur en cas de succes. 
	 * 
	 * @example
	 * var p1=ldapAuth.verifyCredential(ldapAuth.createCredential('uid=jdoe,ou=people,ou=uds,dc=agalan,dc=org', 'myPassword'));
	 * 
	 */
	verifyCredential(credential ){
		let promise =  new Promise((resolve, reject) => {
			if ( credential instanceof BaseAuthentication.LoginPwdCredential){
				if (credential.password){
					//let dn = 'uid='+credential.login+','+this.ldapBaseDN;
					let ldapClient = ldap.createClient(this.ldapConfig);
					let dn = credential.login;
					log.debug('dn:'+dn);
					let password = credential.password;
					// this.ldapClient.bind(dn, password, (err)=>{
					ldapClient.bind(dn, password, (err)=>{
						if (err ){
							 log.info({err: err}, '*** error during LDAP credential verification :');
							 reject(err);
						} else {
							resolve(credential.login);
						}
						ldapClient.unbind();
					});
				} else {
					log.info('*** LDAP authenticator, credential verification: empty password ');
					throw new Error('Invalid credential: '+credential); 
				}
			} else {
				log.warn('*** LDAP authenticator, credential verification: invalid credential ');
				throw new TypeError('Invalid credential: '+credential); 
			}
		});
		return promise;
	}
	/**
	 * Methode permettant de rechercher des informations dans l'annuaire ldap.
	 * 
	 * @method 
	 * @private
	 * @param {string} request - requete LDAP
	 * @returns {Promise} une promesse contenant la liste des dn correspondant au resultat de la requete. 
	 */
	search(request){
		let promise =  new Promise((resolve, reject) => {
			let res = [];
			let ldapClient = ldap.createClient(this.ldapConfig);
			ldapClient.search(this.ldapBaseDN, 
					{	filter:request,
						scope:'sub',
						attributes:['dn']
					},
					(x,v)=>{
						if (x) {
							log.warn({err: x }, "error for ldap search request: "+request);
						}
						v.on('searchEntry', (r)=>{log.debug("request ("+request+") partial result: "+r.object); res.push(r.object.dn); });
						v.on('end', (r)=>{log.debug("request ("+request+") finished with status: "+r);  ldapClient.unbind(); resolve(res); });
						v.on('error', (err)=>{log.warn(err); reject(err); });
					});
		});
		return promise;
	}
}
// var LdapAuthenticator=require("./LdapAuthenticator.js");
// ldapAuth = new LdapAuthenticator({baseDn:'ou=people,ou=uds,dc=agalan,dc=org', config:{url:'ldap://ldap-bourget.univ-savoie.fr'}});
// ldapAuth = new LdapAuthenticator({baseDn:'ou=people,ou=uds,dc=agalan,dc=org', config:{url:'ldaps://ldap-bourget.univ-savoie.fr', tlsOptions:{rejectUnauthorized:false,ciphers:"SSLv3"}}});
// var p1=ldapAuth.verifyCredential(ldapAuth.createCredential('uid=stalb,ou=people,ou=uds,dc=agalan,dc=org', 'kk'));
//
// var ldapjs=require('ldapjs');
// client2=ldapjs.createClient({url:'ldaps://ldap-bourget.univ-savoie.fr', tlsOptions:{rejectUnauthorized:false,ciphers:"SSLv3"}});
// xx1 = client2.search('ou=people,ou=uds,dc=agalan,dc=org', {filter:'(sn=carron)',scope:'one'},(x,v)=>{console.log(x);v.on('searchEntry', (r)=>{console.log(r.object);});})
// xx2 = client2.bind('uid=stalb,ou=people,ou=uds,dc=agalan,dc=org', 'xxxx', (err)=>{console.log("xx: "+err);})
// xx3 = client2.search('ou=people,ou=uds,dc=agalan,dc=org', {filter:'(&(sn=carron)(ou=iut-chy))',scope:'one',attributes:['dn','sn','cn']},(x,v)=>{console.log(x);v.on('searchEntry', (r)=>{console.log(r.object);});})

//Enregistrement de l'authentificateur
BaseAuthentication.Authenticator.registerAuthenticator(LdapAuthenticator)

module.exports=LdapAuthenticator;