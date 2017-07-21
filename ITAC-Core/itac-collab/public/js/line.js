/* ==========================================
 *  les lignes
 * ==========================================
 */
interact('line')
    .draggable({
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