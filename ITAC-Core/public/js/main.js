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
$(document).ready(function () {
    var timeout;

    $('ul.menu li:not(:first-child)').each(function (index, $element) {
        var step = 360 / $('ul.menu li:not(:first-child)').length,
            radius = 360,
            angle = step * index * Math.PI / 180,
            x = -Math.round(radius * Math.cos(angle)),
            y = Math.round(radius * Math.sin(angle));
        $($element).css('top', x + 'px').css('left', y + 'px');
    });

    interact('.menu li:first-child')
        .gesturable({
            onmove: (function (event) {
                var target = event.target,
                    angle = (parseFloat(target.getAttribute('data-angle')) || 0) + event.da;
                target.style.webkitTransform =
                    target.style.transform =
                        'rotate(' + angle + 'deg)';
                target.setAttribute('data-angle', angle);
            }).bind(this)
        })
        .dropzone({
            ondragenter: function (event) {
                $('.menu li:first-child').addClass('ready');
            },
            ondragleave: function (event) {
                $('.menu li:first-child').removeClass('ready');
            },
            ondrop: function (event) {
                let $target = $(event.dragEvent.target),
                    url = $target.attr('data-url');
                clearTimeout(timeout);
                $('.menu li:first-child')
                    .text($target.attr('data-name'))
                    .addClass('no-background');
                $target.remove();
                timeout = setTimeout(function () {
                    window.location.href = window.location.href + url;
                }, 1000);
            }
        });

    interact('.menu li:not(:first-child)')
        .draggable({
            onmove: function (event) {
                var target = event.target,
                    x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                    y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
                target.style.webkitTransform =
                    target.style.transform =
                        'translate(' + x + 'px, ' + y + 'px)';
                target.setAttribute('data-x', x);
                target.setAttribute('data-y', y);
            },
            onend: function (event) {
                var target = event.target;
                target.style.webkitTransform =
                    target.style.transform =
                        'translate(' + 0 + 'px, ' + 0 + 'px)';
                target.setAttribute('data-x', 0);
                target.setAttribute('data-y', 0);
            }
        })
        .on('tap', function (event) {
            let $item = $('.menu li:first-child');
            clearTimeout(timeout);
            $item.text($(event.target).attr('data-name')).addClass('no-background');
            timeout = setTimeout(function () {
                $item.text('').removeClass('no-background');
            }, 3000);
        });
});
