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