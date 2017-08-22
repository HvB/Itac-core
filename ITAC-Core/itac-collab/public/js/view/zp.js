/* ==========================================
 *  les zones de partage
 * ==========================================
 */
class ZPView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
    }

    _initialize() {
        interact('.ZP')
            .dropzone({
                //accepter just les element ayant la class artefact
                accept: '.artifact.massage, .artifact.image',
                // il faut 50% de l'element soit dans la zone pour que le drop est possible
                overlap: 0.5,

                // les evenement de drop
                ondropactivate: function (event) {
                    // activer la zone de drop
                    $(event.target).addClass('drop-active');
                },

                ondragenter: function (event) {
                    // la possibilité de drop
                    $(event.target).addClass('drop-target');
                    $(event.relatedTarget).addClass('can-drop');
                },

                ondragleave: function (event) {
                    //supprimer le feedback de drop
                    $(event.target).removeClass('drop-target');
                    $(event.relatedTarget).removeClass('can-drop');
                    $(event.relatedTarget).addClass('artifact');
                },

                ondrop: function (event) {
                    //les evenements aprés le drop
                    $(event.relatedTarget).removeClass('can-drop');
                    $(event.relatedTarget).addClass('artifact');
                },

                ondropdeactivate: function (event) {
                    //supprimer le drop-active class de la zone de drop
                    $(event.target).removeClass('drop-active drop-target');
                }
            })
            .on('hold', (function (event) {
                var $ZP = $(event.currentTarget),
                    $element = $(event.target);
                if ($element.hasClass('artifact') && !$ZP.hasClass('background')) {
                    var artifact = this._ZP.getArtifact($element.attr('id'));
                    var shape = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                    shape.setAttributeNS(null, 'class', 'temporary');
                    shape.setAttributeNS(null, 'data-from', artifact.id);
                    shape.setAttributeNS(null, "x1", artifact.x + $element.width() / 2);
                    shape.setAttributeNS(null, "y1", artifact.y + $element.height() / 2);
                    shape.setAttributeNS(null, "x2", event.clientX);
                    shape.setAttributeNS(null, "y2", event.clientY);
                    shape.setAttributeNS(null, "stroke", "black");
                    shape.setAttributeNS(null, "stroke-width", 3);
                    document.getElementsByTagName('svg')[0].appendChild(shape);

                    var interaction = event.interaction;
                    if (!interaction.interacting()) {
                        interaction.start({name: 'drag'}, interact('line'), shape);
                    }
                }
            }).bind(this));

        interact('line')
            .draggable({
                manualStart: true,
                onstart: function (event) {
                },
                onmove: function (event) {
                    var shape = event.target;
                    shape.setAttributeNS(null, "x2", event.clientX);
                    shape.setAttributeNS(null, "y2", event.clientY);
                },
                onend: function (event) {
                }
            });
    }
}