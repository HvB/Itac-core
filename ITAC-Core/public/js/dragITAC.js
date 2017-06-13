jQuery().ready(function(){ // on vérifie que la librairie existe
    $(function() {
$('body').hide().fadeIn('slow');


});
    
 // initialisation des objet draggable

  $("img#itacapp-collab").addClass("bouge");
  $("img#itacapp-meteo").addClass("bouge");
  $("img#itacapp-domotique").addClass("bouge");
  $("img#itacapp-morpix").addClass("bouge");
  $("img#itacapp-collab-config1").addClass("bouge");

$("#txtDate").val($.datepicker.formatDate('dd M yy', new Date()));


$( ".bouge" ).draggable({ // on dit que la div dans td (sans td) est draggable
    containment : "table#content" //Permet de ne pas sortir de la div indiqué
	});

$(".bouge").on('mouseup', function(){
	
	// récupère l'obget dragged
	var id = ($(this).attr('id'));
	var pagesuivante = paramITAC[id][2];
	$("#change").animate({
		borderColor: "#35D52E"
	},2000)
	
	setTimeout(function(){
        $(location).attr('href',pagesuivante);// on récupère le nom de la page avec le chemin
    }, 2000); // ferme la fonction setTimeout

});
});//ferme la fonction jQuery   