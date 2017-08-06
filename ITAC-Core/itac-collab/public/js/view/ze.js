/* ==========================================
 *  les zones d'echange
 * ==========================================
 */
class ZEView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
    }

    _initialize() {
        interact('.ZE')
            .dropzone({
                // --> accepter juste les element de la class artefact
                accept: '.artifact.message, .artifact.image',
                // --> il faut 10% de l'element soit dans la zone pour que le drop est possible
                overlap: 0.1,
                // -- >les evenement de drop

                ondropactivate: function (event) {
                    //activer la zone de drop
                    $(event.target).addClass('drop-active');
                },

                // --> lorsque l artefact entre la zone
                ondragenter: function (event) {
                    $(event.target).addClass('drop-target');
                    $(event.relatedTarget).addClass('can-drop');
                    $(event.relatedTarget).removeClass('dropped left right top');
                    $(event.relatedTarget).find("p").show();
                    $(event.relatedTarget).remove().appendTo('.ZP');
                },

                ondragleave: (function (event) {
                    // on recupeère les identifiant
                    var idAr = event.relatedTarget.id, idZE = event.target.id;
                    console.log('ondragleave d un Artefact (' + idAr + ') de la ZE= ' + idZE);// + ' vers la ZP= ' + mZP.id);
                    console.log('ondragleave d un Artefact --> emission sur soket de [EVT_EnvoieArtefactdeZEversZP]');
                    this._connection.emitArtifactFromZEToZP(idAr, idZE);
                    console.log('ondragleave d un Artefact --> [OK} evenement emis [EVT_EnvoieArtefactdeZEversZP]');

                    $(event.target).removeClass('drop-target');
                    $(event.relatedTarget).removeClass('can-drop');
                }).bind(this),

                ondrop: (function (event) {
                    //les evenements aprés le drop
                    var idAr = event.relatedTarget.id, idZE = event.target.id;
                    console.log('ondrop d un Artefact (' + idAr + ') vers ZE= ' + idZE);
                    console.log('ondrop d un Artefact --> className =' + $(event.relatedTarget).attr('class'));
                    console.log('ondrop d un Artefact --> emission sur soket de [EVT_EnvoieArtefactdeZPversZE]');
                    this._connection.emitArtifactFromZPToZE(idAr, idZE);

                    $(event.relatedTarget).find("p").hide();
                    $(event.relatedTarget).remove().css('transform', '').appendTo($(event.target).find('.container'));
                    $(event.relatedTarget).removeClass('can-drop');
                    $(event.relatedTarget).addClass('dropped');
                    $('line[data-from=' + idAr + '], line[data-to=' + idAr + ']').each(function (index, element) {
                        var $shape = $(element),
                            $artifact = $('#' + $shape.attr('data-from'));
                        $shape.remove();
                        if ($artifact.hasClass('point') && $('line[data-from=' + $artifact.attr('id') + ']').length == 0) {
                            $artifact.remove();
                        }
                    });
                }).bind(this),

                ondropdeactivate: function (event) {
                    //supprimer le drop-active class de la zone de drop
                    $(event.target).removeClass('drop-active drop-target');
                }
            })
            .draggable({
                onstart: function (event) {
                    var $element = $(event.target);
                    $('.artifact[data-ze=' + $element.attr('id') + ']').removeClass('active');
                    $('svg [data-ze=' + $element.attr('id') + ']').remove();
                    $element.css('z-index', Z_INDEX);
                    Z_INDEX++;
                },
                onmove: (function (event) {
                    var $element = $(event.target),
                        ZE = this._ZP.getZE($element.attr('id')),
                        $ZP = $('.ZP'),
                        width = $ZP.width(),
                        height = $ZP.height();
                    ZE.x += event.dx;
                    ZE.y += event.dy;
                    if (event.pageX * height / width <= event.pageY) {
                        if (height - event.pageX * height / width <= event.pageY) {
                            ZE.angle = ANGLE_BOTTOM;
                        } else {
                            ZE.angle = ANGLE_LEFT;
                        }
                    } else {
                        if (height - event.pageX * height / width <= event.pageY) {
                            ZE.angle = ANGLE_RIGHT;
                        } else {
                            ZE.angle = ANGLE_TOP;
                        }
                    }
                    $element.css('transform', 'translate(' + ZE.x + 'px, ' + ZE.y + 'px) rotate(' + ZE.angle + 'deg)');
                }).bind(this),
                onend: (function (event) {
                    var $element = $(event.target),
                        ZE = this._ZP.getZE($element.attr('id')),
                        $ZP = $('.ZP'),
                        width = $ZP.width(),
                        height = $ZP.height(),
                        offset = $element.offset(),
                        top = offset.top,
                        left = offset.left;
                    switch (ZE.angle) {
                        case ANGLE_BOTTOM:
                            ZE.y -= -height + $element.height();
                        case ANGLE_TOP:
                            ZE.y -= top;
                            if (left < 0) {
                                ZE.x -= left;
                            } else if (left > width - $element.width()) {
                                ZE.x -= left - width + $element.width();
                            }
                            break;
                        case ANGLE_RIGHT:
                            ZE.x -= -width + $element.height();
                        case ANGLE_LEFT:
                            ZE.x -= left;
                            if (top < 0) {
                                ZE.y -= top;
                            } else if (top > height - $element.width()) {
                                ZE.y -= top - height + $element.width();
                            }
                            break;
                    }
                    $element.css('transform', 'translate(' + ZE.x + 'px, ' + ZE.y + 'px) rotate(' + ZE.angle + 'deg)');
                }).bind(this)
            });
        interact('.ZP > .ZE .avatar')
            .on('tap', (function (event) {
                var $ZE = $(event.target).parents('.ZE'),
                    ZE = this._ZP.getZE($ZE.attr('id'));
                ZE.toolOpened ? $ZE.find('.tool').hide() : $ZE.find('.tool').show();
                ZE.toolOpened = !ZE.toolOpened;
            }).bind(this));
    }
}