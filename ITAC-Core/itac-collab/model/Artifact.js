/**
 * classe Artifact
 *
 *
 * @requires fs
 * @requires mkdirp
 * @requires bunyan
 * @requires loggers
 * @requires itacLogger
 * @requires Constant
 * 
 * @author philippe pernelle
 * @author Stephane Talbot
 */

// utilisation logger
const itacLogger = require('../utility/loggers').itacLogger;
const logger = itacLogger.child({component: 'Artifact'});
const fs = require("fs");
const mkdirp = require('mkdirp');
const TYPE = require('../constant').type;

module.exports = class Artifact {
    constructor(id, creator, owner, lastZE, type, idContainer, typeContainer, dateCreation, history, title, position, content) {

        this.id = id;
        this.creator = creator;
        this.owner = owner;
        this.lastZE = lastZE;
        this.position = position;
        this.type = type;
        this.idContainer  = idContainer;
        this.typeContainer  = typeContainer;
        this.dateCreation = dateCreation;  // Date.now();
        this.history = history;  //[];
        this.title  = title;
        this.content  = content;
        logger.info('creation Artefact recu' + ' | id = ' + id + ' | creator = ' + creator + ' | type = ' + type +
            ' | idContainer = ' + idContainer + ' | typeContainer = ' + typeContainer);

        // ajouter la sauvegarde de l'articat dans un repertoire temporaire
    }

    getLastZE() {
        return this.lastZE;
    }

    /**
     *
     */
    setLastZE(lastZE) {
        this.lastZE = lastZE;
    };

    getPosition() {
        return this.position;
    }


    isInto(idContainer, typeContainer) {
        return ((this.typeContainer == typeContainer) && (this.idContainer == idContainer));
    }

    /**
     * retourne l'identifiant de l'artefact
     * @return {String} Id Artefact
     */
    getId() {
        return this.id;
    }

    /**
     * retourne le createur de l'artefact
     * @return {String} creator
     */
    getCreator() {
        return this.creator;
    };

    /**
     * retourne l'identifiant de l'artefact
     * @return {String} Id Artefact
     */
    getIdContainer() {
        return this.idContainer;
    };

    /**
     * retourne l'identifiant de l'artefact
     * @return {String} Id Artefact
     */
    getTypeContainer() {
        return this.typeContainer;
    };

    /**
     * indique si l'artefact à un propriétaire
     * @return {Boolean} Id Artefact
     */
    hasOwner() {
        return this.owner !== null;
    };

    /**
     * retourne le properietaire de l'artefact
     * @return {String} owner
     */

    getOwner() {
        return this.owner;
    };

    /**
     * retourne le typle de l'artefact
     * @return {String} type
     */
    getType() {
        return this.type;
    };

    sizeHistory() {
        return this.history.length;
    };

    /**
     * retourne si lartefact est modifeir ou non
     * @return {Boolean}
     */
    hasModifier(modifier) {
        for (var i = 0; i < this.modificateurs.length; i++) {
            if (this.modificateurs[i].equals(modifier)) {
                return true;
            }
        }
        return false;
    };

    /**
     * retourne les artefaacts modifiers
     *
     */
    getModifier(n) {
        return this.modificateurs[n];
    };

    addModifier(modifier) {
        if (!modifier.equals(this.creator) && !this.hasModifier(modifier)) {
            this.modificateurs.push(modifier);
        }
        this.derniereModification = Date.now();
    };

    /**
     * indique si l'artefact à un titre
     * @return {Boolean} title
     */
    hasTitle(title) {
        return this.title == title;
    };

    /**
     * retourne le titre de l'artefact
     * @return {String} title
     */
    getTitle() {
        return this.title;
    };

    /**
     * set le titre de l'artefact
     * @return {String} title
     */
    setTitle(title) {
        this.titre = title;
    };



     setId(id) {
         this.id=id;
    }


    /**
     * mettre l'artefact dans la ZE
     * @return {number} idConteneur
     *  * @return {number} typeConteneur
     */
    setIntoZone(idConteneur, typeConteneur) {
        logger.info('changement de zone pour  Artefact (' + this.getId() + ') SRC type= ' + this.getTypeContainer() + ' id=' + this.getIdContainer()+' DEST type= ' + typeConteneur + ' id =' + idConteneur);
        this.idContainer = idConteneur;
        this.typeContainer = typeConteneur;
    };

    /**
     * comparaison entre 2 art pour voir s'il ya une modification
     * @return {Boolean}
     */
    equals(artefact) {
        return this.idAr == artefact.getId();
    };

    /**
     *  Sauvegarde de l'artefact (JSON)
     *
     * @param path - repertoire de sauvagarde de l'artefact
     * @param callback - callback a appeler
     * @returns {Promise}
     *
     * @author Stephane Talbot
     */
    saveJson(path, callback){
        let p =  new Promise((resolve, reject) => {
            logger.debug('*** sauvegarde artefact :' + this.id);
            logger.debug('*** creation du dossier de sauvegarde =' + path);
            mkdirp(path, (err) => {
                if (err && err.code !== 'EEXIST') {
                    logger.debug('*** erreur lors de la creation du dossier sauvegarde de l\'artefact : ' + err.code);
                    reject(err);
                } else {
                    if (err) logger.debug('*** dossier de sauvegarde pour l\'artefact existe : ' + err.code);
                    else logger.debug('*** dossier de sauvegarde pour l\'artefact cree');
                    logger.info('*** debut de la sauvegarde de l\'artefact :' + this.id );
                    let filename = path + '/' + this.id;
                    fs.writeFile(filename, JSON.stringify(this), "utf8",
                        (err) => {
                            if (err) {
                                logger.error('*** erreur lor de la sauvegarde de l\'artefact : ' + this.id + ' :' + err.code);
                                reject(err);
                            } else {
                                logger.info('*** fin de la sauvegarde de l\'artefact : ' + this.id);
                                resolve(filename)
                            }
                        });
                }
            });
        });
        // appel callback
        if (callback && callback instanceof Function) {
            p.then(() => callback()).catch(callback);
        }
        return p;
    }

    /**
     *  Sauvegarde du contenu de l'artefact.
     *
     * @param path - repertoire de sauvagarde de l'artefact
     * @param callback - callback a appeler
     * @returns {Promise}
     *
     * @author Stephane Talbot
     */
    saveContent(path, callback){
        let p = new Promise ((resolve, reject)=>{
            //sauvegarde du fichier contenu
            if (this.getType() === TYPE.artifact.image) {
                let filename = path + '/' + this.id + '.png';
                logger.debug('=> saveContent : sauvegarde image : ' + filename);
                let base64Data = this.content.replace(/^data:image\/png;base64,/, "");
                base64Data += base64Data.replace('+', ' ');
                let binaryData = new Buffer(base64Data, 'base64').toString('binary');
                fs.writeFile(filename, binaryData, "binary", function (err) {
                    if (err) {
                        logger.error(err);
                        logger.debug('=> saveContent : sauvegarde image [NOK]: ' + filename);
                        reject(err);
                    } else {
                        logger.debug('=> saveContent : sauvegarde image [OK]: ' + filename);
                        resolve(filename);
                    }
                });
            } else if (this.getType() === TYPE.artifact.message) {
                let filename = path + '/' + this.id + '.txt';
                logger.debug('=> saveContent : sauvegarde message : ' + filename);
                fs.writeFile(filename, this.content, "UTF-8", function (err) {
                    if (err) {
                        logger.error(err);
                        logger.debug('=> saveContent : sauvegarde message [NOK]: ' + filename);
                        reject(err);
                    } else {
                        logger.debug('=> saveContent : sauvegarde message [OK]: ' + filename);
                        resolve(filename);
                    }
                });
            } else {
                // ToDo : prevoir le cas des artefacts qui ne sont ni des images ni des messages
                // artefact de type autre que image ou message
                resolve();
            }
        });
        // appel callback
        if (callback && callback instanceof Function) {
            p.then(() => callback()).catch(callback);
        }
        return p;
    }

    /**
     *  Sauvegarde de l'artefact (JSON+contenu)
     *
     * @param path - repertoire de sauvagarde de l'artefact
     * @param callback - callback a appeler
     * @returns {Promise}
     *
     * @author Stephane Talbot
     */
    save(path, callback) {
        let p1 = this.saveJson(path);
        let p2 = p1.then(()=>this.saveContent(path));
        // appel callback
        if (callback && callback instanceof Function) {
            p2.then(() => callback()).catch(callback);
        }
        return p2;
    }

    static fromJSON(artifact_json_string, id) {
        logger.debug('=> fromJSON : creation Artefact from JSON : CHAINE =' + artifact_json_string);

        var temp = JSON.parse(artifact_json_string);
        logger.debug('=> fromJSON : creation Artefact from JSON : OBJ =' + temp);

        if (id === undefined)
        {
            logger.debug('=> fromJSON : creation Artefact , pas de id passé en parametre');
            var art = new Artifact(temp.id, temp.creator, temp.owner, temp.lastZE ,temp.type, temp.idContainer, temp.typeContainer, temp.dateCreation, temp.history, temp.title, temp.position, temp.content);
        }
        else{
            logger.debug('=> fromJSON : creation Artefact , id passé en parametre = '+id);
            var art = new Artifact(id, temp.creator, temp.owner, temp.lastZE ,temp.type, temp.idContainer, temp.typeContainer, temp.dateCreation, temp.history, temp.title, temp.position, temp.content);
            art.setId(id) ;
        }

        return art;
    }

    /**
     * Chargement synchrone d'un artefact sauvegarde au format JSON.
     * Le fichier doit etre au format JSON et encodé en UTF-8
     *
     * @deprecated
     * @param {string} path - chemin d'acces au fichier
     * @returns {Artifact}
     * @throws {SyntaxError|Error} - erreur qui s'est produite (a priori soit un pb JSON, soit un pb d'acces au systeme de fichier)
     *
     * @Author Stephane Talbot
     */
    static loadSync(path){
        logger.debug('=> loadSync : chargement du fichier  = '+ path);
        let tmpfile = fs.readFileSync(path, "UTF-8");
        logger.debug('=> loadSync : chargement du fichier [OK] chaine JSON = '+tmpfile);
        // création de l'artifact à partir du JSON
        return Artifact.fromJSON(tmpfile);
    }

    /**
     * Chargement asynchrone d'un artefact sauvegarde au format JSON.
     * Le fichier doit etre au format JSON et encodé en UTF-8
     *
     * @param {string} path - chemin d'acces au fichier
     * @param {Function.<Error, Artifact>} callback - callback
     * @returns {Promise.<Artifact>} - L'artefact cree en cas de succes, un objet error en cas d'echec (a priori soit un pb JSON, soit un pb d'acces au systeme de fichier)
     *
     * @author Stephane Talbot
     */
    static load(path, callback){
        // ToDo : ecrire le methodes
        let p = new Promise((resolve, reject) => {
            fs.readFile(path, "UTF-8", (err, data)=>{
                if (err){
                    logger.error(err, "=> load : Error lors du chargement de l'artefact : " + path);
                    reject(err);
                } else {
                    try {
                        logger.debug("=> load : chargement du fichier [OK] chaine JSON = " + data);
                        let artifact = Artifact.fromJSON(data);
                        resolve(artifact);
                    } catch (err) {
                        logger.error(err, "=> load : Error lors du chargement de l'artefact : " + path);
                        reject(err);
                    }
                }
            });
        });
        // appel du callback eventuel
        if (callback && callback instanceof Function) {
            p.then((artifact) => {callback(null,artifact);}).catch((err)=>{callback(err);});
        }
        return p;
    }
};