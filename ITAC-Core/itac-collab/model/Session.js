/**
 * Classe pour la gestion des sessions
 *
 * La session est construite en fonction du contexte passe au constructeur.
 * @requires ZoneCollaborative
 * @requires authentification
 * @requires Constante
 * @requires crypto
 * @requires fs
 * @requires mkdirp
 * 
 * @author Stephane Talbot
 */
const ZoneCollaborative = require('./ZoneCollaborative');
const BaseAuthentification = require("../utility/authentication");
const crypto = require('crypto');
const fs = require('fs');
const mkdirp = require('mkdirp');
const DIRECTORY = require('../constant').directory.session;

/**
 * Class pour la representation des Sessions. 
 * La session est construite en fonction du contexte passe au constructeur.
 * 
 * @author Stephane Talbot
 */

class Session {
    /**
     * Constructeur pour la session.
     * Le contexte de la session permet de construire le systeme d'authentification et la ZC de la session
     * 
     * @example <caption>Session context example.</caption>
     * Exemple de contexte : 
     * { // config specifique a la session : le nom de la session
     *   "session": {
     *     "name": "essai2"
     *   },
     *   // partie specifique pour l'authentification 
     *   "authentification": {
     *     // fabrique charge de la creation de l'autentificateur
     *    "factory": "factory",
     *    // configuration passee a la fabrique: type authentificateur + params d'initialisation
     *    "config": {
     *      "type": "FileLoginPwdAuthenticator",
     *      "params": "./users.json"
     *    }
     *  },
     *  // config de la ZC a utiliser
     *  "zc": {
     *    "config": {
     *      "idZC": "444",
     *      "nbZP": "2",
     *      "ZP": [
     *        {
     *          "idZP": "Table",
     *          "typeZP": "TableTactile",
     *          "nbZEmin": "2",
     *          "nbZEmax": "4",
     *          "urlWebSocket": "",
     *          "portWebSocket": "8080"
     *        },
     *        {
     *          "idZP": "test2",
     *          "typeZP": "Ecran",
     *          "nbZEmin": "1",
     *          "nbZEmax": "6",
     *          "urlWebSocket": "",
     *          "portWebSocket": "8081"
     *        }
     *      ]
     *    }
     *  }
     *}
     * 
     * @param {json} context: contexte de la session
     */
    constructor(context) {
        this.context = context;
        this.name = context.session.name;
        // creation dispositif d'authetification
        var confAuth = context.authentification;
        console.log("factory: " + confAuth.factory);
        var factory = BaseAuthentification.Authenticator.getFactory(confAuth.factory);
        this.auth = factory(confAuth.config);
        // creation de la ZC
        var confZC = context.zc.config;
        this.ZC =new ZoneCollaborative(confZC);
        this.ZC.session=this;	
        Session.registerSession(this);
    }

    /**
     * liste des ids des articles de la session
     * 
     * @returns {Array} : liste des ids des articles de la ZC
     */
    get artifactIds() {
        var listIds = [];
        if (this.ZC) {
            listIds = this.ZC.getAllArtifacts().map((a)=> {
                return a.getId()
            });
        }
        return listIds; 
    }

    /**
     * Repertoire de sauvegarde des artefacts.
     * 
     * Chemin vers le repertoire de sauvegarde de la configuration de la sesion et des artefacts
     * Si le repertoire n'existe pas on essaye de le creer.
     * 
     * @return {string} : chemin vers le repertoire de sauvegarde des artefact
     */
    get pathArtifacts(){
        let path = DIRECTORY + crypto.createHash('sha1').update(this.name, 'utf8').digest('hex') + "/";
        // creation des repertoires
        mkdirp.sync(path);
        return path;
    }
    /**
     * Exportation JSON : en fait on exporte le contexte
     * 
     * @returns {json} : contexte de la session
     */
    toJSON() {
        this.context.session.artifactIds = this.artifactIds;
        this.context.session.name = this.name;
        return this.context;
    }

    /**
     * Methode de sauvegarde de la session (au format json) dans un fichier.
     * Le nom du fichier depend du nom de la session.
     * 
     * @returns {Promise} Si elle est tenue, la valeur de la promesse correspond au nom nom du fichier de sauvegarde
     */
    saveSession() {
        return new Promise((resolve, reject) => {
            //var sessionDirName = DIRECTORY + crypto.createHash('sha1').update(this.name, 'utf8').digest('hex') + "/";
            var sessionDirName = this.pathArtifacts;
            var configFilename = sessionDirName + "config.json";
            console.log('\n*** traitement de la demande de sauvegarde de sauvegarde la session=' + this.name);
            console.log('*** creation du dossier de sauvegarde de la session=' + sessionDirName);
            //fs.mkdir(sessionDirName, (err) => {
            mkdirp(sessionDirName, (err) => {
                if (err && err.code !== 'EEXIST') {
                    console.log('*** erreur lors de la creation du dossier sauvegarde pour les sessions :' + err.code);
                    reject(err);
                } else {
                    if (err) console.log('*** dossier de sauvegarde pour les sessions existe : ' + err.code);
                    else console.log('*** dossier de sauvegarde pour les sessions cree');
                    var filename = crypto.createHash('sha1').update(this.name, 'utf8').digest('hex');
                    console.log('*** debut de la sauvegarde de la session ' + this.name + ' : ' + configFilename);
                    fs.writeFile(configFilename, JSON.stringify(this, null, 2), "utf8",
                            (err) => { 
                                if (err) {
                                    console.log('*** erreur lor de la sauvegarde de la sessions ' + this.name + ' :' + err.code);
                                    reject(err);
                                } else {
                                    console.log('*** fin de la sauvegarde de la sessions ' + this.name + ' : ' + configFilename);
                                    resolve(configFilename)
                                }
                            });
                }
            });
        });
    }

    /**
     * Chargement d'une session precedente.
     * 
     * @param {string} nom de la session a charger
     * @returns {Session} la session sauvegardee
     */
    static loadSession(name){
        // on regarde d'abord si c'est une session existante
        var session = Session.getSession(name);
        // si ce n'est pa le cas on essaye de la charger
        if (! session){
            let sessionDirName = this.pathArtifacts;
            let configFilename = DIRECTORY + crypto.createHash('sha1').update(name, 'utf8').digest('hex') + "/" + "config.json";
            //let filename = crypto.createHash('sha1').update(name,'utf8').digest('hex');
            let data = fs.readFileSync(configFilename);
            session = new Session(JSON.parse(data));
        }
        return session;
    }

    /**
     * Methode permettant de fermer une session.
     * On ferme la ZC associée et toutes ses ZPs.
     *
     * @method
     */
    close(){
        console.log('=> fermeture session %s', this.name);
        Session.unregisterSession(this);
        let zc = this.ZC;
        if (zc) zc.close();
    }

    /**
     * Methode statique permettant d'enregistrer une session dans la liste des sessions actives.
     *
     * @static
     * @private
     * @method
     * @param {Session} session - session a enregistrer.
     */
    static registerSession(session){
        if (session instanceof Session){
            // si necessaire initialisation de la liste des sessions
            if (! Session.activesSessions){
                Session.activesSessions = {};
            }
        }
        Session.activesSessions[session.name]=session;
    }

    /**
     * Methode statique de supprimer une session dans la liste des sessions actives.
     *
     * @static
     * @private
     * @method
     * @param {Session} session - session a de-enregistrer.
     */
    static unregisterSession(session) {
        if (session && Session.activesSessions && session instanceof Session && session === Session.activesSessions[session.name]){
            delete Session.activesSessions[session.name];
        }
    }

    /**
     * Methode permettant d'obtenir une des sessions actives.
     * 
     * @method 
     * @static
     * @param {string} name - nom de la session recherchee
     * @returns {Session}
     */
    static getSession(name){
        return Session.activesSessions[name];
    }

    /**
     * Methode permettant d'obtenir la liste des sessions enregistrées.
     * 
     * @method 
     * @static
     * @returns {string[]} la liste des sessions enregistrees
     */
    static registredSessions(){
        return Object.keys(Session.activesSessions[name]);
    }
}

//initialisation de la liste des sessions
Session.activesSessions = {};

module.exports = Session;
