/* ==========================================
 *  les zones de partage
 * ==========================================
 */
class LineView extends View {
    constructor(ZP, connection) {
        super(ZP, connection);
    }

    _draggable() {
        return [{
            target: 'line',
            option: {
                manualStart: true,
                onmove: function (event) {
                    var shape = event.target;
                    shape.setAttributeNS(null, 'x2', event.clientX+'px');
                    shape.setAttributeNS(null, 'y2', event.clientY+'px');
                },
                onend: function (event) {
                    console.log("line end");
                    let $shape = $(event.target);
                    setTimeout(()=>{ if ($shape.hasClass("temporary")) $shape.remove(); });
                }
            }
        }];
    }
}