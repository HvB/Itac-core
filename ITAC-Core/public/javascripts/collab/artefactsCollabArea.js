var angle = 0; //angle de rotation
scale = 1; //facteur de zoom

interact('.dropped-msg').gesturable ({ //les artefact dans la ZE ne peuvent pas etre manipuler (zoom, rotation) 
enabled: true
})
interact('.artefact').gesturable({ // 
onmove: function (event) {


var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx, //les positions x et y 
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;


    // update the posiion attributes
    target.setAttribute('data-x', x); //fonction de mise a jour de x et  
    target.setAttribute('data-y', y);


    // Update scale
   scale = scale * (1 + event.ds); //mise à jour de la zoom 

    // Update angle, movement, and scale
    angle += event.da; //mise à jour de l'angle 
    target.style.webkitTransform = target.style.transform =   'translate(' + x + 'px, ' + y + 'px)' + ' ' + 'rotate(' + angle + 'deg)' + ' ' + 'scale(' + scale + ')' ;//modification de la forme de l'artefact 

},
onend : function(event){
}
}).draggable({ //glisser l'artefact

	inertia:true,
onstart: function (event) {

var maxZ = Math.max.apply(null,  //appliquer une z-index max pour l'artefact en cours de manipulation
$.map($('body > *'), function(e,n) {
  if ($(e).css('position') != 'static')
    return parseInt($(e).css('z-index')) || 1;
}));

  //event.target.style.background = 'red';
  event.target.style.zIndex = maxZ + 1; 
//  event.target.style.position = 'relative'; 
},
onmove: dragMoveListener }); //fonction responsable de glissement

function dragMoveListener (event) {


var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy,
       
        scaleX = target.getBoundingClientRect().width / target.offsetWidth,
        scaleY = target.getBoundingClientRect().height / target.offsetHeight,

     

        sc = (scaleX+scaleY)/2;
  


function getRotationDegrees(obj) { //stocker l'angle de la rotation
var matrix = obj.css("-webkit-transform") ||
obj.css("-moz-transform")    ||
obj.css("-ms-transform")     ||
obj.css("-o-transform")      ||
obj.css("transform");
if(matrix !== 'none') {
    var values = matrix.split('(')[1].split(')')[0].split(',');
    var a = values[0];
    var b = values[1];
    var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
} else { var angle = 0; }
return angle;
}

angle1= getRotationDegrees($(target));
//alert(angle1)


    // update the posiion attributes
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);


    // Update scale
  //sc = scale ;

    // Update angle, movement, and scale
   // angle1 += event.da;
   var zoom =  target.style.webkitTransform = target.style.transform =   'scale(' + sc + ')' ;
   var rot =  target.style.webkitTransform = target.style.transform =   'rotate(' + angle1 + 'deg)';

    target.style.webkitTransform = target.style.transform =   'translate(' + x + 'px, ' + y + 'px)' +  ' ' + rot /*+  ' ' + zoom */; //+ ' ' + 'rotate(' + angle + 'deg)' + ' ' + 'scale(' + sc + ')' ;

}


//le point est draggable
interact('.point')
  .draggable({
    inertia: true,
//l element reste dans sa zone limite , il peut pas sortir de son parent 
    restrict: {
    // restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    // activer autoScroll
    autoScroll: true,


//appeler cette fonction a chaque action de glissement 
    onmove: dragMoveListener,
//appeler cette fontion a chaque fin de l'action de glissement 
    onend: function (event) {
    
    }
  })  

interact('.img')
  //selectionner limage avec double click
    //.on('doubletap', function (event) {
    // event.currentTarget.classList.toggle('selected')
     

 // });
    //aprés le double click on crée les points par simple click
/*interact('.selected')*/.on('tap' , function (event) { 
  var ID=event.currentTarget.id;
  //alert(ID);
$("<div  id= 'notate' class='draggable point' >  </div>").appendTo("#"+ID+"");
     })



//fonction de glissement toujours appeler lorsque on fait le drag and drop
  function dragMoveListener (event) {
    var target = event.target,
        // stocker la position dans les attributs data-x/data-y
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translation de l'element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // mis à jour de la position 
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }

  window.dragMoveListener = dragMoveListener;