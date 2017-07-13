/**
 * Created by Stephane on 06/07/2017.
 *
 * @Author Stephane Talbot
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
        let fail = function (reason){
            clean(socket);
            reject(new Error(reason));
        };
        let success = function (ze, zep){
            clean();
            if (callback) callback(ze, zep);
            resolve({ze:ze, zep:zep});
        };
        let connect = function (){
            socket.emit('EVT_DemandeConnexionZEP', pseudo, avatar, login, password);
        };
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
        let fail = function (reason){
            clean(socket);
            reject(new Error(reason));
        };
        let success = function (conf){
            clean();
            if (callback) callback(conf);
            resolve(conf);
        };
        let connect = function (){
            socket.emit('EVT_DemandeConnexionZA', url, zp);
        };

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
                this.timeout(200000);
                socketZA.close();
                // on attend la fermeture de la session
                session.close(done);
            });
            it("Expect connection success",function(done){
                connectZA(socketZA,'', 'Table1').then(()=>done()).catch((reason)=>done(reason));
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
                    this.timeout(200000);
                    socketZE0.close();
                    socketZA.close();
                    // on attend la fermeture de la session
                    session.close(done);
                });
                it("Expect connection success",function(done){
                    let okZA = new Promise((resolve, reject)=>{
                        socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                            expect(pseudo).to.equal('pseudo1');
                            //expect(posAvatar).to.equal(1);
                            assert(posAvatar == 1);
                            resolve(pseudo);
                        });
                    });
                    let okZE = connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep)=>{idZE0=ze;});
                    Promise.all([okZA,okZE]).then(()=>done()).catch((reason)=>done(reason));
                });
            });
            describe("Connection 2nd ZE", function(){
                before(function(done){
                    this.timeout(5000);
                    session = new Session(config);
                    socketZA = io(url, socketParams);
                    let p1 = connectZA(socketZA,'', 'Table1');
                    // connection 1ere ZE
                    socketZE0 = io(url0, socketParams);
                    socketZE1 = io(url1, socketParams);
                    p1.then(()=>connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep)=>{idZE0=ze;}))
                        .then(()=>done())
                        .catch((reason)=>done(reason));
                 });
                after(function(done){
                    this.timeout(200000);
                    socketZE1.close();
                    socketZE0.close();
                    socketZA.close();
                    // on attend la fermeture de la session
                    session.close(done);
                });
                it("Expect connection success",function(done){
                    let okZA = new Promise((resolve, reject)=>{
                        socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                            expect(pseudo).to.equal('pseudo2');
                            //expect(posAvatar).to.equal(1);
                            assert(posAvatar == 2);
                            resolve(pseudo);
                        });
                    });
                    let okZE = connectTablette(socketZE1, 'pseudo2', '2', login, password,(ze, zep)=>{idZE1=ze;});
                    Promise.all([okZA,okZE]).then(()=>done()).catch((reason)=>done(reason));
                });
            });
            describe("Connection 3rd ZE", function(){
                before(function(done){
                    this.timeout(5000);
                    session = new Session(config);
                    socketZA = io(url, socketParams);
                    let p1 = connectZA(socketZA,'', 'Table1');
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
                    this.timeout(200000);
                    socketZE2.close();
                    socketZE1.close();
                    socketZE0.close();
                    socketZA.close();
                    // on attend la fermeture de la session
                    session.close(done);
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
                this.timeout(200000);
                socketZE0.close();
                socketZA.close();
                // on attend la fermeture de la session
                session.close(done);
            });

            describe("Transfer artefact EP --> ZE", function () {
                it('Expect transfert to be a success', function (done) {
                    this.timeout(500);
                    let okZE = new Promise((resolve, reject) => {
                        socketZE0.on("EVT_ReceptionArtefactIntoZE", function (pseudo, ze, idArt) {
                            expect(pseudo).to.equal('pseudo1');
                            expect(ze).to.equal(idZE);
                            expect(idArt).to.equal(artifactMessage1.id);
                            resolve(idArt)
                        });
                    });
                    let okZA = new Promise((resolve, reject) => {
                        socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON) {
                            expect(pseudo).to.equal('pseudo1');
                            expect(ze).to.equal(idZE);
                            expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                            resolve(artifactMessage1.id);
                        });
                    });
                    socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                    Promise.all([okZA, okZE]).then(() => done()).catch((reason) => done(reason));
                });
            });

            describe("Transfer artefact EP -> ZP", function () {
                it('Expect transfert to be a success', function (done) {
                    this.timeout(500);
                    let okZE = new Promise((resolve, reject) => {
                        socketZE0.on("EVT_ReceptionArtefactIntoZP", function (pseudo, zp, idArt) {
                            expect(pseudo).to.equal('pseudo1');
                            expect(zp).to.equal(idZP);
                            expect(idArt).to.equal(artifactMessage2.id);
                            resolve(idArt)
                        });
                    });
                    let okZA = new Promise((resolve, reject) => {
                        socketZA.on("EVT_ReceptionArtefactIntoZP", function (ze, zp, chaineJSON) {
                            expect(ze).to.equal(idZE);
                            expect(zp).to.equal(idZP);
                            expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                            resolve(artifactMessage2.id);
                        });
                    });
                    socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2))
                    Promise.all([okZA, okZE]).then(() => done()).catch((reason) => done(reason));
                });
            });
        });
        describe("Transfer ZE <--> ZP", function() {
            beforeEach(function (done) {
                this.timeout(6000);
                session = new Session(config);

                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                // reception artefact1
                let p2 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                        resolve(artifactMessage1.id);
                    });
                });
                // reception artefact2
                let p3 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZP', function (ze, zp, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                        resolve(artifactMessage2.id);
                    });
                 });
                // connexion ZA, puis connexion ZE et enfin envoi d'artefacts en ZE et ZP
                let p1 = connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }));
                // on peut passer a la suite quand la ZA et la ZE se sont connectes et les artefacts arrives en ZE et ZP
                Promise.all([p1,p2,p3]).then(() => done()).catch((reason) => done(reason));
            });
            afterEach(function (done) {
                this.timeout(200000);
                socketZE0.close();
                socketZA.close();
                // on attend la fermeture de la session
                session.close(done);
            });

            describe("Transfer artefact ZE -> ZP", function () {
                it('Expect transfert to be a success', function (done) {
                    socketZE0.on("EVT_Envoie_ArtefactdeZEversZP", function (idArt, ze) {
                        expect(ze).to.equal(idZE);
                        expect(idArt).to.equal(artifactMessage1.id);
                        done();
                    });
                    socketZA.emit('EVT_Envoie_ArtefactdeZEversZP', artifactMessage1.id, idZE, idZP);
                });
            });
            describe("Transfer artefact ZP -> ZE", function () {
                it('Expect transfert to be a success', function (done) {
                    socketZE0.on('EVT_Envoie_ArtefactdeZPversZE', function (chaineJSON) {
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                        done();
                    });
                    socketZA.emit('EVT_Envoie_ArtefactdeZPversZE', artifactMessage2.id, idZE);
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

                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                // reception artefact1
                let p2 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                        resolve(artifactMessage1.id);
                    });
                });
                // reception artefact2
                let p3 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZP', function (ze, zp, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                        resolve(artifactMessage2.id);
                    });
                });
                // connexion ZA, puis connexion ZE et enfin envoi d'artefacts en ZE et ZP
                let p1 = connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }));
                // on peut passer a la suite quand la ZA et la ZE se sont connectes et les artefacts arrives en ZE et ZP
                Promise.all([p1,p2,p3]).then(() => done()).catch((reason) => done(reason));
            });
            after(function (done) {
                this.timeout(200000);
                socketZE0.close();
                socketZA.close();
                // on attend la fermeture de la session
                session.close(done);
            });

            it('Expect transfert artifacts to ZP', function(done){
                this.timeout(90000);
                let p1 = new Promise((resolve, reject)=> {
                    socketZA.on('EVT_Deconnexion', function (pseudo, ze) {
                        expect(pseudo).to.equal('');  // pseudo vide dans ce cas
                        expect(ze).to.equal(idZE);
                        resolve(ze);
                    });
                });
                let p2 = new Promise((resolve, reject)=>{
                    socketZA.on("EVT_Envoie_ArtefactdeZEversZP", function (idArt, ze) {
                        expect(ze).to.equal(idZE);
                        expect(idArt).to.equal(artifactMessage1.id);
                        resolve(artifactMessage1.id);
                    });
                });
                // ne devrait-on pas être deconnecté par le serveur ?
                // let p3 = new Promise((resolve, reject)=>{
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

                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                // reception artefact1
                let p2 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                        resolve(artifactMessage1.id);
                    });
                });
                // reception artefact2
                let p3 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZP', function (ze, zp, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                        resolve(artifactMessage2.id);
                    });
                });
                // connexion ZA, puis connexion ZE et enfin envoi d'artefacts en ZE et ZP
                let p1 = connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }));
                // on peut passer a la suite quand la ZA et la ZE se sont connectes et les artefacts arrives en ZE et ZP
                Promise.all([p1,p2,p3]).then(() => done()).catch((reason) => done(reason));
            });
            after(function (done) {
                this.timeout(200000);
                socketZE0.close();
                socketZA.close();
                // on attend la fermeture de la session
                session.close(done);
            });

            it('Expect transfert artifacts to ZP', function(done){
                this.timeout(90000);
                let p1 = new Promise((resolve, reject)=> {
                    socketZA.on('EVT_Deconnexion', function (pseudo, ze) {
                        //expect(pseudo).to.equal('pseudo1');
                        expect(ze).to.equal(idZE);
                        resolve(ze);
                    });
                });
                let p2 = new Promise((resolve, reject)=>{
                    socketZA.on("EVT_Envoie_ArtefactdeZEversZP", function (idArt, ze) {
                        expect(ze).to.equal(idZE);
                        expect(idArt).to.equal(artifactMessage1.id);
                        resolve(artifactMessage1.id);
                    });
                });
                // on s'est deconnecte tout seul, donc pas de message du serveur ?
                // let p3 = new Promise((resolve, reject)=>{
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

                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                // reception artefact1
                let p2 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                        resolve(artifactMessage1.id);
                    });
                });
                // reception artefact2
                let p3 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZP', function (ze, zp, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                        resolve(artifactMessage2.id);
                    });
                });
                // obtention deconnexion ZE
                let p4 = new Promise((resolve, reject)=> {
                    socketZA.on('EVT_Deconnexion', function (pseudo, ze) {
                        //expect(pseudo).to.equal('pseudo1');
                        expect(ze).to.equal(idZE);
                        resolve(ze);
                    });
                });
                // connexion ZA, puis connexion ZE et enfin envoi d'artefacts en ZE et ZP
                let p1 = connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }));
                // on peut deconnecter la ZE quand la ZA et la ZE se sont connectes et les artefacts arrives en ZE et ZP
                Promise.all([p1,p2,p3]).then(()=>{socketZE0.emit('EVT_Deconnexion', 'pseudo1', idZE);}).catch((reason) => done(reason));
                // on attend ensuite la detetection de la deconnection de la ZE par la ZA
                p4.then(() => done()).catch((reason) => done(reason));
            });
            after(function (done) {
                this.timeout(200000);
                socketZE0.close();
                socketZA.close();
                // on attend la fermeture de la session
                session.close(done);
            });

            it("Expect connection success",function(done){
                socketZE0 = io(url0, socketParams);
                let okZA = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                        idZE = ze;
                        idZEP =zep;
                        expect(pseudo).to.equal('pseudo1');
                        //expect(posAvatar).to.equal(1);
                        assert(posAvatar == 1);
                        resolve(pseudo);
                    });
                });
                let okZE = connectTablette(socketZE0, 'pseudo1', '1', login, password);
                Promise.all([okZA,okZE]).then(()=>done()).catch((reason)=>done(reason));
            });
        });
        describe("reconnection ZE suite deconnection brutale", function(){
            before(function (done) {
                this.timeout(6000);
                session = new Session(config);

                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                // reception artefact1
                let p2 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                        resolve(artifactMessage1.id);
                    });
                });
                // reception artefact2
                let p3 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZP', function (ze, zp, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                        resolve(artifactMessage2.id);
                    });
                });
                // obtention deconnexion ZE
                let p4 = new Promise((resolve, reject)=> {
                    socketZA.on('EVT_Deconnexion', function (pseudo, ze) {
                        //expect(pseudo).to.equal('pseudo1');
                        expect(ze).to.equal(idZE);
                        resolve(ze);
                    });
                });
                // connexion ZA, puis connexion ZE et enfin envoi d'artefacts en ZE et ZP
                let p1 = connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }));
                // on peut deconnecter la ZE quand la ZA et la ZE se sont connectes et les artefacts arrives en ZE et ZP
                Promise.all([p1,p2,p3]).then(() => {socketZE0.close();}).catch((reason) => done(reason));
                // on attend ensuite la detetection de la deconnection de la ZE par la ZA
                p4.then(() => done()).catch((reason) => done(reason));
            });
            after(function (done) {
                this.timeout(200000);
                socketZE0.close();
                socketZA.close();
                // on attend la fermeture de la session
                session.close(done);
            });

            it("Expect connection success",function(done){
                socketZE0 = io(url0, socketParams);
                let okZA = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                        idZE = ze;
                        idZEP =zep;
                        expect(pseudo).to.equal('pseudo1');
                        //expect(posAvatar).to.equal(1);
                        assert(posAvatar == 1);
                        resolve(pseudo);
                    });
                });
                let okZE = connectTablette(socketZE0, 'pseudo1', '1', login, password);
                Promise.all([okZA,okZE]).then(()=>done()).catch((reason)=>done(reason));
             });
        });
        describe("reconnection ZA", function(){
            before(function (done) {
                this.timeout(6000);
                session = new Session(config);

                socketZA = io(url, socketParams);
                socketZE0 = io(url0, socketParams);
                // reception artefact1
                let p2 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                        resolve(artifactMessage1.id);
                    });
                });
                // reception artefact2
                let p3 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZP', function (ze, zp, chaineJSON){
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                        resolve(artifactMessage2.id);
                    });
                });
                // connexion ZA, puis connexion ZE et enfin envoi d'artefacts en ZE et ZP
                let p1 = connectZA(socketZA, '', 'Table1')
                    .then(() => connectTablette(socketZE0, 'pseudo1', '1', login, password, (ze, zep) => {
                        idZE = ze;
                        idZEP = zep;
                        socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
                        socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
                    }));
                // on peut deconnecter la ZA quand la ZA et la ZE se sont connectes et les artefacts arrives en ZE et ZP
                Promise.all([p1,p2,p3]).then(() => {socketZA.close(); done();}).catch((reason) => done(reason));
            });
            after(function (done) {
                this.timeout(200000);
                socketZE0.close();
                socketZA.close();
                // on attend la fermeture de la session
                session.close(done);
            });

            it("Expect connection success",function(done){
                socketZA = io(url, socketParams);
                let p1 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                        expect(pseudo).to.equal('pseudo1');
                        expect(ze).to.equal(idZE);
                        assert(posAvatar == 1);
                        resolve(ze);
                    });
                });
                let p2 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZP', function (ze, zp, chaineJSON){
                        expect(ze).to.equal('');   // on ne sait pas de quelle ZE l'artefact provient lors d'une reconnection...
                        expect(zp).to.equal(idZP);
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                        resolve(artifactMessage2.id);
                    });
                });
                let p3 = new Promise((resolve, reject)=>{
                    socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON){
                        expect(pseudo).to.equal('pseudo1');
                        expect(ze).to.equal(idZE);
                        expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                        resolve(artifactMessage1.id);
                    });
                });
                let p0 = connectZA(socketZA, '', 'Table1');
                Promise.all([p0,p1,p2,p3]).then(() => done()).catch((reason) => done(reason));
            });
        });
    });
});
