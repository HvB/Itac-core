///les zones de drops ( zones d'echange) 

// indique que la classe 'zoneEchange' est une zone ou l'on peut deposer des objets
interact('.zoneEchange').dropzone({
	
	//accepter juste les element de la class artefact
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

 socket.emit('EVT_EnvoieArtefactdeZEversZP', idAr, idZE , 'test');
 
 
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
socket.emit('EVT_EnvoieArtefactdeZPversZE', idAr, idZE);

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




}

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



}
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


}
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

}


},
ondropdeactivate: function (event) {
	

//supprimer le drop-active class de la zone de drop 

 event.target.classList.remove('drop-active');
 event.target.classList.remove('drop-target');
}
});
