/* ------------------------- 
 * le menu est draggable
 * -------------------------
 */
class MenuView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
    }

    _dropzone() {
        return [{
            target: '.circleMenu-open .send',
            option: {
                //accepter que les elements avec ce CSS selector
                accept: '.artifact.message, .artifact.image',
                // il faut que le menu soit sous lepointer pour que le drop soit possible
                overlap: 'pointer',
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
                    // $('line[data-from=' + idArtifact + '], line[data-to=' + idArtifact + ']').each(function (index, element) {
                    //     var $shape = $(element),
                    //         $artifact = $('#' + $shape.attr('data-from'));
                    //     $shape.remove();
                    //     if ($artifact.hasClass('point') && $('line[data-from=' + $artifact.attr('id') + ']').length == 0) {
                    //         $artifact.remove();
                    //     }
                    // });
                    //this._ZP.removeArtifact(idArtifact);
                    // $('line[data-from=' + idArtifact + '], line[data-to=' + idArtifact + ']').remove();
                    //$artifact.remove();
                    this._ZP.getArtifact(idArtifact).migrate();
                }).bind(this),

                ondropdeactivate: function (event) {
                    // remove active dropzone feedback
                    event.target.classList.remove('drop-active');
                    event.target.classList.remove('trash-target');
                }
            }
        }, {
            target: '.circleMenu-open .trash',
            option: {
                //accepter que les elements avec ce CSS selector
                accept: '.artifact',
                // il faut que le menu soit sous lepointer pour que le drop soit possible
                overlap: 'pointer',
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
                    this._ZP.getArtifact(idArtifact).delete();
                    // if ($artifact.hasClass('point') && this._ZP.background) {
                    //     this._connection.emitArtifactPartialUpdate(this._ZP.background, [{
                    //         op: 'remove',
                    //         path: '/points/' + idArtifact
                    //     }]);
                    //     this._ZP.getArtifact(this._ZP.background).removePoint(idArtifact);
                    // } else {
                    //     this._ZP.getArtifact(idArtifact).remove();
                    //     this._connection.emitRemovedArtifactInZP(idArtifact);
                    //     $('line[data-from=' + idArtifact + '], line[data-to=' + idArtifact + ']').each(function (index, element) {
                    //         var $shape = $(element),
                    //             $artifact = $('#' + $shape.attr('data-from'));
                    //         $shape.remove();
                    //         if ($artifact.hasClass('point') && $('line[data-from=' + idArtifact + ']').length == 0) {
                    //             $artifact.remove();
                    //         }
                    //     });
                    //     this._ZP.removeArtifact(idArtifact);
                    // }
                    // $('line[data-from=' + idArtifact + '], line[data-to=' + idArtifact + ']').remove();
                    // $artifact.remove();
                }).bind(this),

                ondropdeactivate: function (event) {
                    // remove active dropzone feedback
                    event.target.classList.remove('drop-active');
                    event.target.classList.remove('trash-target');
                }
            }
        }, {
            target: '.circleMenu-open .background',
            option: {
                //accepter que les elements avec ce CSS selector
                accept: '.artifact.image',
                // il faut que le menu soit sous lepointer pour que le drop soit possible
                overlap: 'pointer',
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
                    let $artifact = $(event.relatedTarget);
                    let artifact = this._ZP.getArtifact($artifact.attr('id'));
                    //ToDo: remove obsolete code
                    // if (this._ZP.background) {
                    //     this._connection.emitArtifactPartialUpdate(this._ZP.background, [{
                    //         op: 'add', path: '/isBackground', value: false
                    //     }]);
                    //     $('#' + this._ZP.background).show();
                    // }
                    this._ZP.background = artifact.id;
                    //ToDo: remove obsolete code
                    // if (Object.keys(artifact.points).length === 0) {
                    //     this._connection.emitArtifactPartialUpdate(artifact.id, [{
                    //         op: 'add', path: '/points', value: {}
                    //     }]);
                    // }
                    // $('.ZP > .point').remove();
                    // $('line').remove();
                    // this._connection.emitArtifactPartialUpdate(artifact.id, [{
                    //     op: 'add', path: '/isBackground', value: true
                    // }]);
                    // $('#' + artifact.id).hide();
                    // $('.point[data-reference=' + artifact.id + ']').each(function (index, element) {
                    //     $('line[data-from=' + $(element).attr('id') + ']').remove();
                    // }).remove();
                    $('.ZP')
                        .css('background-image', $artifact.css('background-image'))
                        .css('background-position', 'center')
                        .css('background-repeat', 'no-repeat')
                        .css('background-size', 'contain')
                        .addClass('background');
                    event.target.classList.remove('trash-target');
                    event.relatedTarget.classList.remove('can-delete');

                    // ToDo: remove obsolete code
                    // console.log("background artifact: " + this._ZP.background);
                    // for (var id in artifact.points) {
                    //     var $point = $('.template .artifact.point').clone(),
                    //         point = artifact.getPoint(id);
                    //     console.log("background point: " + id);
                    //     $('.ZP').append($point);
                    //     $point.attr('id', id);
                    //     $point.css('transform', 'translate(' + point.x + 'px, ' + point.y + 'px)');
                    //     let x1 = $point.offset().left + $point.width()/2;
                    //     let y1 = $point.offset().top + $point.height()/2;
                    //     let id1 = id;
                    //     for (var artId in point.linksTo){
                    //         console.log("artifact id : "+artId);
                    //         let $art=$('#'+artId), id2=artId, x2=x1, y2=y1;
                    //         if ($art && $art.offset()) {
                    //             x2 = $art.offset().left + $art.width()/2;
                    //             y2 = $art.offset().top + $art.height()/2;
                    //         }
                    //         let line = this._createLine(false, id1, x1, y1, id2, x2, y2);
                    //     }
                    //     point.setChanged();
                    //     point.notifyObservers();
                    // }
                    // $('.point[data-reference=' + artifact.id + ']').each(function (index, element) {
                    //     $('line[data-from=' + $(element).attr('id') + ']').show();
                    // }).show();
                }).bind(this)
            }
        }];
    }

    _draggable() {
        return [{
            target: '.menu',
            option: {
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
            }
        }];
    }

    _gesturable() {
        return [{
            target: '.menu',
            option: {
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
            }
        }];
    }

    _tap() {
        return [{
            target: '.menu li',
            action: (function () {
                var opened = this._ZP.menu.opened;
                this._ZP.menu.opened = !opened;
                $('.menu').circleMenu(opened ? 'close' : 'open');
                $('.menu').css('z-index', Z_INDEX);
                Z_INDEX++;
            }).bind(this)
        }];
    }

    _hold() {
        return [{
            target: '.circleMenu-open .background',
            action: (function (event) {
                $('.ZP > .point').remove();
                this._connection.emitArtifactPartialUpdate(this._ZP.background, [{
                    op: 'add', path: '/isBackground', value: false
                }]);
                $('#' + this._ZP.background).show();
                // $('.point[data-reference=' + this._ZP.background + ']').each(function (index, element) {
                //     $('line[data-from=' + $(element).attr('id') + ']').hide();
                // }).hide();
                console.log("background artifact: " + this._ZP.background);
                let artifact = this._ZP.getArtifact(this._ZP.background);
                if (artifact){
                    for (let pId in artifact.points ){
                        console.log("background point: " + pId);
                        $('line[data-from=' + pId + '], line[data-to=' + pId + ']').remove();
                    }
                }
                this._ZP.background = null;
                $('.ZP')
                    .css('background-image', '')
                    .css('background-position', '')
                    .css('background-repeat', '')
                    .css('background-size', 'cover')
                    .removeClass('background');
            }).bind(this)
        }];
    }
}