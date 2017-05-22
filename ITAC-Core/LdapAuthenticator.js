const ldap = require('ldapjs');
const BaseAuthentification = require("./authentication");

class LdapAuthenticator extends BaseAuthentification.LoginPwdAuthenticator {
	constructor(ldapConfig){
		super();
		this.ldapClient = ldap.createClient(ldapConfig.config);
		this.ldapBaseDN = ldapConfig.baseDn;
	}
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