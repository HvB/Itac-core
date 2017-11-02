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
};

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
    };
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

/**
 * Met l'élément courant au premier plan
 * @param $element élément à mettre au premier plan
 */
var putInFront = function ($element) {
    $element.css('z-index', Z_INDEX);
    Z_INDEX++;
};

/**
 * Retourne une position aléatoire pour placer un élément à l'intérieur de la zone de partage
 * @param position position courante de l'élément
 * @returns {{number, number, number, number}} une position aléatoire à l'intérieur de la zone de partage
 */
var getRandomPositionInZP = function (position) {
    var width = $(window).width(),
        height = $(window).height();
    if (position && position.x >= 0 && position.x < width && position.y >= 0 && position.y < height) {
        return position;
    } else {
        var $artifact = $('.template .artifact.message').clone();
        $artifact.appendTo('.ZP');
        var w = $artifact.width(), h = $artifact.height();
        $artifact.remove();
        return {
            x: Math.random() * (width - w - 2 * MARGIN) + MARGIN,
            y: Math.random() * (height - h - 2 * MARGIN) + MARGIN,
            scale: 1,
            angle: 0
        };
    }
};