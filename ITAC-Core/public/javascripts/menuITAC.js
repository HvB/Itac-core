
		var menuITAC = ["hand", "trash","pen" ];
		var contenuMenu = ["","",""];
		


		//fonction de glissement toujours appeler lorsque on fait le drag and drop
		function dragMoveListener (event) {
		  //alert("C'est l�?: 2");
		  var target = event.target,
		      // stocker la position dans les attributs data-x/data-y
		      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		  // translation de l'element
		  target.style.webkitTransform =
		  target.style.transform =
		    'translate(' + x + 'px, ' + y + 'px)';

		  // mis � jour de la position 
		  target.setAttribute('data-x', x);
		  target.setAttribute('data-y', y);
		}

		window.dragMoveListener = dragMoveListener;

		
/* ------------------------- 
 * le menu est draggable
 * -------------------------
 */
interact('.menu').draggable(
	{
	    inertia: true,
	    //l element reste dans sa zone limite , il peut pas sortir de son parent 
	    restrict: {
	    	restriction: "parent",
	    	endOnly: true,
	    	elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
	    },
	    // activer autoScroll
	    autoScroll: true,
	    //appeler cette fonction a chaque action de glissement 
	    onmove: dragMoveListener,
	    //appeler cette fontion a chaque fin de l'action de glissement 
	    onend: function (event) {
	    	// beeeeh : 
	    	console.log("on lance onend mais on ne sait pas pourquoi");
	    }
	}
);


/* --------------------------------- 
 * permet de switcher sur les menus
 * ---------------------------------
 */

interact('.menu').on('tap',function (event) { 
	
	console.log("menu ITAC -> top");
	// detection du menu toper
	var className = $(event.currentTarget).attr('class');
	var listeclassName = className.split(" ");
	var souslisteclassName= listeclassName[1].split("!");
	var j=0;
    //var classCSSCourante = $(event.currentTarget).classList;
	console.log("menu ITAC -> classname = "+className);
	console.log("menu ITAC -> classname = "+listeclassName);
	console.log("menu ITAC -> classname[1] = "+listeclassName[1]+" taille menu="+menuITAC.length);
	for(var i=0; i<menuITAC.length; i++) { 
		console.log("menu ITAC -> i courant="+i+" classmenu= "+menuITAC[i]);		
		if (listeclassName[1] == menuITAC[i]) {
			
			if (menuITAC[i]=="ZP") (event.currentTarget).classList.toggle(contenuMenu[i]);
	  		(event.currentTarget).classList.remove(menuITAC[i]); 
	  			  		
	  		if (i==(menuITAC.length-1)) {j=0;}
	  		else {j=i+1;}
	  		
	  		console.log("menu ITAC -> je charge j="+j+" et menu="+menuITAC[j]);	
	  		
	  		if (menuITAC[j]=="ZP") (event.currentTarget).classList.toggle(contenuMenu[j]);
	  		(event.currentTarget).classList.toggle(menuITAC[j]);	
		
	  		$(function () {		        		
		        		$("#menu").html(contenuMenu[j]);
		    });	  

	  	}
	} 	
})


interact('.ZP').dropzone({
  //accepter que les elements avec ce CSS selector
  accept: '.artefact',
  // il faut 10% de l'element overlap pour que le drop soit possible
  overlap: 0.1,

  // les evenements de drop:
  ondragenter: function (event) {
	  	var draggableElement = event.relatedTarget;   // l'objet ddeplacé
        var dropzoneElement = event.target;			  // le conteneur
        
        console.log("menu ITAC -> ondragenter , draggableElement="+draggableElement );
        //$(event.relatedTarget)
        // on masque l'élément
        
        $(event.relatedTarget).find("h1").hide();
        $(event.relatedTarget).find("p").hide();

        dropzoneElement.classList.add('trash-target');
        draggableElement.classList.add('can-delete');
  },
 
  ondragleave: function (event) {
    event.target.classList.remove('trash-target');
    event.relatedTarget.classList.remove('can-delete');
    $(event.relatedTarget).find("h1").show();
    $(event.relatedTarget).find("p").show();
  },
  
  ondrop: function (event) {
	 
	$(event.relatedTarget).fadeOut();
  },
  
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('trash-target');
  }
});
	
interact('.trash').dropzone({
  //accepter que les elements avec ce CSS selector
  accept: '.artefact',
  // il faut 10% de l'element overlap pour que le drop soit possible
  overlap: 0.1,

  // les evenements de drop:
  ondragenter: function (event) {
	  	var draggableElement = event.relatedTarget;   // l'objet ddeplacé
        var dropzoneElement = event.target;			  // le conteneur

        //$(event.relatedTarget)
        // on masque l'élément
        $(event.relatedTarget).find("h1").hide();
        $(event.relatedTarget).find("p").hide();

        dropzoneElement.classList.add('trash-target');
        draggableElement.classList.add('can-delete');
  },
 
  ondragleave: function (event) {
    event.target.classList.remove('trash-target');
    event.relatedTarget.classList.remove('can-delete');
    $(event.relatedTarget).find("h1").show();
    $(event.relatedTarget).find("p").show();
  },
  
  ondrop: function (event) {
	
	var idAr = $(event.relatedTarget).context.attributes[0].value;
	console.log("menu ITAC -> suppresion ART = "+idAr);
	socket.emit('EVT_ArtefactDeletedFromZP', idAr);
	$(event.relatedTarget).fadeOut();
  },
  
  ondropdeactivate: function (event) {
    // remove active dropzone feedback
    event.target.classList.remove('drop-active');
    event.target.classList.remove('trash-target');
  }
});


