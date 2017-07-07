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

describe("Server connection", function(){
    var session;
    var url = 'http://localhost:8080';
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
    before (function (done){
        this.timeout(5000);
        session = new Session(config);
        // on attend 4s que le serveur demarre
        setTimeout(done, 4000);
    });
    after(function (done){
        session.close();
        // on attend 1s que le serveur s'arrete
        this.timeout(5000);
        setTimeout(done, 4000);
    });
    describe("Connection ZA", function(){
        describe("Connection ZA OK", function (){
            it("Expect connection success",function(done){
            var socket0 = socketZA = io(url, socketParams);
                socket0.on('EVT_ReponseOKConnexionZA', ()=>{
                    socket0.off('disconnect');
                    socket0.off('connect_error');
                    done()
                });
                socket0.on('EVT_ReponseNOKConnexionZA', ()=>{done(new Error("connection refused by server"))});
                socket0.on('disconnect', (reason)=>{done(new Error(reason))});
                socket0.on('connect_error', (err)=>{done(new Error(err))});
                socket0.on('connect',()=>{
                    socket0.emit('EVT_DemandeConnexionZA', '', 'Table1');
                });
                socket0.open();
                this.timeout(500);
            });
        });
    });

    describe("Connection ZE", function(){
        describe("Connection 1st ZE OK", function (){
            it("Expect connection success",function(done){
                var socket0 = io(url, socketParams);
                var messageToZE = false;
                var messageToZA = false;
                socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                    expect(pseudo).to.equal('pseudo1');
                    //expect(posAvatar).to.equal(1);
                    assert(posAvatar == 1);
                    messageToZA = true;
                    if (messageToZA && messageToZE) {
                        socket0.off('disconnect');
                        socket0.off('connect_error');
                        socket0.off("EVT_ReponseOKConnexionZEP");
                        socketZA.off("EVT_NewZEinZP");
                        done();
                    }
                });

                socket0.on('EVT_ReponseOKConnexionZEP', ()=>{
                    messageToZE = true;
                    if (messageToZA && messageToZE) {
                        socket0.off('disconnect');
                        socket0.off('connect_error');
                        socket0.off("EVT_ReponseOKConnexionZEP");
                        socketZA.off("EVT_NewZEinZP");
                        done();
                    }
                });
                socket0.on('EVT_ReponseNOKConnexionZEP', ()=>{done(new Error("connection refused by server"));});
                socket0.on('disconnect', (reason)=>{done(new Error(reason));});
                socket0.on('connect_error', (err)=>{done(new Error(err));});
                socket0.on('connect',()=>{
                    socket0.emit('EVT_DemandeConnexionZEP', 'pseudo1', '1');
                });
                socket0.open();
                this.timeout(500);
            });
        });
        describe("Connection 2nd ZE", function(){
            describe("Connection 2nd ZE", function (){
                it("Expect connection success",function(done){
                    var socket0 = io(url, socketParams);
                    var messageToZE = false;
                    var messageToZA = false;
                    socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                        expect(pseudo).to.equal('pseudo2');
                        //expect(posAvatar).to.equal(2);
                        assert(posAvatar == 2);
                        messageToZA = true;
                        if (messageToZA && messageToZE) {
                            socket0.off('disconnect');
                            socket0.off('connect_error');
                            socket0.off("EVT_ReponseOKConnexionZEP");
                            socketZA.off("EVT_NewZEinZP");
                            done();
                        }
                    });
                    socket0.on('EVT_ReponseOKConnexionZEP', ()=>{
                        messageToZE = true;
                        if (messageToZA && messageToZE) {
                            socket0.off('disconnect');
                            socket0.off('connect_error');
                            socket0.off("EVT_ReponseOKConnexionZEP");
                            socketZA.off("EVT_NewZEinZP");
                            done();
                        }
                    });
                    socket0.on('EVT_ReponseNOKConnexionZEP', ()=>{done(new Error("connection refused by server"));});
                    socket0.on('disconnect', (reason)=>{done(new Error(reason));});
                    socket0.on('connect_error', (err)=>{done(new Error(err));});
                    socket0.on('connect',()=>{
                        socket0.emit('EVT_DemandeConnexionZEP', 'pseudo2', '2');
                    });
                    socket0.open();
                    this.timeout(1000);
                });
            });
        });
        describe("Connection 3rd ZE", function(){
            describe("Connection 3rd ZE", function (){
                it("Expect connection fails",function(done){
                    var socket0 = io(url, socketParams);
                    socket0.on('EVT_ReponseOKConnexionZEP', ()=>{done(new Error("Should not connect"));});
                    socket0.on('EVT_ReponseNOKConnexionZEP', ()=>{
                        socket0.off('disconnect')
                        socket0.off('connect_error')
                        done();
                    });
                    socket0.on('disconnect', (reason)=>{done(new Error(reason));});
                    socket0.on('connect_error', (err)=>{done(new Error(err));});
                    socket0.on('connect',()=>{
                        socket0.emit('EVT_DemandeConnexionZEP', 'pseudo3', '3');
                    });
                    socket0.open();
                    this.timeout(500);
                });
            });
        });
    });
});

describe("Artifact transfer", function(){
    var session;
    var url = 'http://localhost:8080';
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
    var artifactMessage1 = {
        "id": "message1", "creator": "mocha", "owner": "mocha", "type": "message",
        "dateCreation": "2017-06-29T15:08:12.765Z", "title": "Message1", "content": "test de contenu 1"
    };

    var artifactMessage2 = {
        "id": "message2", "creator": "mocha", "owner": "mocha", "type": "message",
        "dateCreation": "2017-06-30T15:08:12.765Z", "title": "Message2", "content": "test de contenu 2"
    };

    before (function (done){
        this.timeout(6000);
        session = new Session(config);

        // connection ZA
        socketZA = io(url, socketParams);
        //socketZA.on('EVT_ReponseOKConnexionZA', ()=>{done()});
        socketZA.on('EVT_ReponseNOKConnexionZA', ()=>{done(new Error("connection refused by server"))});
        //socketZA.on('disconnect', (reason)=>{done(new Error(reason))});
        //socketZA.on('connect_error', (err)=>{done(new Error(err))});
        socketZA.on('connect',()=>{
            socketZA.emit('EVT_DemandeConnexionZA', '', 'Table1');
        });
        socketZA.open();

        // connection ZE
        socketZE0 = io(url, socketParams);
        // on demarre le test quand le ze se connecte
        socketZE0.on('EVT_ReponseOKConnexionZEP', (ze, zep)=>{
            idZE = ze; idZEP = zep;
            socketZE0.off('EVT_ReponseOKConnexionZEP');
            done();
        });
        socketZE0.on('EVT_ReponseNOKConnexionZEP', ()=>{done(new Error("connection refused by server"));});
        //socketZE0.on('disconnect', (reason)=>{done(new Error(reason));});
        //socketZE0.on('connect_error', (err)=>{done(new Error(err));});
        socketZE0.on('connect',()=>{
            socketZE0.emit('EVT_DemandeConnexionZEP', 'pseudo1', '1');
        });

        // on attend 4s que le serveur demarre avant de lancer la ZA puis les clients
        setTimeout(function (){
            socketZA.open();
        }, 4000);
        setTimeout(function (){
            socketZE0.open();
        }, 4500);

    });
    after(function (done){
        session.close();
        // on attend 1s que le serveur s'arrete
        this.timeout(5000);
        setTimeout(done, 4000);
    });

    describe("Transfer artefact EP -> ZE", function(){
        it('Expect transfert to be a success', function(done){
            var messageToZE = false;
            var messageToZA = false;
            socketZE0.on("EVT_ReceptionArtefactIntoZE", function (pseudo, ze, idArt){
                expect(pseudo).to.equal('pseudo1');
                expect(ze).to.equal(idZE);
                expect(idArt).to.equal(artifactMessage1.id);
                messageToZE = true;
                if (messageToZA && messageToZE) {
                    socketZE0.off("EVT_ReceptionArtefactIntoZE");
                    socketZA.off("EVT_ReceptionArtefactIntoZE");
                    done();
                }
            });
            socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON){
                expect(pseudo).to.equal('pseudo1');
                expect(ze).to.equal(idZE);
                expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                messageToZA = true;
                if (messageToZA && messageToZE) {
                    socketZE0.off("EVT_ReceptionArtefactIntoZE");
                    socketZA.off("EVT_ReceptionArtefactIntoZE");
                    done();
                }
            });
            socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage1));
            this.timeout(500);
        });
    });

    describe("Transfer artefact EP -> ZP", function(){
        it('Expect transfert to be a success', function(done){
            var idZP = 'Table1';
            var messageToZE = false;
            var messageToZA = false;
            socketZE0.on("EVT_ReceptionArtefactIntoZP", function (pseudo, zp, idArt){
                expect(pseudo).to.equal('pseudo1');
                expect(zp).to.equal(idZP);
                expect(idArt).to.equal(artifactMessage2.id);
                messageToZE = true;
                if (messageToZA && messageToZE) {
                    socketZE0.off("EVT_ReceptionArtefactIntoZP");
                    socketZA.off("EVT_ReceptionArtefactIntoZP");
                    done();
                }
            });
            socketZA.on('EVT_ReceptionArtefactIntoZP', function (pseudo, zp, chaineJSON){
                expect(pseudo).to.equal('pseudo1');
                expect(zp).to.equal(idZP);
                expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                messageToZA = true;
                if (messageToZA && messageToZE) {
                    socketZE0.off("EVT_ReceptionArtefactIntoZP");
                    socketZA.off("EVT_ReceptionArtefactIntoZP");
                    done();
                }
            });
            socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage2));
            this.timeout(500);
        });
    });
    describe("Transfer artefact ZE -> ZP", function(){
        it('Expect transfert to be a success', function(done){
            var idZP = 'Table1';
            socketZE0.on("EVT_Envoie_ArtefactdeZEversZP", function (idArt, ze){
                expect(ze).to.equal(idZE);
                expect(idArt).to.equal(artifactMessage1.id);
                socketZE0.off("EVT_Envoie_ArtefactdeZEversZP");
                done();
            });
            socketZA.emit('EVT_Envoie_ArtefactdeZEversZP', artifactMessage1.id, idZE, idZP);
            this.timeout(500);
        });
    });
    describe("Transfer artefact ZP -> ZE", function(){
        it('Expect transfert to be a success', function(done){
             socketZE0.on('EVT_Envoie_ArtefactdeZPversZE', function (chaineJSON){
                expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                socketZE0.off('EVT_Envoie_ArtefactdeZPversZE');
                done();
            });
            socketZA.emit('EVT_Envoie_ArtefactdeZPversZE', artifactMessage2.id, idZE);
            this.timeout(500);
        });
    });
    describe("deconnection ZE", function(){
        it('Expect transfert artifacts to ZP', function(done){
            var messageDeconnection = false;
            socketZA.on('EVT_Deconnexion', function (pseudo, ze){
                //expect(pseudo).to.equal('pseudo1');
                expect(ze).to.equal(idZE);
                socketZA.off('EVT_Deconnexion');
                done()
            });

            socketZE0.close();
            this.timeout(500);
        });
    });
    describe("reconnection ZE", function(){
        it("Expect connection success",function(done){
            var messageToZE = false;
            var messageToZA = false;
            socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                expect(pseudo).to.equal('pseudo1');
                //expect(posAvatar).to.equal(1);
                assert(posAvatar == 1);
                messageToZA = true;
                if (messageToZA && messageToZE) {
                    socketZE0.off('disconnect');
                    socketZE0.off('connect_error');
                    socketZE0.off("EVT_ReponseOKConnexionZEP");
                    socketZA.off("EVT_NewZEinZP");
                    done();
                }
            });

            socketZE0.on('EVT_ReponseOKConnexionZEP', ()=>{
                messageToZE = true;
                if (messageToZA && messageToZE) {
                    socketZE0.off('disconnect');
                    socketZE0.off('connect_error');
                    socketZE0.off("EVT_ReponseOKConnexionZEP");
                    socketZA.off("EVT_NewZEinZP");
                    done();
                }
            });
            socketZE0.on('EVT_ReponseNOKConnexionZEP', ()=>{done(new Error("connection refused by server"));});
            socketZE0.on('disconnect', (reason)=>{done(new Error(reason));});
            socketZE0.on('connect_error', (err)=>{done(new Error(err));});
            // socketZE0.on('connect',()=>{
            //     socketZE0.emit('EVT_DemandeConnexionZEP', 'pseudo1', '1');
            // });
            socketZE0.open();
            this.timeout(500);
        });
    });
    describe("reconnection ZA", function(){
        before(function (done){
            socketZE0.on('EVT_Envoie_ArtefactdeZPversZE', function (chaineJSON){
                // on ferme la connection de la ZA
                socketZA.close();
                done();
            });
            // on remet l'artefact2 dans la ZE
            socketZA.emit('EVT_Envoie_ArtefactdeZPversZE', artifactMessage2.id, idZE);
            this.timeout(500);
        });
        it("Expect connection success",function(done){
            var messageNewZE = false;
            var messageArtifact1 = false;
            var messageArtifact2 = false;
            socketZA.on('EVT_NewZEinZP', function(pseudo, ze, zep, posAvatar){
                expect(pseudo).to.equal('pseudo1');
                //expect(posAvatar).to.equal(1);
                assert(posAvatar == 1);
                messageNewZE = true;
            });
            socketZA.on('EVT_ReceptionArtefactIntoZP', function (pseudo, zp, chaineJSON){
                //expect(pseudo).to.equal('pseudo1');
                expect(zp).to.equal(idZP);
                expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage1);
                messageArtifact1 = true;
                if (messageNewZE && messageArtifact1 && messageArtifact2) {
                    socketZA.off("EVT_NewZEinZP");
                    socketZA.off("EVT_ReceptionArtefactIntoZP");
                    socketZA.off("EVT_ReceptionArtefactIntoZE");
                    done();
                }
            });
            socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON){
                //expect(pseudo).to.equal('pseudo1');
                expect(ze).to.equal(idZE);
                expect(JSON.parse(chaineJSON)).to.deep.include(artifactMessage2);
                messageArtifact1 = true;
                if (messageNewZE && messageArtifact1 && messageArtifact2) {
                    socketZA.off("EVT_NewZEinZP");
                    socketZA.off("EVT_ReceptionArtefactIntoZP");
                    socketZA.off("EVT_ReceptionArtefactIntoZE");
                    done();
                }
            });
            // socketZA.on('connect',()=>{
            //     socketZA.emit('EVT_DemandeConnexionZA', '', 'Table1');
            // });
            socketZA.open();
            this.timeout(500);
        });
    });

});