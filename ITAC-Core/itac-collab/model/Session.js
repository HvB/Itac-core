/**
 * Classe pour la gestion des sessions
 *
 * La session est construite en fonction du contexte passe au constructeur.
 * @requires ZoneCollaborative
 * @requires authentification
 * @requires Constante
 * @requires crypto
 * @requires fs
 *
 * @author Stephane Talbot
 */
const ZoneCollaborative = require('./ZoneCollaborative');
const BaseAuthentification = require("../utility/authentication");
const crypto = require('crypto');
const fs = require('fs');
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
        this.ZC = new ZoneCollaborative(confZC);
        this.ZC.session = this;
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
            console.log('\n*** traitement de la demande de sauvegarde de sauvegarde la session=' + this.name);
            console.log('*** creation du dossier de sauvegarde des sessions=' + DIRECTORY);
            fs.mkdir(DIRECTORY, (err) => {
                if (err && err.code !== 'EEXIST') {
                    console.log('*** erreur lor de la creation du dossier sauvegarde pour les sessions :' + err.code);
                    reject(err);
                } else {
                    if (err) console.log('*** dossier de sauvegarde pour les sessions existe : ' + err.code);
                    else console.log('*** dossier de sauvegarde pour les sessions cree');
                    var filename = crypto.createHash('sha1').update(this.name, 'utf8').digest('hex');
                    console.log('*** debut de la sauvegarde de la session ' + this.name + ' : ' + DIRECTORY + filename);
                    fs.writeFile(DIRECTORY + filename, JSON.stringify(this, null, 2), "utf8",
                        (err) => {
                            if (err) {
                                console.log('*** erreur lor de la sauvegarde de la sessions ' + this.name + ' :' + err.code);
                                reject(err);
                            } else {
                                console.log('*** fin de la sauvegarde de la sessions ' + this.name + ' : ' + DIRECTORY + filename);
                                resolve(filename)
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
    static loadSession(name) {
        var filename = crypto.createHash('sha1').update(name, 'utf8').digest('hex');
        var data = fs.readFileSync("./session/" + filename);
        return new Session(JSON.parse(data));
    }
}

module.exports = Session;