$( document ).ready(function() {
for(var i =0; i<8; i++) 
{
//alert(i)
 $("<div  id=test"+i+"  class='zoneEchange' > <img id =avatar"+i+" ></img> </div>").appendTo("#ZP");
}});

///////////////////////////////////////////

  // setTimeout(function() { alert('connection .....');}, 1000);
   //alert('connection .....');
    var socket = io.connect({transport: ['websocket']});


    socket.emit('EVT_DemandeConnexionZA', 'pseudo', '127.0.0.1' );


    socket.on('EVT_ReponseOKConnexionZA',function(idZA) {

    	

    	alert('Connexion Autorise ZA='+idZA);

    	

    });
   

    /////////////////////////////////////////////
    socket.on('EVT_NewZEinZP', function(pseudo, idZE ,idZP)
  		{
    	//alert('Creation de ZE ='+idZE+' Pour '+pseudo)
    	$(function () {
    	
        	$("#"+idZE+"").slideDown(1000);
        	// $("<div  id="+idZE+"  class='zoneEchange' > <img id =avatar"+idZE+" ></img> </div>").appendTo("#ZP"); //Creation de la zone

		//$("#"+idZE+"").draggable({ drag: function (event, ui) {if($(this).find('div.artefact').length !=0){$this.draggable('option', 'disabled', true)}}  })
//$("#"+idZE+"").click(function() { $(this).toggleClass('rotated')})
/*
$("#"+idZE+"").click(function() {
	var angle = ($(this).data('angle')+90)||90;
	$(this).css({'transform': 'rotate('+ angle +'deg)'});
	$(this).data('angle', angle);

		})*/
        	/*interact("#"+idZE+"")
       	 
        	  .resizable({
        	    preserveAspectRatio: false,
        	    edges: { left: true, right: true, bottom: true, top: true }
        	  })
        	  .on('resizemove', function (event) {
        	    var target = event.target,
        	        x = (parseFloat(target.getAttribute('data-x')) || 0),
        	        y = (parseFloat(target.getAttribute('data-y')) || 0);

        	    // update the element's style
        	    target.style.width  = event.rect.width + 'px';
        	    target.style.height = event.rect.height + 'px';

        	    // translate when resizing from top or left edges
        	    x += event.deltaRect.left;
        	    y += event.deltaRect.top;

        	    target.style.webkitTransform = target.style.transform =
        	        'translate(' + x + 'px,' + y + 'px)';

        	    target.setAttribute('data-x', x);
        	    target.setAttribute('data-y', y);
        	  });*/
    	})
  		}	)
    	
    //////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    	socket.on('EVT_NewArtefactInZE',function(pseudo,idZE,chaineJSON)

    	{ 
    		art=JSON.parse(chaineJSON)

    		if (art.typeArtefact == "image") {
           		art.contenu=(art.contenu).replace(/(\r\n|\n|\r)/gm, ""); //supprimer les caractére spéciaux

    		
    		console.log(art.contenu);
    			//var target = $("<div id="+art.idAr+" class='draggable artefact img dropped-image' style='background-image: url(data:image/png;base64,"+art.contenu+")'> </div>");
              //var target = $("<div  id= "+art.idAr+" class='draggable artefact img dropped-image' >	<img src='data:image/png;base64,"+art.contenu+"'/>  <br> </div>");
             if (idZE == "test0")  {
    var target = $("<div id="+art.idAr+" class='draggable artefact img dropped-image left' style='background-image: url(data:image/png;base64,"+art.contenu+")'> </div>");
             }
             else if (idZE == "test1") {    var target = $("<div id="+art.idAr+" class='draggable artefact img dropped-image right' style='background-image: url(data:image/png;base64,"+art.contenu+")'> </div>");
}
             
             else if ((idZE == "test2") || (idZE =="test3") || (idZE == "test4")) 
            	 {    var target = $("<div id="+art.idAr+" class='draggable artefact img dropped-image top' style='background-image: url(data:image/png;base64,"+art.contenu+")'> </div>");
}
             
             else {    var target = $("<div id="+art.idAr+" class='draggable artefact img dropped-image' style='background-image: url(data:image/png;base64,"+art.contenu+")'> </div>");
}
    		}
    		
    		
    		else {
           		art.contenu=(art.contenu).replace(/(\r\n|\n|\r)/gm, "</br>"); //pour le saut de ligne

    	
  //var target = $("<div  id= "+art.idAr+" class='draggable artefact msg ' >	<h1> "+art.titre+" </h1> <br> <p style ='display : none'> "+art.contenu+" </p> <br /> </div>")
    	if (idZE == "test0") {  var target = $("<div id="+art.idAr+" class='draggable artefact dropped-msg left'>  <h1> "+art.titre+" </h1> <p style ='display : none'> "+art.contenu+" </p> </div>")
}
  
    	else if (idZE == "test1") {  var target = $("<div id="+art.idAr+" class='draggable artefact dropped-msg right'>  <h1> "+art.titre+" </h1> <p style ='display : none'> "+art.contenu+" </p> </div>")
}
  
    	else if ((idZE == "test2") || (idZE =="test3") || (idZE == "test4")) {  var target = $("<div id="+art.idAr+" class='draggable artefact dropped-msg top'>  <h1> "+art.titre+" </h1> <p style ='display : none'> "+art.contenu+" </p> </div>")
 }
    	else {  var target = $("<div id="+art.idAr+" class='draggable artefact dropped-msg '>  <h1> "+art.titre+" </h1> <p style ='display : none'> "+art.contenu+" </p> </div>")
}
    		}

   		 target.appendTo("#"+idZE+""); 

    	})
////////////////////////////////////////////////////////////////////////////////////////////////////
socket.on('EVT_NewArtefactInZP', function (pseudo,idZP,chaineJSON)
		{
		
	art=JSON.parse(chaineJSON)

   if (art.typeArtefact == "image") {
    		console.log(art.contenu);
    		art.contenu=(art.contenu).replace(/(\r\n|\n|\r)/gm, ""); 
    		var target = $("<div id="+art.idAr+" class='draggable artefact img' style='left:50%; top:50%; position: relative; background-image: url(data:image/png;base64,"+art.contenu+")'> </div>");
   }
   else {

       		art.contenu=(art.contenu).replace(/(\r\n|\n|\r)/gm, "</br>"); 

	   var target = $("<div id="+art.idAr+" class='draggable artefact' style='left:50%; top:50%'>  <h1> "+art.titre+" </h1> <p> "+art.contenu+" </p> </div>")
   
	   
   }
		 target.appendTo("#ZP"); 
		 

	})
 
    

//////////////////////////////////////////////////////////////////////////////////////////////
socket.on('EVT_Deconnexion', function (pseudo, idZE) {
//alert("Deconnection")
//alert(idZE)
//$("#test0").fadeIn();
//if($("#"+idZE+"").find('div.artefact').length !=0) { alert("deconnexion interdit")} 
 $("#"+idZE+"").fadeOut() ; 

	//var cnt = $("#"+idZE+"").contents();
	//$("#"+idZE+"").replaceWith(cnt);
	/*
	var myarr=[];
	$(function() {
		$("#"+idZE+"").children("div").each (function ()
				
				{
			myarr[myarr.length]=$(this).attr('id')

$("<div id="+myarr[myarr.length]+" class='draggable artefact' style='left:50%; top:50%'>  <h1> "+art.titre+" </h1> <p> "+art.contenu+" </p> </div>").appendTo('#ZP');
//alert(myarr[0])
	});
		});
	
	*/
//	$("#"+idZE+"").replaceWith(function () { return $('.artefact', this); }) //suppression de la zone

	
	//var ID = $("#"+idZE+"").children("div").attr("id");
	//alert(ID)
		//var target = $("#"+idZE+"").children("div");

	 //var target = $("<div id="+art.idAr+" class='draggable artefact' style='left:50%; top:50%'>  <h1> "+art.titre+" </h1> <p> "+art.contenu+" </p> </div>")
	   
	
		// target.appendTo("#ZP"); 
})

//////////////////////////////////////////////////////////////////////////////////////////////
 socket.on ('EVT_ArtefactDeletedFromZE', function (idAr, idZE, idZEP)
		 {
	 //art=JSON.parse(chaineJSON)
	//alert(idAr+ " from " +idZE);
	 //var idAr= art.idAr;
	// $("#"+idAr+"").remove();
	$("#"+idZE+"").find("div[id="+idAr+"]").remove();

	//var target = ("#"+idAr+"");
	//$(target).remove();
	
		 })
		 
 ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////