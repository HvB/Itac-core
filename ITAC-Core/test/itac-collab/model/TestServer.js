/**
 * Created by Stephane on 06/07/2017.
 */

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
const expect = chai.expect;
const io = require('socket.io-client');
const Session = require("../../../itac-collab/model/Session.js");

describe("Server connection", function(){
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
                var socket0 = io(url, socketParams);
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
                socket0.on('EVT_ReponseOKConnexionZEP', ()=>{
                    socket0.off('disconnect');
                    socket0.off('connect_error');
                    done();
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
                    socket0.on('EVT_ReponseOKConnexionZEP', ()=>{
                        socket0.off('disconnect');
                        socket0.off('connect_error');
                        done();
                    });
                    socket0.on('EVT_ReponseNOKConnexionZEP', ()=>{done(new Error("connection refused by server"));});
                    socket0.on('disconnect', (reason)=>{done(new Error(reason));});
                    socket0.on('connect_error', (err)=>{done(new Error(err));});
                    socket0.on('connect',()=>{
                        socket0.emit('EVT_DemandeConnexionZEP', 'pseudo2', '2');
                    });
                    socket0.open();
                    this.timeout(500);
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
    var artifactMessage = {
        "id": "54h54gh", "creator": "mocha", "owner": "mocha", "type": "message", "idContainer": "ZE1",
        "typeContainer": "ZE", "dateCreation": "2017-06-29T15:08:12.765Z", "history": [], "title": "Message", "content": "test de contenu"
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
        socketZE0.on('EVT_ReponseOKConnexionZEP', (ze, zep)=>{idZE = ze; idZEP = zep; done();});
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
        it('Expect connection success', function(){
            var messageToZE = false;
            var messageToZA = false;
            socketZE0.on("EVT_ReceptionArtefactIntoZE", function (pseudo, ze, idArt){
                expect(pseudo).to.be('pseudo1');
                expect(ze).to.be(idZE);
                expect(idArt).to.be(art.id);
                messageToZE = true;
                if (messageToZA && messageToZE) done();
            });
            socketZA.on('EVT_ReceptionArtefactIntoZE', function (pseudo, ze, chaineJSON){
                expect(pseudo).to.be('pseudo1');
                expect(ze).to.be(idZE);
                expect(JSON.parse(chaineJSON)).to.deep.equal(artifactMessage);
                messageToZA = true;
                if (messageToZA && messageToZE) done();
            });
            socketZE0.emit('EVT_NewArtefactInZE', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage));
            this.timeout(500);
        });
    });

    describe("Transfer artefact EP -> ZP", function(){
        it('Expect connection success', function(){
            var idZP = 'Table1';
            var messageToZE = false;
            var messageToZA = false;
            socketZE0.on("EVT_ReceptionArtefactIntoZP", function (pseudo, zp, idArt){
                expect(pseudo).to.be('pseudo1');
                expect(zp).to.be(idZP);
                expect(idArt).to.be(art.id);
                messageToZE = true;
                if (messageToZA && messageToZE) done();
            });
            socketZA.on('EVT_ReceptionArtefactIntoZP', function (pseudo, zp, chaineJSON){
                expect(pseudo).to.be('pseudo1');
                expect(zp).to.be(idZP);
                expect(JSON.parse(chaineJSON)).to.deep.equal(artifactMessage);
                messageToZA = true;
                if (messageToZA && messageToZE) done();
            });
            socketZE0.emit('EVT_NewArtefactInZP', 'pseudo1', idZEP, idZE, JSON.stringify(artifactMessage));
            this.timeout(500);
        });
    });
});