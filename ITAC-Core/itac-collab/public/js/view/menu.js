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
            onmove: (function (event) {
                var $element = $(event.target),
                    menu = this._ZP.menu;
                menu.x += event.dx;
                menu.y += event.dy;
                $element.css('transform', 'translate(' + menu.x + 'px, ' + menu.y + 'px) rotate(' + menu.angle + 'deg)');
            }).bind(this)
        }).gesturable({
            inertia: true,
            restrict: {restriction: "parent", endOnly: true, elementRect: {top: 0, left: 0, bottom: 1, right: 1}},
            autoScroll: true,
            onstart: function (event) {
                $('.menu').css('z-index', Z_INDEX);
                Z_INDEX++;
            },
            onmove: (function (event) {
                var $element = $(event.target),
                    menu = this._ZP.menu;
                menu.x += event.dx;
                menu.y += event.dy;
                menu.angle += event.da;
                $element.css('transform', 'translate(' + menu.x + 'px, ' + menu.y + 'px) rotate(' + menu.angle + 'deg)');
            }).bind(this)
        });

        /* ---------------------------------
         * permet d'ouvrir et fermer le menu
         * ---------------------------------
         */
        interact('.menu li').on('tap', (function () {
            var opened = this._ZP.menu.opened;
            this._ZP.menu.opened = !opened;
            $('.menu').circleMenu(opened ? 'close' : 'open');
            $('.menu').css('z-index', Z_INDEX);
            Z_INDEX++;
        }).bind(this));

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
                var idArtifact = $artifact.attr('id');
                var idOtherZP = $(event.target).attr('id');
                this._connection.emitArtifactFromZPToOtherZP(idArtifact, idOtherZP);
                console.log("menu ITAC -> ZP.ondrop : envoi sur scket de : [EVT_Envoie_ArtefactdeZPversZP]");
                $('line[data-from=' + idArtifact + '], line[data-to=' + idArtifact + ']').each(function(index, element) {
                    var $shape = $(element),
                        $artifact = $('#' + $shape.attr('data-from'));
                    $shape.remove();
                    if ($artifact.hasClass('point') && $('line[data-from=' + $artifact.attr('id') + ']').length == 0) {
                        $artifact.remove();
                    }
                });
                this._ZP.removeArtifact(idArtifact);
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
                    idArtifact = $artifact.attr('id');
                this._connection.emitRemovedArtifactInZP(idArtifact);
                $('line[data-from=' + idArtifact + '], line[data-to=' + idArtifact + ']').each(function(index, element) {
                    var $shape = $(element),
                        $artifact = $('#' + $shape.attr('data-from'));
                    $shape.remove();
                    if ($artifact.hasClass('point') && $('line[data-from=' + idArtifact + ']').length == 0) {
                        $artifact.remove();
                    }
                });
                this._ZP.removeArtifact(idArtifact);
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

            ondrop: (function (event) {
                var $artifact = $(event.relatedTarget);
                this._ZP.background = $artifact.attr('id');
                $('.point[data-reference=' + this._ZP.background + ']').each(function(index, element) {
                    $('line[data-from=' + $(element).attr('id') + ']').hide();
                }).hide();
                $('.ZP')
                    .css('background-image', $artifact.css('background-image'))
                    .css('background-position', 'center')
                    .css('background-repeat', 'no-repeat')
                    .css('background-size', 'contain')
                    .addClass('background')
                    .attr('data-background', this._ZP.background);
                event.target.classList.remove('trash-target');
                event.relatedTarget.classList.remove('can-delete');
                $('.point[data-reference=' + this._ZP.background + ']').each(function(index, element) {
                    $('line[data-from=' + $(element).attr('id') + ']').show();
                }).show();
            }).bind(this)
        });

        /* -----------------------------------------
         * permet de revenir au fond original
         * ----------------------------------------
         */
        interact('.circleMenu-open .background').on('hold', (function (event) {
            $('.point[data-reference=' + this._ZP.background + ']').each(function(index, element) {
                $('line[data-from=' + $(element).attr('id') + ']').hide();
            }).hide();
            this._ZP.background = null;
            $('.ZP')
                .css('background-image', '')
                .css('background-position', '')
                .css('background-repeat', '')
                .css('background-size', '')
                .removeClass('background');
        }).bind(this));
    }
}