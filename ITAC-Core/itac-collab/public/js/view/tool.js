/* ==========================================
 *  la palette des zones d'echange
 * ==========================================
 */
class ToolView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
    }

    _initialize() {
        interact('.tool')
            .dropzone({
                accept: '.artifact.point',
                overlap: 0.1,

                ondragenter: (function (event) {
                    if (this._ZP.background) {
                        var $element = $(event.relatedTarget);
                        $element.removeClass('dropped');
                        $element.remove().appendTo('.ZP');
                    }
                }).bind(this),

                ondropdeactivate: (function (event) {
                    if (this._ZP.background) {
                        var $point = $('.template .artifact.point').clone(),
                            idZE = this._ZP.getArtifact(this._ZP.background).getPoint($(event.relatedTarget).attr('id')).ZE,
                            tool = this._ZP.getZE(idZE).tool;
                        if (!tool.point) {
                            tool.reload();
                            $('.ZE#' + idZE + ' .tool').append($point.addClass('dropped'));
                            $point.attr('id', tool.point.id);
                        }
                    }
                }).bind(this)
            });
    }
}