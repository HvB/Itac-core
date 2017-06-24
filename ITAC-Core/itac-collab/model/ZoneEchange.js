/**
 * Cette classe permet de créer une Zone d'Echange qui est associé à une Zone de Partage .
 *
 * @author philippe pernelle
 */

module.exports = class ZoneEchange {
    constructor(ZP, idZE, idZEP, visible, pseudo, posAvatar) {
        this.ZP = ZP;
        this.idZE = idZE;
        this.idZEP = idZEP;
        this.visible = visible;
        this.pseudo = pseudo;
        this.posAvatar = posAvatar;
        console.log('   	 +++ Zone Echange créée : ZP parent = ' + this.ZP.idZP + ' | idZE = ' + this.idZE + ' | idZEP associé = ' + this.idZEP + ' | visibility = ' + this.visible);
    }

    getId() {
        return this.idZE;
    }

    getIdZEP() {
        return this.idZEP;
    }

    getPseudo() {
        return this.pseudo;
    }

    getPosAvatar() {
        return this.posAvatar;
    }
};