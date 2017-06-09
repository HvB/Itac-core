var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
const BasicAuthentication = require('../authentication');
const LdapAuthenticator = require('../LdapAuthenticator');
chai.use(chaiAsPromised);
var expect = chai.expect;

describe("LDAP Authentication", function () {
	var server; 
	var config={baseDn:'o=acme,d=fr', config:{url:'ldap://localhost:3389'}}
	before(function(done){
		var ldap = require('ldapjs');

		///--- Shared handlers
		function authorize(req, res, next) {
		  /* Any user may search after bind, only cn=root has full power */
		  var isSearch = (req instanceof ldap.SearchRequest);
		  if (!req.connection.ldap.bindDN.equals('cn=root') && !isSearch)
		    return next(new ldap.InsufficientAccessRightsError());
		  
		  return next();
		}

		///--- Globals
		var SUFFIX = 'o=acme, d=fr';
		var db = {	'd=fr':{}, 'o=acme, d=fr':{}, 
					'uid=joe, o=acme, d=fr':{uid:'joe', userpassword:'joe', cn:'Joe Black', mail:'Joe.Black@acme.fr'},
					'uid=jeanne, o=acme, d=fr':{uid:'jeanne', userpassword:'12345', cn:'Jeanne Doe', mail:'Jeanne.Doe@acme.fr'} 
		};
		
		server = ldap.createServer();

		server.bind('cn=root', function(req, res, next) {
		  if (req.dn.toString() !== 'cn=root' || req.credentials !== 'secret')
		    return next(new ldap.InvalidCredentialsError());

		  res.end();
		  return next();
		});

		server.add(SUFFIX, authorize, function(req, res, next) {
		  var dn = req.dn.toString();

		  if (db[dn])
		    return next(new ldap.EntryAlreadyExistsError(dn));

		  db[dn] = req.toObject().attributes;
		  res.end();
		  return next();
		});

		server.bind(SUFFIX, function(req, res, next) {
		  var dn = req.dn.toString();
		  if (!db[dn])
		    return next(new ldap.NoSuchObjectError(dn));

		  if (!db[dn].userpassword)
		    return next(new ldap.NoSuchAttributeError('userPassword'));

		  if (db[dn].userpassword.indexOf(req.credentials) === -1)
		    return next(new ldap.InvalidCredentialsError());

		  res.end();
		  return next();
		});

		server.compare(SUFFIX, authorize, function(req, res, next) {
		  var dn = req.dn.toString();
		  if (!db[dn])
		    return next(new ldap.NoSuchObjectError(dn));

		  if (!db[dn][req.attribute])
		    return next(new ldap.NoSuchAttributeError(req.attribute));

		  var matches = false;
		  var vals = db[dn][req.attribute];
		  for (var i = 0; i < vals.length; i++) {
		    if (vals[i] === req.value) {
		      matches = true;
		      break;
		    }
		  }

		  res.end(matches);
		  return next();
		});

		server.del(SUFFIX, authorize, function(req, res, next) {
		  var dn = req.dn.toString();
		  if (!db[dn])
		    return next(new ldap.NoSuchObjectError(dn));

		  delete db[dn];

		  res.end();
		  return next();
		});

		server.modify(SUFFIX, authorize, function(req, res, next) {
		  var dn = req.dn.toString();
		  if (!req.changes.length)
		    return next(new ldap.ProtocolError('changes required'));
		  if (!db[dn])
		    return next(new ldap.NoSuchObjectError(dn));

		  var entry = db[dn];

		  for (var i = 0; i < req.changes.length; i++) {
		    mod = req.changes[i].modification;
		    switch (req.changes[i].operation) {
		    case 'replace':
		      if (!entry[mod.type])
		        return next(new ldap.NoSuchAttributeError(mod.type));

		      if (!mod.vals || !mod.vals.length) {
		        delete entry[mod.type];
		      } else {
		        entry[mod.type] = mod.vals;
		      }

		      break;

		    case 'add':
		      if (!entry[mod.type]) {
		        entry[mod.type] = mod.vals;
		      } else {
		        mod.vals.forEach(function(v) {
		          if (entry[mod.type].indexOf(v) === -1)
		            entry[mod.type].push(v);
		        });
		      }

		      break;

		    case 'delete':
		      if (!entry[mod.type])
		        return next(new ldap.NoSuchAttributeError(mod.type));

		      delete entry[mod.type];

		      break;
		    }
		  }

		  res.end();
		  return next();
		});

		server.search(SUFFIX, authorize, function(req, res, next) {
		  var dn = req.dn.toString();
		  if (!db[dn])
		    return next(new ldap.NoSuchObjectError(dn));

		  var scopeCheck;

		  switch (req.scope) {
		  case 'base':
		    if (req.filter.matches(db[dn])) {
		      res.send({
		        dn: dn,
		        attributes: db[dn]
		      });
		    }

		    res.end();
		    return next();

		  case 'one':
		    scopeCheck = function(k) {
		      if (req.dn.equals(k))
		        return true;

		      var parent = ldap.parseDN(k).parent();
		      return (parent ? parent.equals(req.dn) : false);
		    };
		    break;

		  case 'sub':
		    scopeCheck = function(k) {
		      return (req.dn.equals(k) || req.dn.parentOf(k));
		    };

		    break;
		  }

		  Object.keys(db).forEach(function(key) {
		    if (!scopeCheck(key))
		      return;

		    if (req.filter.matches(db[key])) {
		      res.send({
		        dn: key,
		        attributes: db[key]
		      });
		    }
		  });

		  res.end();
		  return next();
		});

		///--- Fire it up
		server.listen(3389, function(err) {
		  //console.log('LDAP server up at: %s', server.url);
		  if (err) return done(err);
		  else done();
		});
	});

	after(function(done){
		//console.log('server ldap, open connections: '+server.connections);
		//server.close((err)=>{if (err) done(err); else done();});  
		// server.close don't accept callback ==> https://github.com/mcavage/node-ldapjs/issues/438
		// so listening for 'close' event...
		server.on('close', ()=>{
			//console.log("ldap server closed"); 
			done();
		});
		server.close();
	});
	
	describe("Generic LdapAuthenticatior", function (){
		describe("Constructor", function (){
			it("Expect class Constructor to work", function(){
				expect(new LdapAuthenticator(config)).to.exist;
			});		
		});
		describe("Credential creation", function (){
			it("Expect createCredential method to create a valide credential", function(){
				expect((new LdapAuthenticator(config)).createCredential('Joe', "12345")).to.be.an.instanceof(BasicAuthentication.LoginPwdCredential);
			});		
		});
		describe("Verifying credential", function (){
			var authenticator;
			before(function(){
				authenticator = new LdapAuthenticator(config);
			})
			it("Expect verify credential to respond OK with valid credential - 1", function(){
				let credential = authenticator.createCredential('uid=joe,o=acme,d=fr', 'joe');
				return expect(authenticator.verifyCredential(credential)).to.eventually.exist.and.equals('uid=joe,o=acme,d=fr');
			});		
			it("Expect verify credential to respond OK with valid credential - 2", function(){
				let credential = authenticator.createCredential('uid=jeanne,o=acme,d=fr', '12345');
				return expect(authenticator.verifyCredential(credential)).to.eventually.exist.and.equals('uid=jeanne,o=acme,d=fr');
			});		
			it("Expect verify credential to fail with invalid credential (invalid password) - 1", function(){
				let credential = authenticator.createCredential('uid=joe,o=acme,d=fr', '12345');
				return expect(authenticator.verifyCredential(credential)).to.be.rejected;
			});		
			it("Expect verify credential to fail with invalid credential (invalid password) - 2", function(){
				let credential = authenticator.createCredential('uid=jeanne,o=acme,d=fr', 'jeanne');
				return expect(authenticator.verifyCredential(credential)).to.be.rejected;
			});		
			it("Expect verify credential to fail with invalid credential (invalid login - dn) - 3", function(){
				let credential = authenticator.createCredential('uid=john,o=acme,d=fr', '12345');
				return expect(authenticator.verifyCredential(credential)).to.be.rejected;
			});		
			it("Expect verify credential to fail with empty password - 1", function(){
				let credential = authenticator.createCredential('uid=joe,o=acme,d=fr', '');
				return expect(authenticator.verifyCredential(credential)).to.be.rejected;
			});		
			it("Expect verify credential to fail with empty password - 2", function(){
				let credential = authenticator.createCredential('uid=joe,o=acme,d=fr', undefined);
				return expect(authenticator.verifyCredential(credential)).to.be.rejected;
			});		
			it("Expect verify credential to fail with empty password - 3", function(){
				let credential = authenticator.createCredential('uid=joe,o=acme,d=fr');
				return expect(authenticator.verifyCredential(credential)).to.be.rejected;
			});		
			it("Expect verify credential to fail with no parameters", function(){
				return expect(authenticator.verifyCredential()).to.be.rejected;
			});		
			it("Expect verify credential to fail with invalid parameters", function(){
				return expect(authenticator.verifyCredential('uid=joe,o=acme,d=fr', 'joe')).to.be.rejected;
			});		
		});
		describe("Searching", function (){
			var authenticator;
			before(function(){
				authenticator = new LdapAuthenticator(config);
			})
			it("Test search - one result", function(){
				return expect(authenticator.search('uid=joe')).to.eventually.be.an('array').that.has.deep.members(['uid=joe, o=acme, d=fr']);
			});		
			it("Test search - several results", function(){
				return expect(authenticator.search('mail=*@acme.fr'))
					.to.eventually.be.an('array').that.has.deep.members(['uid=joe, o=acme, d=fr', 'uid=jeanne, o=acme, d=fr']);
			});		
			it("Test search - empty result", function(){
				return expect(authenticator.search('uid=*Paul*'))
					.to.eventually.be.an('array').that.is.empty;
			});		
			it("Test search - invalid query", function(){
				return expect(authenticator.search('(uid=j*) & (o=acme)').catch(()=>{return [];})).to.eventually.be.empty;
			});		
		});
	});	
});
