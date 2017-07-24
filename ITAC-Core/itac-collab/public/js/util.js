/********************************************************************************************************/
/* --------------------------------- Fonctions utilitaires ------------------------------------------ */
/********************************************************************************************************/

/**
 * Retourne un nombre avec un '0' devant s'il est inférieur à 10
 * @param value valeur du nombre
 * @returns {string} le nombre avec un '0' devant s'il est inférieur à 10
 */
var addZero = function (value) {
    return value > 9 ? value : '0' + value;
}

/**
 * Retourne une date formatée à ce format dd/MM/yyyy - hh:mm
 * @param isoDate date au format ISO à formater
 * @returns {string} la date formatée à ce format dd/MM/yyyy - hh:mm
 */
var getFormattedDate = function (isoDate) {
    var date = new Date(isoDate);
    return addZero(date.getUTCDate()) + '/' + addZero(date.getUTCMonth() + 1) + '/' + date.getUTCFullYear()
        + ' - ' + addZero(date.getUTCHours()) + ':' + addZero(date.getUTCMinutes());
};

/**
 * Retourne un nouveau uuid
 * @returns {string} un nouveau uuid
 */
var guid = function () {
    var s4 = function () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}