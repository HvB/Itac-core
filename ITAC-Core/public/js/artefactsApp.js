 /**********************  Gestion des artefacts *******************************/

var angle = 0; //angle de rotation
scale = 1; //facteur de zoom

interact('.dropped-msg').gesturable({ // les artefact dans la ZE ne peuvent pas etre manipulés (zoom, rotation) 
enabled: true            // TC : truc bizarre : on ne veut pas qu'ils puissent être zoom et rotation...or =true ??? à vérifier
})

interact('.artefact').gesturable({ // 
onmove: function (event) {


var target = event.target,
        // keep the dragged position in the data-x/data-y attributes
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx, //les positions x et y 
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;


    // update the posiion attributes
    target.setAttribute('data-x', x); //fonction de mise à jour de x et y
    target.setAttribute('data-y', y);


    // Update scale
   scale = scale * (1 + event.ds); //mise à jour du facteur de zoom 

    // Update angle, movement, and scale
    angle += event.da; //mise à jour de l'angle 
    target.style.webkitTransform = target.style.transform =   'translate(' + x + 'px, ' + y + 'px)' + ' ' + 'rotate(' + angle + 'deg)' + ' ' + 'scale(' + scale + ')' ;
    //modification de la forme de l'artefact 

},    // fin du traitement du move sur un artefact l.37
onend : function(event){
}
}).draggable({ //glisser l'artefact (draggable)

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
onmove: dragMoveListener, //fonction responsable de glissement
//appeler cette fontion a chaque fin de l'action de glissement 
onend: function (event) {}
    }) // fin de la partie draggable de l'artefact

    
function dragMoveListener (event) {

//alert("c'est là?: 1");
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

    // update the position attributes
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
$("<div  id='notate' class='draggable point'>  </div>").appendTo("#"+ID+"");
     })


//fonction de glissement toujours appeler lorsque on fait le drag and drop
  function dragMoveListener (event) {
    //alert("C'est là?: 2");
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

 

//les zones de drops ( zones d'echange) 

interact('.zoneEchange').dropzone({
//accepter just les element ayant la class artefact
accept: '.artefact',

//il faut 10% de l'element soit dans la zone pour que le drop est possible 
overlap: 0.1,

//les evenement de drop

ondropactivate: function (event) {
//activer la zone de drop
 event.target.classList.add('drop-active');
},
//lorsque lacrefact entre la zone
ondragenter: function (event) {

 var draggableElement = event.relatedTarget,
     zoneEchangeElement = event.target,

dropRect= interact.getElementRect(event.target),
dropCenter = {
x: dropRect.left+dropRect.width / 2 , 
y: dropRect.top+dropRect.height /2
};

//la possibilité de drop  
 zoneEchangeElement.classList.add('drop-target');
 draggableElement.classList.add('can-drop');

},

ondragleave: function (event) {
//supprimer les classes ajoutées aprés le drop 
 event.target.classList.remove('drop-target');
 event.relatedTarget.classList.remove('can-drop');
 event.relatedTarget.classList.remove('dropped-image');
 event.relatedTarget.classList.remove('dropped-msg');
 event.relatedTarget.classList.remove('left');
 event.relatedTarget.classList.remove('right');
 event.relatedTarget.classList.remove('top');
 var idAr = event.relatedTarget.id;
 var idZE=event.target.id;
 //alert("artefact numero " +idAr +" de " +idZE)

 socket.emit('EVT_Envoie_ArtefactdeZEversZP', idAr, idZE , 'test');
 
 
//revenir à la classe initialle 
 //event.relatedTarget.classList.add('artefact');
 $(event.relatedTarget).find("p").show();
 //affichage du contenu
},
ondrop: function (event) {
//les evenements aprés le drop
var idAr = event.relatedTarget.id;
var idZE=event.target.id;

event.relatedTarget.classList.remove('can-drop');

var titre = $(event.relatedTarget).find("h1").text(); //le titre de lartefact
var message= $(event.relatedTarget).find("p").text();  //le contenu

var bg = $(event.relatedTarget).css('background-image'); //l'image
bg=bg.replace('url(','').replace(')','');
var className = $(event.relatedTarget).attr('class');

if ( (className != "draggable artefact dropped-msg") & (className != "draggable artefact img dropped-image") & (className != "draggable artefact img dropped-image right")& (className != "draggable artefact img dropped-image left")& (className != "draggable artefact img dropped-image top") & (className != "draggable artefact dropped-msg left")& (className != "draggable artefact dropped-msg right ")& (className != "draggable artefact dropped-msg top"))
{
var idAr = event.relatedTarget.id;
var idZE=event.target.id;

//alert("envoie art " +idAr+" vers " +idZE)
socket.emit('EVT_Envoie_ArtefactdeZPversZE', idAr, idZE);

}


//selon la classe (image ou artefact normal) on organise les drops (rotations et affichage)
var className = $(event.relatedTarget).attr('class');

   $(event.relatedTarget).hide();
if (event.target.id == "test0") {

  if (className == "draggable artefact")  {

$("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg left' >  <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);

}
else if ((className == "draggable artefact img") || (className == "draggable artefact img selected")) {
$("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image left' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
}

else if (className == "draggable artefact dropped-msg left") {

$("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg left' >  <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);
;
}

else if (className == "draggable artefact img dropped-image left") {
$("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image left' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
}
else if (className == "draggable artefact dropped-msg") {

$("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg left' >  <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);
;
}

else if (className == "draggable artefact img dropped-image left") {
$("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image left' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
}

}  // fin test0

else if (event.target.id == "test4") {

if (className == "draggable artefact") {

$("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg right' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);
}
else if ((className == "draggable artefact img") || (className == "draggable artefact img selected")) {
$("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image right' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
}


else if (className == "draggable artefact dropped-msg right") {

$("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg right' >  <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);

}

else if (className == "draggable artefact img dropped-image right") {
$("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image right' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
}
else if (className == "draggable artefact dropped-msg ") {

$("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg right' >  <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);

}

else if (className == "draggable artefact img dropped-image ") {
$("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image right' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
}


}  // fin test4
else if ((event.target.id == "test1") || (event.target.id == "test2")  || (event.target.id == "test3")  ) 
{

if (className == "draggable artefact") {

$("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg top' > <h1> "+titre+" </h1>  <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);
}
else if ((className == "draggable artefact img") || (className == "draggable artefact img selected")) {
$("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image top' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
}
else if (className == "draggable artefact dropped-msg top") {

$("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg top' >  <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);

}

else if (className == "draggable artefact img dropped-image top") {
$("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image top' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
}
else if (className == "draggable artefact dropped-msg") {

$("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg top' >  <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);

}

else if (className == "draggable artefact img dropped-image") {
$("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image top' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
}


} // fin test1  2  ou 3 
else {

if ((className == "draggable artefact") || (className == "draggable artefact selected"))   {

$("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg ' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);
}

else if ((className == "draggable artefact img") || (className == "draggable artefact img selected")) {
$("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image ' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
}


else if (className == "draggable artefact dropped-msg")  {

$("<div  id= "+event.relatedTarget.id+" class='draggable artefact dropped-msg' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target);

}

else if (className == "draggable artefact img dropped-image")  {
$("<div  id= "+event.relatedTarget.id+" class='draggable artefact img dropped-image ' > <h1> "+titre+" </h1> <p style='display:none'> "+message+" </p> </div>").appendTo(event.target).css("background-image", "url("+bg+")");
}

}   // fin des autres cas


},
ondropdeactivate: function (event) {
	

//supprimer le drop-active class de la zone de drop 

 event.target.classList.remove('drop-active');
 event.target.classList.remove('drop-target');
}
});  // TC: fin dropzone ???

