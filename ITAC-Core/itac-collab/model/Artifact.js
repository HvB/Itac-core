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
 * @requires fast-json-patch
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
const jsonpatch = require('fast-json-patch');

class Artifact {
    constructor(id, creator, owner, lastZE, type, idContainer, typeContainer, dateCreation, history, title, position, content, jsonSrc) {

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

        /**
         * Version JSON originelle de l'artefact
         * @type {JSONObject}
         * @private
         */
        this.jsonSrc = jsonSrc ? jsonSrc : {};
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
     * @param {saveCallback} callback - callback a appeler
     * @returns {Promise} - indique si la sauvegarde s'est bien terminee
     *
     * @author Stephane Talbot
     */
    saveJson(path, callback){
        let p =  new Promise((resolve, reject) => {
            logger.debug('*** sauvegarde artefact :' + this.id);
            logger.debug('*** creation du dossier de sauvegarde =' + path);
            mkdirp(path, (err) => {
                if (err && err.code !== 'EEXIST') {
                    logger.error(err, '*** erreur lors de la creation du dossier sauvegarde de l\'artefact');
                    logger.error(new Error(err), '*** erreur lors de la creation du dossier sauvegarde de l\'artefact');
                    reject(err);
                } else {
                    logger.info('*** debut de la sauvegarde de l\'artefact :' + this.id );
                    let filename = path + '/' + this.id;
                    fs.writeFile(filename, JSON.stringify(this), "utf8",
                        (err) => {
                            if (err) {
                                logger.error(err, '*** erreur lor de la sauvegarde de l\'artefact : ' + this.id);
                                logger.error(new Error(err), '*** erreur lor de la sauvegarde de l\'artefact : ' + this.id);
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
            p.then((v) => callback(null, v)).catch(callback);
        }
        return p;
    }

    /**
     *  Sauvegarde du contenu de l'artefact.
     *
     * @param path - repertoire de sauvagarde de l'artefact
     * @param {saveCallback} callback - callback a appeler
     * @returns {Promise} - indique si la sauvegarde s'est bien terminee
     *
     * @author Stephane Talbot
     */
    saveContent(path, callback){
        let basename = path + '/' + this.getId();
        let p = new Promise ((resolve, reject)=>{
            //sauvegarde du fichier contenu
            if (this.getType() === TYPE.artifact.image) {
                // ToDo : en fait ce ne sont pas tjs des png
                let extension = '.jpg'
                let typePngRegExp = /^data:image\/png;base64,/;
                let typeJpegRegExp = /^data:image\/jpeg;base64,/;
                if (this.content.search(typePngRegExp) === 0){
                    // C'est une image png
                    extension = '.png';
                } else if (this.content.search(typeJpegRegExp) === 0){
                    // C'est une image jpeg
                    extension = '.jpg';
                } else {
                    // par defaut on utilise du jpeg ?
                    extension = '.jpg';
                }
                let filename = basename + extension;
                logger.debug('=> saveContent : sauvegarde image : ' + filename);
                let base64Data = this.content.replace(/^data:image\/(png|jpeg|\*);base64,/, "");
                //base64Data += base64Data.replace('+', ' ');
                let binaryData = Buffer.from(base64Data, 'base64').toString('binary');
                fs.writeFile(filename, binaryData, "binary", function (err) {
                    if (err) {
                        logger.error(err, '=> saveContent : sauvegarde image [NOK]: ' + filename);
                        logger.error(new Error(err), '=> saveContent : sauvegarde image [NOK]: ' + filename);
                        reject(err);
                    } else {
                        logger.debug('=> saveContent : sauvegarde image [OK]: ' + filename);
                        resolve(filename);
                    }
                });
            } else if (this.getType() === TYPE.artifact.message) {
                let filename = basename + '.txt';
                //let filename = path + '/' + this.id + '.txt';
                logger.debug('=> saveContent : sauvegarde message : ' + filename);
                fs.writeFile(filename, this.content, "UTF-8", function (err) {
                    if (err) {
                        logger.error(err, '=> saveContent : sauvegarde message [NOK]: ' + filename);
                        logger.error(new Error(err), '=> saveContent : sauvegarde message [NOK]: ' + filename);
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
            p.then((v) => callback(null, v)).catch(callback);
        }
        return p;
    }

    /**
     *  Sauvegarde de l'artefact (JSON+contenu)
     *
     * @param path - repertoire de sauvagarde de l'artefact
     * @param {simpleCallback} callback - callback a appeler
     * @returns {Promise} - indique si la sauvegarde s'est bien terminee
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

    /**
     *  Sauvegarde de l'artefact (JSON)
     *  Version synchrone de la methode saveJson
     *
     * @deprecated
     * @param path - repertoire de sauvagarde de l'artefact
     * @throws {Error} erreur d'acces au systeme de fichier
     */
    saveJsonSync(path){
        // creation du dossier de sauvegarde, si necessaire
        mkdirp.sync(path);
        //sauvegarde du fichier JSON
        let chaine = JSON.stringify(this);
        let filename = path + '/' + this.getId();
        logger.info('=> saveJsonSync :  sauvegarde artifact depuis un json, de type=' + this.getType() + ' de path =' + filename);
        fs.writeFileSync(filename, chaine, "UTF-8");
    }

    /**
     *  Sauvegarde du contenu de l'artefact.
     *  Version synchrone de la methode saveContent
     *
     * @deprecated
     * @param path - repertoire de sauvagarde de l'artefact
     * @throws {Error} erreur d'acces au systeme de fichier
     */
    saveContentSync(path){
        let basename = path + '/' + this.getId();
        //sauvegarde du fichier contenu
        if (this.getType() === TYPE.artifact.image) {
            // ToDo : en fait ce ne sont pas tjs des png
            let extension = '.jpg'
            let typePngRegExp = /^data:image\/png;base64,/;
            let typeJpegRegExp = /^data:image\/jpeg;base64,/;
            if (this.content.search(typePngRegExp) === 0){
                // C'est une image png
                extension = '.png';
            } else if (this.content.search(typeJpegRegExp) === 0){
                // C'est une image jpeg
                extension = '.jpg';
            } else {
                // par defaut on utilise du jpeg ?
                extension = '.jpg';
            }
            let filename = basename + extension;
            logger.info('=> saveContentSync : creation artifact : creation image ' + filename);
            let base64Data = this.content.replace(/^data:image\/(png|jpeg|\*);base64,/, "");
            //base64Data += base64Data.replace('+', ' ');
            let binaryData = Buffer.from(base64Data, 'base64').toString('binary');
            fs.writeFileSync(filename, binaryData, "binary");
        } else if (this.getType() === TYPE.artifact.message) {
            let filename = basename + '.txt';
            logger.info('=> saveContentSync : creation artifact : creation text ' + filename);
            fs.writeFileSync(filename, this.content, "UTF-8");
        } else {
            // ToDo : prevoir le cas des artefacts qui ne sont ni des images ni des messages
            // artefact de type autre que image ou message
        }
    }

    /**
     *  Sauvegarde de l'artefact (JSON+contenu)
     *  Version synchrone de la methode save
     *
     * @deprecated
     * @param path - repertoire de sauvagarde de l'artefact
     * @throws {Error} erreur d'acces au systeme de fichier
     */
    saveSync(path){
        this.saveJsonSync(path);
        this.saveContentSync(path)
    }

    /**
     * Generation d'une representation JSON de l'artefact.
     *
     * @returns {JSONObject} - version JSON de l'artefact
     *
     * @author Stephane Talbot
     */
    toJSON(){
        let res = this.jsonSrc;
        // remplacement des attributs par ceux geres dans la classe Artefact
        Artifact.managedAttributes.forEach((att) => {
            res[att] = this[att];
        });
        return res;
    }

    /**
     * Application d'un patch JSON a l'artefact.
     *
     * @param patch - le patch JSON a appliquer
     *
     * @author Stephane Talbot
     */
    patch(patch){
        this.jsonSrc = jsonpatch.applyPatch(this.jsonSrc, patch).newDocument;
        // mise a jour des attributs geres par l'artefact
        this.updateFromJSON(null);
    }

    /**
     * Validation de l'application d'un patch JSON a l'artefact.
     *
     * @param patch - le patch JSON a appliquer
     * @returns {PatchError} - erreur liee a l'application du patch JSON (undefined sinon)
     */
    validatePatch(patch){
        return jsonpatch.validate(patch, this.jsonSrc);
    }

    /**
     * Modification d'un artefact en le remplacant par une nouvelle version.
     * Remarques certaines propriétes ne peuvent pas êter modifiées de cette facon
     * ("id", "creator", "owner", "lastZE", "type", "idContainer", "typeContainer", "dateCreation").
     *
     * Si l'artefact passe en parametre est null, on fait juste une synchronisation des attributs communs entre
     * l'artefact et ceux de la version JSON interne.
     *
     * @param {JSONObject} newArtifact - nouvelle version de l'artefact
     *
     * @author Stephane Talbot
     */
    updateFromJSON(newArtifact){
        if (newArtifact) {
            this.jsonSrc = newArtifact;
        }
        // maj des ptes geree par l'artefact et authorisees à la modification
        Artifact.modifiableAttributes.forEach((att) => {
            this[att] = this.jsonSrc[att];
        });
    }


    static fromJSON(artifact_json_string, id) {
        logger.debug('=> fromJSON : creation Artefact from JSON : CHAINE =' + artifact_json_string);

        let temp = JSON.parse(artifact_json_string);
        logger.debug('=> fromJSON : creation Artefact from JSON : OBJ =' + temp);
        if (temp.type && temp.type == 'image' && temp.content.search(/^data:image\/(png|jpeg|\*);base64,/)===-1){
            // on n'a pas le bon prologue, on met donc un type mime image generique
            // et on supprime egalement les eventuels retours a la ligne danns les donnees base64
            // ToDo : enlever la suppression des passages à la ligne quans les clients auront ete modifies et testes
            temp.content = 'data:image/*;base64,' + temp.content.replace(/\s/g,'' );
        }
        logger.debug('=> fromJSON : creation Artefact from JSON : OBJ =' + temp);

        if (id === undefined)
        {
            logger.debug('=> fromJSON : creation Artefact , pas de id passé en parametre');
            var art = new Artifact(temp.id, temp.creator, temp.owner, temp.lastZE ,temp.type, temp.idContainer, temp.typeContainer, temp.dateCreation, temp.history, temp.title, temp.position, temp.content, temp);
        }
        else{
            logger.debug('=> fromJSON : creation Artefact , id passé en parametre = '+id);
            var art = new Artifact(id, temp.creator, temp.owner, temp.lastZE ,temp.type, temp.idContainer, temp.typeContainer, temp.dateCreation, temp.history, temp.title, temp.position, temp.content, temp);
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
     * Callback to use with methods loading an artifact.
     *
     * @callback loadArtifactCallback
     * @param {Error} error - the Error which happened.
     * @param {Artifact} artifact - artifact loaded.
     *
     */
    /**
     * Chargement asynchrone d'un artefact sauvegarde au format JSON.
     * Le fichier doit etre au format JSON et encodé en UTF-8
     *
     * @param {string} path - chemin d'acces au fichier
     * @param {loadArtifactCallback} callback - callback
     * @returns {Promise.<Artifact>} - L'artefact cree en cas de succes, un objet error en cas d'echec (a priori soit un pb JSON, soit un pb d'acces au systeme de fichier)
     *
     * @author Stephane Talbot
     */
    static load(path, callback){
        let p = new Promise((resolve, reject) => {
            fs.readFile(path, "UTF-8", (err, data)=>{
                if (err){
                    logger.error(err, "=> load : Erreur lors du chargement de l'artefact : " + path);
                    logger.error(new Error(err), "=> load : Erreur lors du chargement de l'artefact : " + path);
                    reject(err);
                } else {
                    try {
                        logger.debug("=> load : chargement du fichier [OK] chaine JSON = " + data);
                        let artifact = Artifact.fromJSON(data);
                        resolve(artifact);
                    } catch (err) {
                        logger.error(err, "=> load : Erreur lors du chargement de l'artefact : " + path);
                        reject(err);
                    }
                }
            });
        });
        // appel du callback eventuel
        if (callback && callback instanceof Function) {
            p.then((artifact) => {callback(null,artifact);}).catch(callback);
        }
        return p;
    }
};

/**
 * Liste des noms d'attributs que sait gérer la classe Artefact.
 * Comme ces attributs peuvent être présents à la fois dans au niveau de la classe et dans le source JSON,
 * il faut éviter que des divergences amène à des incohérences.
 *
 * @private
 * @static
 * @type {Array.<String>}
 */
Artifact.managedAttributes = Object.freeze(["id", "creator", "owner", "lastZE", "type", "idContainer", "typeContainer", "dateCreation", "history", "title", "position", "content"]);
/**
 * Liste des noms d'attributs gérés par la classe Artefact, mais qui doivent pouvoir être modifiés directement.
 * Comme ces attributs peuvent être présents à la fois dans au niveau de la classe et dans le source JSON,
 * il faut éviter que si on les modifie au niveau JSON, cela n'entraine des incohérences.
 *
 * @private
 * @static
 * @type {Array.<String>}
 */
Artifact.modifiableAttributes =  Object.freeze(["history", "title", "position", "content"]);

module.exports = Artifact;
