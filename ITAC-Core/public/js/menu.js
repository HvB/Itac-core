interact('.menu').on('tap',function (event) { 
  var className = $(event.currentTarget).attr('class');

  if (className == "menu hand") {
      
      (event.currentTarget).classList.remove("hand"); 
      (event.currentTarget).classList.toggle("trash"); 

    }
    else if (className =="menu trash")
    {
      (event.currentTarget).classList.remove("trash"); 
      (event.currentTarget).classList.toggle("pen"); 
    }
    else if (className =="menu pen") {
      (event.currentTarget).classList.remove("pen"); 
      (event.currentTarget).classList.toggle("hand");

    }})

  
 interact('.trash').dropzone({
  //accepter que les elements avec ce CSS selector
  accept: '.artefact',
  // il faut 10% de l'element overlap pour que le drop soit possible
  overlap: 0.1,

  // les evenements de drop:

  
  ondragenter: function (event) {
    var draggableElement = event.relatedTarget,
        dropzoneElement = event.target;
    // feedback the possibility of a drop
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

//le menu est draggable
interact('.menu')
  .draggable({
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
  })  