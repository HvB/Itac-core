/**
 * Cette classe permet de créer une Zone d'Echange qui est associé à une Zone de Partage .
 *
 * @author philippe pernelle
 */
//utilisation logger
const itacLogger = require('../utility/loggers').itacLogger;

var logger = itacLogger.child({component: 'ZoneEchange'});


module.exports = class ZoneEchange {
    constructor(ZP, idZE, idZEP, idSocket, visible, pseudo, posAvatar, login) {
        this.ZP = ZP;
        this.idZE = idZE;
        this.idZEP = idZEP;
        this.idSocket =idSocket;
        this.visible = visible;
        this.pseudo = pseudo;
        this.posAvatar = posAvatar;
        this.login= login;
        logger.info(' Création d une ZE: ZP parent = ' + this.ZP.idZP + ' | idZE = ' + this.idZE +  ' | idSocket = ' + this.idSocket + ' | idZEP associé = ' + this.idZEP + ' | visibility = ' + this.visible);
    }

    getId() {
        return this.idZE;
    }

    getIdZEP() {
        return this.idZEP;
    }

    getIdSocket() {
        return this.idSocket;
    }

    getPseudo() {
        return this.pseudo;
    }

    getPosAvatar() {
        return this.posAvatar;
    }

    getLogin() {
        return this.login;
    }
};