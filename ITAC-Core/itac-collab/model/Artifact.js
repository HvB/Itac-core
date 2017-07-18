/**
 * classe Artifact
 *
 *
 * @requires bunyan
 * @requires loggers
 * 
 * @author philippe pernelle
 */

// utilisation logger
const itacLogger = require('../utility/loggers').itacLogger;
var logger = itacLogger.child({component: 'Artefact'});

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
};