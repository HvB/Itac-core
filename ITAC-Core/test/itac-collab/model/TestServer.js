/**
 * Created by Stephane on 06/07/2017.
 */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const assert = require('chai').assert;
chai.use(chaiAsPromised);
const expect = chai.expect;
const io = require('socket.io-client');
const Session = require("../../../itac-collab/model/Session.js");

function connectTablette(socket, pseudo, avatar, login, password, callback){
    return new Promise((resolve, reject)=>{
        function clean(){
            socket.off('EVT_ReponseOKConnexionZEP', success)
            socket.off('EVT_ReponseNOKConnexionZEP', fail);
            socket.off('disconnect', fail);
            socket.off('connect_error', fail);
            socket.off('connect',connect);
        }
        var fail = function (reason){
            clean(socket);
            reject(new Error(reason));
        }
        var success = function (ze, zep){
            clean();
            if (callback) callback(ze, zep);
            resolve({ze:ze, zep:zep});
        }
        var connect = function (){
            socket.emit('EVT_DemandeConnexionZEP', pseudo, avatar, login, password);
        }
        socket.on('EVT_ReponseOKConnexionZEP', success)
        socket.on('EVT_ReponseNOKConnexionZEP', fail);
        socket.on('disconnect', fail);
        socket.on('connect_error', fail);
        socket.on('connect',connect);
        socket.open();
    });
}
function connectZA(socket, url, zp, callback){
    return new Promise((resolve, reject)=>{
        function clean(){
            socket.off('EVT_ReponseOKConnexionZA', success)
            socket.off('EVT_ReponseNOKConnexionZA', fail);
            socket.off('disconnect', fail);
            socket.off('connect_error', fail);
            socket.off('connect',connect);
        }
        var fail = function (reason){
            clean(socket);
            reject(new Error(reason));
        }
        var success = function (conf){
            clean();
            if (callback) callback(conf);
            resolve(conf);
        }
        var connect = function (){
            socket.emit('EVT_DemandeConnexionZA', url, zp);
        }

        socket.on('EVT_ReponseOKConnexionZA', success)
        socket.on('EVT_ReponseNOKConnexionZA', fail);
        socket.on('disconnect', fail);
        socket.on('connect_error', fail);
        socket.on('connect',connect);
        socket.open();
    });
}
describe ("Test serveur", function (){
    describe("Server connection", function(){
        var session;
        var url = 'http://127.0.0.1:8080';
        var url0 = 'http://127.0.0.1:8080';
        var url1 = 'http://127.0.0.2:8080';
        var url2 = 'http://127.0.0.3:8080';
        var login="test_user";
        var idZE0, idZE1;
        var password;
        var socketParams = {forceNew: true, autoConnect: false, reconnection: false, transports: ['websocket']};
        var socketZA;
        var config = {
            "session": {
                "name": "Session_Test",
                "artifactIds": []
            },
            "authentification": {
                "factory": "factory",
                "config": {
                    "type": "YesAuthenticator",
                    "params": ""
                }
            },
            "zc": {
                "config": {
                    "idZC": "ZC_test",
                    "emailZC": "jonh.doe@gmail.com",
                    "descriptionZC": "ZC de test",
                    "nbZP": "1",
                    "ZP": [
                        {
                            "idZP": "Table1",
                            "typeZP": "Table2",
                            "nbZEmin": "2",
                            "nbZEmax": "2",
                            "urlWebSocket": "http://localhost",
                            "portWebSocket": "8080"
                        }
                    ]
                }
            }
        };
        describe("Connection ZA", function(){
            before (function (done){
                this.timeout(5000);
                session = new Session(config);
                socketZA = io(url, socketParams);
                // on attend 4s que le serveur demarre
                setTimeout(done, 4000);
            });
            after(function (done){
                socketZA.close();
                session.close(done);
                // on attend 1s que le serveur s'arrete
                this.timeout(2500);
            });
            it("Expect connection success",function(done){
                connectZA(socketZA,'', 'Table1').then(()=>done()).catch((reason)=>done(reason));
                this.timeout(500);
            });
        });

        describe("Connection ZE", function(){
            var socketZE0, socketZE1, socketZE2;
            describe("Connection 1st ZE OK", function (){
                before(function(done){
                    this.timeout(5000);
                    session = new Session(config);
                    socketZA = io(url, socketParams);
                    socketZE0 = io(url0, socketParams);
                    connectZA(socketZA,'', 'Table1').then(()=>done()).catch((reason)=>done(reason));
                });
                after(function(done){
                    socketZE0.close();
                    socketZA.close();
                    session.close(done);
                    //socketZE0.emit('EVT_Deconnexion', 'pseudo1', idZE0);
                    //setTimeout(()=>{socketZE0.close();},500);
                    // setTimeout(()=>{socketZA.close();},1000);
                    //setTimeout(()=>{session.close();},1500);
                    this.timeout(2500);
                });
                it("Expect connection success",function(done){
                    var okZA = new Promise((resolve, reject)=>{
                        socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                            expect(pseudo).to.equal('pseudo1');
                            //expect(posAvatar).to.equal(1);
                            assert(posAvatar == 1);
                            resolve(pseudo);
                        });
                    });
                    var okZE = connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep)=>{idZE0=ze;});
                    Promise.all([okZA,okZE]).then(()=>done()).catch((reason)=>done(reason));
                });
            });
            describe("Connection 2nd ZE", function(){
                before(function(done){
                    this.timeout(5000);
                    session = new Session(config);
                    socketZA = io(url, socketParams);
                    var p1 = connectZA(socketZA,'', 'Table1');
                    // connection 1ere ZE
                    socketZE0 = io(url0, socketParams);
                    socketZE1 = io(url1, socketParams);
                    p1.then(()=>connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep)=>{idZE0=ze;}))
                        .then(()=>done())
                        .catch((reason)=>done(reason));
                 });
                after(function(done){
                    socketZE1.close();
                    socketZE0.close();
                    socketZA.close();
                    session.close(done);
                    // socketZE0.emit('EVT_Deconnexion', 'pseudo1', idZE0);
                    // socketZE1.emit('EVT_Deconnexion', 'pseudo1', idZE1);
                    // setTimeout(()=>{session.close();},500);
                    this.timeout(2000);
                    // setTimeout(done, 1500);
                });
                it("Expect connection success",function(done){
                    var okZA = new Promise((resolve, reject)=>{
                        socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                            expect(pseudo).to.equal('pseudo2');
                            //expect(posAvatar).to.equal(1);
                            assert(posAvatar == 2);
                            resolve(pseudo);
                        });
                    });
                    var okZE = connectTablette(socketZE1, 'pseudo2', '2', login, password,(ze, zep)=>{idZE1=ze;});
                    Promise.all([okZA,okZE]).then(()=>done()).catch((reason)=>done(reason));
                });
            });
            describe("Connection 3rd ZE", function(){
                before(function(done){
                    this.timeout(5000);
                    session = new Session(config);
                    socketZA = io(url, socketParams);
                    var p1 = connectZA(socketZA,'', 'Table1');
                    // connection 1ere ZE
                    socketZE0 = io(url0, socketParams);
                    socketZE2 = io(url2, socketParams);
                    socketZE1 = io(url1, socketParams);
                    p1.then(()=>Promise.all(
                        [connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep)=>{idZE0=ze;}),
                        connectTablette(socketZE1, 'pseudo2', '2', login, password, (ze, zep)=>{idZE1=ze;})]))
                        .then(()=>done())
                        .catch((reason)=>done(reason));
                });
                after(function(done){
                    socketZE2.close();
                    socketZE1.close();
                    socketZE0.close();
                    socketZA.close();
                    session.close(done);
                    // socketZE0.emit('EVT_Deconnexion', 'pseudo1', idZE0);
                    // socketZE1.emit('EVT_Deconnexion', 'pseudo1', idZE1);
                    // setTimeout(()=>{session.close();},500);
                    this.timeout(2500);
                    //setTimeout(done, 2000);
                });
                it("Expect connection to fail",function(done){
                    connectTablette(socketZE2, 'pseudo3', '3', login, password).then(()=>done(new Error("Should not connect"))).catch(()=>done());
                });
            });
        });
    });

    describe("Artifact transfer", function() {
        var session;
        var url = 'http://127.0.0.1:8080';
        var url0 = 'http://127.0.0.1:8080';
        var login = "test_user";
        var password;
        var socketParams = {forceNew: true, autoConnect: false, reconnection: false, transports: ['websocket']};
        var config = {
            "session": {
                "name": "Session_Test",
                "artifactIds": []
            },
            "authentification": {
                "factory": "factory",
                "config": {
                    "type": "YesAuthenticator",
                    "params": ""
                }
            },
            "zc": {
                "config": {
                    "idZC": "ZC_test",
                    "emailZC": "jonh.doe@gmail.com",
                    "descriptionZC": "ZC de test",
                    "nbZP": "1",
                    "ZP": [
                        {
                            "idZP": "Table1",
                            "typeZP": "Table2",
                            "nbZEmin": "2",
                            "nbZEmax": "2",
                            "urlWebSocket": "http://localhost",
                            "portWebSocket": "8080"
                        }                ]
                }
            }
        };
        var socketZA, socketZE0;
        var idZE, idZEP;
        var idZP = 'Table1';
        var artifactMessage1 = {
            "id": "message1", "creator": "mocha", "owner": "mocha", "type": "message",
            "dateCreation": "2017-06-29T15:08:12.765Z", "title": "Message1", "content": "test de contenu 1"
        };

        var artifactMessage2 = {
            "id": "message2", "creator": "mocha", "owner": "mocha", "type": "message",
            "dateCreation": "2017-06-30T15:08:12.765Z", "title": "Message2", "content": "test de contenu 2"
        };

        describe("Transfer EP->ZE/ZP", function() {
            beforeEach(function (done) {
                this.timeout(6000);
                session = new Session(config);

                // connection ZA et connection ZE
                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep
                    }))
                    .then(() => done())
                    .catch((x) => done(new Error(x)));
            });
            afterEach(function (done) {
                socketZE0.close();
                socketZA.close();
                session.close(done);
                // this.timeout(5000);
                // setTimeout(done, 4000);
                // socketZE0.emit('EVT_Deconnexion', 'pseudo1', idZE);
                // setImmediate(()=>{session.close();});
                //setTimeout(()=>{session.close();},500);
                this.timeout(2000);
                //setTimeout(done, 1500);

            });

            describe("Transfer artefact EP --> ZE", function () {
                it('Expect transfert to be a success', function (done) {
                    var okZE = new Promise((resolve, reject) => {
                        socketZE0.on("EVT_ReceptionArtefactIntoZE", function (pseudo, ze, idArt) {
                            expect(pseudo).to.equal('pseudo1');
                            expect(ze).to.equal(idZE);
                            expect(idArt).to.equal(artifactMessage1.id);
                            resolve(idArt)
                        });
                    });
                    var okZA = new Promise((resolve, reject) => {
                        socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON) {
                            expect(pseudo).to.equal('pseudo1');
                            expect(ze).to.equal(idZE);
                            expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                            resolve(artifactMessage1.id);
                        });
                    });
                    socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                    Promise.all([okZA, okZE]).then(() => done()).catch((reason) => done(reason));
                    this.timeout(500);
                });
            });

            describe("Transfer artefact EP -> ZP", function () {
                it('Expect transfert to be a success', function (done) {
                    var okZE = new Promise((resolve, reject) => {
                        socketZE0.on("EVT_ReceptionArtefactIntoZP", function (pseudo, zp, idArt) {
                            expect(pseudo).to.equal('pseudo1');
                            expect(zp).to.equal(idZP);
                            expect(idArt).to.equal(artifactMessage2.id);
                            resolve(idArt)
                        });
                    });
                    var okZA = new Promise((resolve, reject) => {
                        socketZA.on("EVT_ReceptionArtefactIntoZP", function (ze, zp, chaineJSON) {
                            expect(ze).to.equal(idZE);
                            expect(zp).to.equal(idZP);
                            expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                            resolve(artifactMessage2.id);
                        });
                    });
                    socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2))
                    Promise.all([okZA, okZE]).then(() => done()).catch((reason) => done(reason));
                    this.timeout(500);
                });
            });
        });
        describe("Transfer ZE <--> ZP", function() {
            beforeEach(function (done) {
                this.timeout(6000);
                session = new Session(config);

                // connection ZA et connection ZE
                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }))
                    .then(() => done())
                    .catch((x) => done(new Error(x)));
            });
            afterEach(function (done) {
                socketZE0.close();
                socketZA.close();
                session.close(done);
                // socketZE0.emit('EVT_Deconnexion', 'pseudo1', idZE);
                // setTimeout(()=>{session.close();},500);
                this.timeout(2000);
                //setTimeout(done, 1500);

            });

            describe("Transfer artefact ZE -> ZP", function () {
                it('Expect transfert to be a success', function (done) {
                    socketZE0.on("EVT_Envoie_ArtefactdeZEversZP", function (idArt, ze) {
                        expect(ze).to.equal(idZE);
                        expect(idArt).to.equal(artifactMessage1.id);
                        done();
                    });
                    socketZA.emit('EVT_Envoie_ArtefactdeZEversZP', artifactMessage1.id, idZE, idZP);
                    this.timeout(500);
                });
            });
            describe("Transfer artefact ZP -> ZE", function () {
                it('Expect transfert to be a success', function (done) {
                    socketZE0.on('EVT_Envoie_ArtefactdeZPversZE', function (chaineJSON) {
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                        done();
                    });
                    socketZA.emit('EVT_Envoie_ArtefactdeZPversZE', artifactMessage2.id, idZE);
                    this.timeout(500);
                });
            });
        });
    });

    describe("Deconnection/Reconnection", function() {
        var session;
        var url = 'http://127.0.0.1:8080';
        var url0 = 'http://127.0.0.1:8080';
        var login = "test_user";
        var password;
        var socketParams = {forceNew: true, autoConnect: false, reconnection: false, transports: ['websocket']};
        //var socketParams2 = {forceNew: true, autoConnect: false, reconnection: true, reconnectionAttempts: 2, transports: ['websocket']};
        var config = {
            "session": {
                "name": "Session_Test",
                "artifactIds": []
            },
            "authentification": {
                "factory": "factory",
                "config": {
                    "type": "YesAuthenticator",
                    "params": ""
                }
            },
            "zc": {
                "config": {
                    "idZC": "ZC_test",
                    "emailZC": "jonh.doe@gmail.com",
                    "descriptionZC": "ZC de test",
                    "nbZP": "1",
                    "ZP": [
                        {
                            "idZP": "Table1",
                            "typeZP": "Table2",
                            "nbZEmin": "2",
                            "nbZEmax": "2",
                            "urlWebSocket": "http://localhost",
                            "portWebSocket": "8080"
                        }
                    ]
                }
            }
        };
        var socketZA, socketZE0;
        var idZE, idZEP;
        var idZP = 'Table1';
        var artifactMessage1 = {
            "id": "message1", "creator": "mocha", "owner": "mocha", "type": "message",
            "dateCreation": "2017-06-29T15:08:12.765Z", "title": "Message1", "content": "test de contenu 1"
        };

        var artifactMessage2 = {
            "id": "message2", "creator": "mocha", "owner": "mocha", "type": "message",
            "dateCreation": "2017-06-30T15:08:12.765Z", "title": "Message2", "content": "test de contenu 2"
        };

        describe("Deconnection ZE douce", function(){
            before(function (done) {
                this.timeout(6000);
                session = new Session(config);

                // connection ZA et connection ZE
                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }))
                    .then(() => done())
                    .catch((x) => done(new Error(x)));
            });
            after(function (done) {
                socketZE0.close();
                socketZA.close();
                session.close(done);
                this.timeout(3000);
                //setTimeout(done, 2500);
            });

            it('Expect transfert artifacts to ZP', function(done){
                this.timeout(90000);
                var p1 = new Promise((resolve, reject)=> {
                    socketZA.on('EVT_Deconnexion', function (pseudo, ze) {
                        //expect(pseudo).to.equal('pseudo1');
                        expect(ze).to.equal(idZE);
                        resolve(ze);
                    });
                });
                var p2 = new Promise((resolve, reject)=>{
                    socketZA.on("EVT_Envoie_ArtefactdeZEversZP", function (idArt, ze) {
                        expect(ze).to.equal(idZE);
                        expect(idArt).to.equal(artifactMessage1.id);
                        resolve(artifactMessage1.id);
                    });
                });
                // var p3 = new Promise((resolve, reject)=>{
                //     socketZE0.on('disconnect', ()=>{
                //         resolve();
                //     })
                // });

                socketZE0.emit('EVT_Deconnexion', 'pseudo1', idZE);
                Promise.all([p1,p2]).then(() => done()).catch((reason) => done(reason));
            });
        });

        describe("Deconnection ZE brutale", function(){
            before(function (done) {
                this.timeout(6000);
                session = new Session(config);

                // connection ZA et connection ZE
                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }))
                    .then(() => done())
                    .catch((x) => done(new Error(x)));
            });
            after(function (done) {
                socketZE0.close();
                socketZA.close();
                session.close(done);
                this.timeout(3000);
                //setTimeout(done, 2500);
            });

            it('Expect transfert artifacts to ZP', function(done){
                this.timeout(90000);
                var p1 = new Promise((resolve, reject)=> {
                    socketZA.on('EVT_Deconnexion', function (pseudo, ze) {
                        //expect(pseudo).to.equal('pseudo1');
                        expect(ze).to.equal(idZE);
                        resolve(ze);
                    });
                });
                var p2 = new Promise((resolve, reject)=>{
                    socketZA.on("EVT_Envoie_ArtefactdeZEversZP", function (idArt, ze) {
                        expect(ze).to.equal(idZE);
                        expect(idArt).to.equal(artifactMessage1.id);
                        resolve(artifactMessage1.id);
                    });
                });
                // var p3 = new Promise((resolve, reject)=>{
                //     socketZE0.on('disconnect', ()=>{
                //         resolve();
                //     });
                // });

                socketZE0.emit('EVT_Deconnexion', 'pseudo1', idZE);
                Promise.all([p1,p2]).then(() => done()).catch((reason) => done(reason));
            });
        });

        describe("reconnection ZE", function(){
            before(function (done) {
                this.timeout(6000);
                session = new Session(config);

                // connection ZA et connection ZE
                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                var p1 = connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }));
                var p2 = new Promise((resolve,reject)=>{
                    setTimeout(()=>{
                        socketZE0.emit('EVT_Deconnexion', 'pseudo1', idZE);
                        resolve(idZE);
                    }, 2000);
                });
                var p3 = new Promise((resolve,reject)=>{
                    setTimeout(()=>{
                        resolve(idZE);
                    }, 3000);
                });
                Promise.all([p1,p2,p3]).then(() => done()).catch((reason) => done(reason));
            });
            after(function (done) {
                socketZE0.close();
                socketZA.close();
                session.close(done);
                this.timeout(5000);
            });

            it("Expect connection success",function(done){
                socketZE0 = io(url0, socketParams);
                var okZA = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                        idZE = ze;
                        idZEP =zep;
                        expect(pseudo).to.equal('pseudo1');
                        //expect(posAvatar).to.equal(1);
                        assert(posAvatar == 1);
                        resolve(pseudo);
                    });
                });
                var okZE = connectTablette(socketZE0, 'pseudo1', '1', login, password);
                Promise.all([okZA,okZE]).then(()=>done()).catch((reason)=>done(reason));
                this.timeout(500);
            });
        });
        describe("reconnection ZE suite deconnection brutale", function(){
            before(function (done) {
                this.timeout(6000);
                session = new Session(config);

                // connection ZA et connection ZE
                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                var p1 = connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }));
                var p2 = new Promise((resolve,reject)=>{
                    setTimeout(()=>{
                        //socketZE0.emit('EVT_Deconnexion', 'pseudo1', idZE);
                        socketZE0.close();
                        resolve(idZE);
                    }, 2000);
                });
                var p3 = new Promise((resolve,reject)=>{
                    setTimeout(()=>{
                        resolve(idZE);
                    }, 3000);
                });
                Promise.all([p1,p2,p3]).then(() => done()).catch((reason) => done(reason));
            });
            after(function (done) {
                socketZE0.close();
                socketZA.close();
                session.close(done);
                this.timeout(5000);
                //setTimeout(done, 2500);
            });

            it("Expect connection success",function(done){
                socketZE0 = io(url0, socketParams);
                var okZA = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                        idZE = ze;
                        idZEP =zep;
                        expect(pseudo).to.equal('pseudo1');
                        //expect(posAvatar).to.equal(1);
                        assert(posAvatar == 1);
                        resolve(pseudo);
                    });
                });
                var okZE = connectTablette(socketZE0, 'pseudo1', '1', login, password);
                Promise.all([okZA,okZE]).then(()=>done()).catch((reason)=>done(reason));
                this.timeout(40000);
            });
        });
        describe("reconnection ZA", function(){
            before(function (done) {
                this.timeout(6000);
                session = new Session(config);

                // connection ZA et connection ZE
                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }))
                    .then(() => {socketZA.close(); done();})
                    .catch((x) => done(new Error(x)));
            });
            after(function (done) {
                socketZE0.close();
                socketZA.close();
                session.close(done);
                this.timeout(3000);
                //setTimeout(done, 2500);
            });

            it("Expect connection success",function(done){
                socketZA = io(url, socketParams);
                var p1 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                        expect(pseudo).to.equal('pseudo1');
                        expect(ze).to.equal(idZE);
                        assert(posAvatar == 1);
                        resolve(ze);
                    });
                });
                var p2 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZP', function (pseudo, zp, chaineJSON){
                        expect(pseudo).to.equal('');
                        expect(zp).to.equal(idZP);
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                        resolve(artifactMessage2.id);
                    });
                });
                var p3 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON){
                        expect(pseudo).to.equal('pseudo1');
                        expect(ze).to.equal(idZE);
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                        resolve(artifactMessage1.id);
                    });
                });
                var p0 = connectZA(socketZA, '', 'Table1');
                Promise.all([p0,p1,p2,p3]).then(() => done()).catch((reason) => done(reason));
                this.timeout(500);
            });
        });
    });
});
