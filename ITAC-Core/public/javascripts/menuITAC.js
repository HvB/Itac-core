
		var menuITAC = ["hand", "trash","pen" ];
		var contenuMenu = ["","",""];
		



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
	    //onmove: dragMoveListener,
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
			
	  		(event.currentTarget).classList.remove(menuITAC[i]); 
	  		if (menuITAC[i]=="ZP") (event.currentTarget).classList.toggle(contenuMenu[i]);
	  		if (i==(menuITAC.length-1)) {j=0;}
	  		else {j=i+1;}
	  		
	  		console.log("menu ITAC -> je charge j="+j+" et menu="+menuITAC[j]);		
	  		(event.currentTarget).classList.toggle(menuITAC[j]);	
	  		if (menuITAC[j]=="ZP") (event.currentTarget).classList.toggle(contenuMenu[j]);
	  			
	  				
	  		$(function () {		        		
		        		$("#menu").html(contenuMenu[j]);
		    });	  

	  	}
	} 	
})


interact('.zp').dropzone({
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
        draggableElement.find("h1").hide();
        draggableElement.find("p").hide();

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
        draggableElement.find("h1").hide();
        draggableElement.find("p").hide();

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


