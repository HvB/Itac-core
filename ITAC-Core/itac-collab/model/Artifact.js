/**
 * cette classe représente un Artefact qui va être echangé

 *
 *
 */

/**
 * constructeur de la classe Artifact
 *
 * @constructor
 * @param {Number} idAr Identifiant de l'artifact
 * @param {String} creator nom du createur de l'artifact
 *
 * @author philippe pernelle
 */


module.exports = class Artifact {
    constructor(idAr, createur, typeArtefact, idConteneur, typeConteneur, modificateurs, titre, contenu) {
        console.log('    ---- creation Artefact recu' + ' | idAr = ' + idAr + ' | creator = ' + createur + ' | typeArtefact = ' + typeArtefact +
            ' | idConteneur = ' + idConteneur + ' | typeConteneur = ' + typeConteneur);
        this.idAr = idAr;
        this.createur = createur;
        this.proprietaire = createur;
        this.typeArtefact = typeArtefact;
        this.idConteneur = idConteneur;
        this.typeConteneur = typeConteneur;
        this.dateCreation = Date.now();
        this.derniereModification = Date.now();
        this.modificateurs = [];
        this.titre = titre;
        this.contenu = contenu;
        console.log('    ---- creation Artefact' + ' | idAr = ' + this.idAr + ' | creator = ' + this.createur + ' | typeArtefact = ' + this.typeArtefact +
            ' | idConteneur = ' + this.idConteneur + ' | typeConteneur = ' + this.typeConteneur);
        // ajouter la sauvegarde de l'articat dans un repertoire temporaire
    }

    isInto(idConteneur, typeConteneur) {
        return ((this.typeConteneur === typeConteneur) && (this.idConteneur === idConteneur));
    }

    /**
     * retourne l'identifiant de l'artefact
     * @return {String} Id Artefact
     */
    getId() {
        return this.idAr;
    }

    /**
     * retourne le createur de l'artefact
     * @return {String} creator
     */
    getCreateur() {
        return this.createur;
    };

    /**
     * retourne l'identifiant de l'artefact
     * @return {String} Id Artefact
     */
    getIdConteneur() {
        return this.idConteneur;
    };

    /**
     * retourne l'identifiant de l'artefact
     * @return {String} Id Artefact
     */
    getTypeConteneur() {
        return this.typeConteneur;
    };

    /**
     * indique si l'artefact à un propriétaire
     * @return {Boolean} Id Artefact
     */
    hasOwner() {
        return this.proprietaire !== null;
    };

    /**
     * retourne le properietaire de l'artefact
     * @return {String} owner
     */

    getOwner() {
        return this.proprietaire;
    };

    /**
     * retourne le typle de l'artefact
     * @return {String} type
     */
    getTypeArtefact() {
        return this.typeArtefact;
    };

    sizeModifier() {
        return this.modificateurs.length;
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
    hasTitle(titre) {
        return this.titre == titre;
    };

    /**
     * retourne le titre de l'artefact
     * @return {String} title
     */
    getTitle() {
        return this.titre;
    };

    /**
     * set le titre de l'artefact
     * @return {String} title
     */
    setTitle(titre) {
        this.titre = titre;
    };

    setOldTitle(oldTitle) {
        this.oldTitle = oldTitle;
    };

    /**
     * retourne le createur de l'artefact
     * @return {String} creator
     */

    /**
     * set  le message de l'artefact
     * @return {String} message
     */
    setMessage(message) {
        this.message = message;
    };

    /**
     * mettre l'artefact dans la ZE
     * @return {number} idConteneur
     *  * @return {number} typeConteneur
     */
    setIntoZone(idConteneur, typeConteneur) {
        console.log('    ---- changement de zone pour  Artefact (' + this.getId() + ') conteneur de type source = ' + this.getTypeConteneur() + ' idconteneur source =' + this.getIdConteneur());
        console.log('    ---- changement de zone pour  Artefact (' + this.getId() + ') conteneur de type cible = ' + typeConteneur + ' idconteneur cible =' + idConteneur);
        this.idConteneur = idConteneur;
        this.typeConteneur = typeConteneur;
    };

    /**
     * comparaison entre 2 art pour voir s'il ya une modification
     * @return {Boolean}
     */
    equals(artefact) {
        return this.idAr == artefact.getId();
    };

    static fromJSON(artifact_json_string, idAr) {
        console.log('    ---- creation Artefact from JSON : CHAINE =' + artifact_json_string);
        console.log('    ---- creation Artefact from JSON : OBJ =' + JSON.parse(artifact_json_string));

        var temp = JSON.parse(artifact_json_string);
        var art = new Artifact(idAr, temp.createur, temp.typeArtefact, temp.idConteneur, temp.typeConteneur, temp.modificateurs, temp.titre, temp.contenu);
        art.idAr = idAr;
        return art;
    }
};