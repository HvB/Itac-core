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