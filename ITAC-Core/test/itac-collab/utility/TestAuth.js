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
var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
const BasicAuthentication = require('../../../itac-collab/utility/authentication');
	
chai.use(chaiAsPromised);
var expect = chai.expect;

describe("Basic Authentication", function () {
	describe("Authenticator", function (){
		describe("Constructor throws an exception", function (){
			it("Expect Abstract class Constructor throws an exception", function(){
				expect(()=>{new BasicAuthentication.Authenticator();}).to.throw();
			});		
		});
		
		describe("YesAuthenticator", function (){
			describe("Constructor", function (){
				it("Expect class Constructor to work", function(){
					expect(new BasicAuthentication.YesAuthenticator()).to.exist;
				});		
			});
			describe("Credential creation", function (){
				it("Expect createCredential method to create a valide credential", function(){
					expect((new BasicAuthentication.YesAuthenticator()).createCredential('Joe')).to.be.an.instanceof(BasicAuthentication.Credential);
				});		
			});
			describe("Verifying credential", function (){
				it("Expect verify credential to respond OK", function(){
					let credential = new BasicAuthentication.LoginPwdCredential('Joe', '12345')
					return expect((new BasicAuthentication.YesAuthenticator()).verifyCredential(credential)).to.eventually.exist;
				});		
				it("Expect verify credential to fail with no parameters", function(){
					return expect((new BasicAuthentication.YesAuthenticator()).verifyCredential()).to.be.rejected;
				});		
				it("Expect verify credential to fail with invalid parameters", function(){
					return expect((new BasicAuthentication.YesAuthenticator()).verifyCredential('Joe', '12345')).to.be.rejected;
				});		
			});
		});
		
		describe("NoAuthenticator", function (){
			describe("Constructor", function (){
				it("Expect class Constructor to work", function(){
					expect(new BasicAuthentication.NoAuthenticator()).to.exist;
				});		
			});
			describe("Credential creation", function (){
				it("Expect createCredential method to create a valide credential", function(){
					expect((new BasicAuthentication.NoAuthenticator()).createCredential('Joe')).to.be.an.instanceof(BasicAuthentication.Credential);
				});		
			});
			describe("Verifying credential", function (){
				it("Expect verify credential to fail", function(){
					let credential = new BasicAuthentication.LoginPwdCredential('Joe', '12345')
					return expect(new BasicAuthentication.NoAuthenticator().verifyCredential(credential)).to.be.rejected;
				});		
				it("Expect verify credential to fail with no parameters", function(){
					return expect(new BasicAuthentication.NoAuthenticator().verifyCredential()).to.be.rejected;
				});		
				it("Expect verify credential to fail with invalid parameters", function(){
					return expect(new BasicAuthentication.NoAuthenticator().verifyCredential('Joe', '12345')).to.be.rejected;
				});		
			});
		});
		describe("LoginPwdAuthenticator", function (){
			var db; 
			before(function(){
				let LoginPwdDB = BasicAuthentication.LoginPwdDB;
				let users = [ { login: 'Joe' }, {login: 'Jeanne'} ];
				users[0].hash=LoginPwdDB.createPassword('joe');
				users[1].hash=LoginPwdDB.createPassword('jeanne');
				db = new LoginPwdDB(users);
			});
			describe("Constructor", function (){
				it("Expect class Constructor to work", function(){
					expect(new BasicAuthentication.LoginPwdAuthenticator(db)).to.exist;
				});		
			});
			describe("Credential creation", function (){
				it("Expect createCredential method to create a valide credential", function(){
					expect((new BasicAuthentication.LoginPwdAuthenticator(db)).createCredential('Joe', "12345")).to.be.an.instanceof(BasicAuthentication.LoginPwdCredential);
				});		
			});
			describe("Verifying credential", function (){
				var authenticator;
				before(function(){
					authenticator = new BasicAuthentication.LoginPwdAuthenticator(db);
				})
				it("Expect verify credential to respond OK with valid credential - 1", function(){
					let credential = new BasicAuthentication.LoginPwdCredential('Joe', 'joe');
					return expect(authenticator.verifyCredential(credential)).to.eventually.exist;
				});		
				it("Expect verify credential to respond OK with valid credential - 2", function(){
					let credential = new BasicAuthentication.LoginPwdCredential('Jeanne', 'jeanne');
					return expect(authenticator.verifyCredential(credential)).to.eventually.exist;
				});		
				it("Expect verify credential to fail with invalid credential - 1", function(){
					let credential = new BasicAuthentication.LoginPwdCredential('Joe', '12345');
					return expect(authenticator.verifyCredential(credential)).to.be.rejected;
				});		
				it("Expect verify credential to fail with invalid credential - 2", function(){
					let credential = new BasicAuthentication.LoginPwdCredential('Jeanne', '12345');
					return expect(authenticator.verifyCredential(credential)).to.be.rejected;
				});		
				it("Expect verify credential to fail with invalid credential - 3", function(){
					let credential = new BasicAuthentication.LoginPwdCredential('Pierre', '12345');
					return expect(authenticator.verifyCredential(credential)).to.be.rejected;
				});		
				it("Expect verify credential to fail with no parameters", function(){
					return expect(authenticator.verifyCredential()).to.be.rejected;
				});		
				it("Expect verify credential to fail with invalid parameters", function(){
					return expect(authenticator.verifyCredential('Joe', 'joe')).to.be.rejected;
				});		
			});
		});
		describe("FileLoginPwdAuthenticator", function (){
			var db = 'test/itac-collab/utility/users.json';
			describe("Constructor", function (){
				it("Expect class Constructor to work", function(){
					expect(new BasicAuthentication.FileLoginPwdAuthenticator(db)).to.exist;
				});		
			});
			describe("Credential creation", function (){
				it("Expect createCredential method to create a valide credential", function(){
					expect((new BasicAuthentication.FileLoginPwdAuthenticator(db)).createCredential('Joe', "12345")).to.be.an.instanceof(BasicAuthentication.LoginPwdCredential);
				});		
			});
			describe("Verifying credential", function (){
				var authenticator;
				before(function(){
					authenticator = new BasicAuthentication.FileLoginPwdAuthenticator(db);
				})
				it("Expect verify credential to respond OK with valid credential", function(){
					let credential = new BasicAuthentication.LoginPwdCredential('joe', 'joe');
					return expect(authenticator.verifyCredential(credential)).to.eventually.exist;
				});		
				it("Expect verify credential to fail with invalid credential - 1", function(){
					let credential = new BasicAuthentication.LoginPwdCredential('joe', '12345');
					return expect(authenticator.verifyCredential(credential)).to.be.rejected;
				});		
				it("Expect verify credential to fail with invalid credential - 2", function(){
					let credential = new BasicAuthentication.LoginPwdCredential('jeanne', 'jeanne');
					return expect(authenticator.verifyCredential(credential)).to.be.rejected;
				});		
				it("Expect verify credential to fail with no parameters", function(){
					return expect(authenticator.verifyCredential()).to.be.rejected;
				});		
				it("Expect verify credential to fail with invalid parameters", function(){
					return expect(authenticator.verifyCredential('Joe', 'joe')).to.be.rejected;
				});		
			});
		});
	});	
});