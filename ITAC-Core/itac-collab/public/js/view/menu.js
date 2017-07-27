/* ------------------------- 
 * le menu est draggable
 * -------------------------
 */
class MenuView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
    }

    _initialize() {
        interact('.menu').draggable({
            inertia: true,
            restrict: {restriction: "parent", endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
            autoScroll: true,
            onstart: function (event) {
                $('.menu').css('z-index', Z_INDEX);
                Z_INDEX++;
            },
            onmove: function (event) {
                var $element = $(event.target),
                    x = (parseFloat($element.attr('data-x')) || 0) + event.dx,
                    y = (parseFloat($element.attr('data-y')) || 0) + event.dy,
                    angle = parseFloat($element.attr('data-a'));
                $element.css('transform', 'translate(' + x + 'px, ' + y + 'px)' + (angle ? ' rotate(' + angle + 'deg)' : ''));
                $element.attr('data-x', x);
                $element.attr('data-y', y);
            }
        }).gesturable({
            inertia: true,
            restrict: {restriction: "parent", endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
            autoScroll: true,
            onstart: function (event) {
                $('.menu').css('z-index', Z_INDEX);
                Z_INDEX++;
            },
            onmove: function (event) {
                var $element = $(event.target),
                    x = (parseFloat($element.attr('data-x')) || 0) + event.dx,
                    y = (parseFloat($element.attr('data-y')) || 0) + event.dy,
                    angle = (parseFloat($element.attr('data-a')) || 0) + event.da;
                $element.css('transform', 'translate(' + x + 'px, ' + y + 'px) rotate(' + angle + 'deg)');
                $element.attr('data-x', x);
                $element.attr('data-y', y);
                $element.attr('data-a', angle);
            }
        });

        /* ---------------------------------
         * permet d'ouvrir et fermer le menu
         * ---------------------------------
         */
        interact('.menu li').on('tap', function () {
            $('.menu').circleMenu($('ul').hasClass('circleMenu-open') ? 'close' : 'open');
            $('.menu').css('z-index', Z_INDEX);
            Z_INDEX++;
        });

        /* -----------------------------------------
         * permet d'envoyer un artefact vers une ZP
         * ----------------------------------------
         */

        interact('.circleMenu-open .send').dropzone({
            //accepter que les elements avec ce CSS selector
            accept: '.artifact.message, .artifact.image',
            // il faut 10% de l'element overlap pour que le drop soit possible
            overlap: 0.1,
            // les evenements de drop:
            ondragenter: function (event) {
                console.log("menu ITAC -> ZP.ondragenter");
                event.target.classList.add('trash-target');
                event.relatedTarget.classList.add('can-delete');
            },

            ondragleave: function (event) {
                event.target.classList.remove('trash-target');
                event.relatedTarget.classList.remove('can-delete');
            },

            ondrop: (function (event) {
                var $artifact = $(event.relatedTarget);
                var idAr = $artifact.attr('id');
                var idZPcible = $(event.target).attr('id');
                this._connection.emitArtifactFromZPtoOtherZP(idAr, idZPcible);
                console.log("menu ITAC -> ZP.ondrop : envoi sur scket de : [EVT_Envoie_ArtefactdeZPversZP]");
                $('line[data-from=' + idAr + '], line[data-to=' + idAr + ']').each(function(index, element) {
                    var $shape = $(element),
                        $artifact = $('#' + $shape.attr('data-from'));
                    $shape.remove();
                    if ($artifact.hasClass('point') && $('line[data-from=' + $artifact.attr('id') + ']').length == 0) {
                        $artifact.remove();
                    }
                });
                $artifact.remove();
            }).bind(this),

            ondropdeactivate: function (event) {
                // remove active dropzone feedback
                event.target.classList.remove('drop-active');
                event.target.classList.remove('trash-target');
            }
        });

        /* -----------------------------------------
         * permet de supprimer un artefact
         * ----------------------------------------
         */

        interact('.circleMenu-open .trash').dropzone({
            //accepter que les elements avec ce CSS selector
            accept: '.artifact',
            // il faut 10% de l'element overlap pour que le drop soit possible
            overlap: 0.1,
            // les evenements de drop:
            ondragenter: function (event) {
                event.target.classList.add('trash-target');
                event.relatedTarget.classList.add('can-delete');
            },

            ondragleave: function (event) {
                event.target.classList.remove('trash-target');
                event.relatedTarget.classList.remove('can-delete');
            },

            ondrop: (function (event) {
                var $artifact = $(event.relatedTarget),
                    id = $artifact.attr('id');
                this._connection.emitRemovedArtifactInZP(id);
                $('line[data-from=' + id + '], line[data-to=' + id + ']').each(function(index, element) {
                    var $shape = $(element),
                        $artifact = $('#' + $shape.attr('data-from'));
                    $shape.remove();
                    if ($artifact.hasClass('point') && $('line[data-from=' + $artifact.attr('id') + ']').length == 0) {
                        $artifact.remove();
                    }
                });
                $artifact.remove();
            }).bind(this),

            ondropdeactivate: function (event) {
                // remove active dropzone feedback
                event.target.classList.remove('drop-active');
                event.target.classList.remove('trash-target');
            }
        });

        /* -----------------------------------------
         * permet de changer le fond avec un artefact de type image
         * ----------------------------------------
         */

        interact('.circleMenu-open .background').dropzone({
            //accepter que les elements avec ce CSS selector
            accept: '.artifact.image',
            // il faut 10% de l'element overlap pour que le drop soit possible
            overlap: 0.1,
            // les evenements de drop:
            ondragenter: function (event) {
                event.target.classList.add('trash-target');
                event.relatedTarget.classList.add('can-delete');
            },

            ondragleave: function (event) {
                event.target.classList.remove('trash-target');
                event.relatedTarget.classList.remove('can-delete');
            },

            ondrop: function (event) {
                $('.point[data-reference=' + $('.ZP').attr('data-background') + ']').each(function(index, element) {
                    $('line[data-from=' + $(element).attr('id') + ']').hide();
                }).hide();
                var $artifact = $(event.relatedTarget);
                $('.ZP')
                    .css('background-image', $artifact.css('background-image'))
                    .css('background-position', 'center')
                    .css('background-repeat', 'no-repeat')
                    .css('background-size', 'contain')
                    .addClass('background')
                    .attr('data-background', $artifact.attr('id'));
                event.target.classList.remove('trash-target');
                event.relatedTarget.classList.remove('can-delete');
                $('.point[data-reference=' + $('.ZP').attr('data-background') + ']').each(function(index, element) {
                    $('line[data-from=' + $(element).attr('id') + ']').show();
                }).show();
            }
        });

        /* -----------------------------------------
         * permet de revenir au fond original
         * ----------------------------------------
         */
        interact('.circleMenu-open .background').on('hold', function (event) {
            $('.point[data-reference=' + $('.ZP').attr('data-background') + ']').each(function(index, element) {
                $('line[data-from=' + $(element).attr('id') + ']').hide();
            }).hide();
            $('.ZP')
                .css('background-image', '')
                .css('background-position', '')
                .css('background-repeat', '')
                .css('background-size', '')
                .removeClass('background')
                .removeAttr('data-background');
        });
    }
}