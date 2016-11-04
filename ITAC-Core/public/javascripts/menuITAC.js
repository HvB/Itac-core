
var menu = ["hand", "trash"];
var classmenu = ["menu hand","menu trash"];

//initMesZP(menu, classmenu)

/* permet de switch sur les menus */
interact('.menu').on('tap',function (event) { 
	
	var className = $(event.currentTarget).attr('class');

	for(var i=0; i<menu.length; i++) { 
				
		if (className == classmenu[i]) {
	  		
	  		(event.currentTarget).classList.remove(menu[i]); 
	  		if (i==menu.length-1) (event.currentTarget).classList.toggle(menu[0])
	  		else (event.currentTarget).classList.toggle(menu[i+1])

	  	}
	} 	
})


/* le menu est draggable*/
interact('.menu').draggable({
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
    alert("on lance onend mais on ne sait pas pourquoi");
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


