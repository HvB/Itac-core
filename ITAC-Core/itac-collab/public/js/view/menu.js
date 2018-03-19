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
                    // this._connection.emitArtifactFromZPToOtherZP(idArtifact, idOtherZP);
                    console.log("menu ITAC -> ZP.ondrop : suppression artefact " + idArtifact);
                    this._ZP.getArtifact(idArtifact).migrate(idOtherZP);
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
                    this._ZP.background = artifact.id;
                    // on annule le deplacement: on remet l'artefact a sa position de depart
                    artifact.cancelMove();
                    $('.ZP')
                        .css('background-image', $artifact.css('background-image'))
                        .css('background-position', 'center')
                        .css('background-repeat', 'no-repeat')
                        .css('background-size', 'contain')
                        .addClass('background');
                    event.target.classList.remove('trash-target');
                    event.relatedTarget.classList.remove('can-delete');
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
            target: '.menu li:first-child',
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
                $('#' + this._ZP.background).show();
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