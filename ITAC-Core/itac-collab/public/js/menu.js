$(document).ready(function () {
    $('ul').circleMenu({
        circle_radius: 150,
        direction: 'full',
        trigger: 'none',
        open: function () {
            console.log('menu opened');
        },
        close: function () {
            console.log('menu closed');
        },
        init: function () {
            console.log('menu initialized');
        },
        select: function (evt, index) {
            console.log(evt, index)
        }
    });

    /* -------------------------
     * le menu est draggable
     * -------------------------
     */
    interact('ul').draggable({
        inertia: true,
        //l element reste dans sa zone limite , il peut pas sortir de son parent
        restrict: {
            restriction: "parent",
            endOnly: true,
            elementRect: {top: 0, left: 0, bottom: 1, right: 1}
        },
        // activer autoScroll
        autoScroll: true,
        //appeler cette fonction a chaque action de glissement
        onmove: function (event) {
            var target = event.target,
            // stocker la position dans les attributs data-x/data-y
                x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
                y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // translation de l'element
            target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

            // mis � jour de la position
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        }
    });
    interact('li.hand').on('tap', function(event) {
        $('ul').circleMenu($('ul').hasClass('circleMenu-open') ? 'close' : 'open');
    });
});