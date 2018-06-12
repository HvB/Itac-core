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
    if (position && position.x > 0 && position.x < width && position.y > 0 && position.y < height) {
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