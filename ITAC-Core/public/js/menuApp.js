  /*********************************************************************************************/
  /* TC: Gestion du menu avec Interact.js  (tout cela devrait être délocalisé dans menuApp.js) */
  /*********************************************************************************************/

console.log('PAGE : workspace2.ejs -> préparation des méthodes pour rendre le menu draggable');

//   --------------------------   le menu est draggable   -----------------------------
interact('.menu')
  .draggable({
    inertia: true,
//l element reste dans sa zone limite , il peut pas sortir de son parent 
    restrict: {
     restriction: "parent",
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
    // activer autoScroll  ??? (TC : J'ai mis non pour voir l'effet)
    autoScroll: false,

//appeler cette fonction a chaque action de glissement 
    onmove: dragMoveListener,
//appeler cette fontion a chaque fin de l'action de glissement 
    onend: function (event) {
    
    }
  })  

//fonction de glissement toujours appeler lorsque on fait le drag and drop (TC : quel est le rapport avec drop?)
  function dragMoveListener (event) {
    //alert("Fonction dragMoveListener du: menu");
    var target = event.target,
        // stocker la position dans les attributs data-x/data-y
        x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
        y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    // translation de l'element
    target.style.webkitTransform =
    target.style.transform =
      'translate(' + x + 'px, ' + y + 'px)';

    // mise à jour de la position 
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
  }
 //  ---------------------------- Fin de la partie drag  ------------------------------

// ----------------------------- le menu est interactif  -------------------------------
// ------------------ on définit ce qu'il se passe lors d'une action tactile de type 'simple tap'  -------


// Le menu "hand" correspond à la manipulation simple et visualiser l'icône menu
// Le menu "trash" correspond à la poubelle: destruction d'un item (nb: vérifier ce qu'il se passe vraimment)
// Le menu "pen" correspond à l'annotation de document en épiglant des zones (nb: à réactiver et vérifier)
// Le menu "change" correspond au changement de fond d'écran comme document collaboratif (TC: à faire et tester)
// Le menu "print" correspond à la prise d'un screenshot de la page complète en png (TC: régler pour enlever les ZE et ajouter le fond)

var menu = ["hand", "trash", "pen", "change", "print"];
var classmenu = ["menu hand", "menu trash", "menu pen", "menu change", "menu print"];


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


// -------------------------- Appui long sur icône Print pour gérer la prise de screenshot -----------

  interact('.print').on('hold', function (event) {
    alert("Appui long pour lancer le screenshot!");
    // event.preventDefault();  (TC: test pour mieux différencier du simple tap mais non probant)

    // TC: pour plus tard : ajouter un son d'appareil photo
      //var soundfile="../sons/polaroid.wav" //ici le chemin du fichier son
      //$("<bgsound src="+soundfile+" id=soundeffect loop=1 autostart=true />").appendTo("#ZP");
    
    html2canvas(document.body, {
      onrendered: function(canvas) {

        // traitement à faire pour ajouter le fond...

        document.body.appendChild(canvas);
        canvas.id="screenshot";
        canvas.style="display: none"
        canvas.toBlob(function(blob) {
        saveAs(blob, "screenshot.png");}, "image/png");

        // on n'oublie pas de retirer l'élément canvas contenant le screenshot de la page
        document.body.removeChild(canvas);
      }
    })
   
  })  // fin hold pour print

 // ------------------- Gestion de la poubelle: drag and drop d'un artefact dessus --------------------- 
 interact('.trash').dropzone({
  //accepter que les elements avec ce CSS selector
  accept: '.artefact',
  // il faut 10% de l'element overlap pour que le drop soit possible
  overlap: 0.1,

              // --------------------------- Les événements de drop:  -----------------------------
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
 })  // fin interact .dropzone
// -------------------------- Fin Gestion de la function poubelle /trash du menu ----------------

// -------------------------- TC: fonction à faire pour changer le fond ----------------- 
/*  interact('.change').doubletap({
     document.getElementById("change").style.backgroundImage =  "url('images/logoITAC.png')";

  });
*/

// TC: fonction pour faire une copie d'écran
/*
   interact('.print').doubletap({

    html2canvas(document.body, {
      onrendered: function(canvas) {
        document.body.appendChild(canvas);
      }

  var canvas = document.getElementById("canvas");
  canvas.toBlob(function(blob) {
    saveAs(blob, "screenshot.png");}, "image/png");
  
  // autre solution  
  canvas.toBlob(function(blob) {
    var nouvelleImg = document.createElement("img"),
        url = URL.createObjectURL(blob);
    nouvelleImg.onload = function() {
      // Il n'est plus nécessaire de lire le blob, il est donc révoqué
      URL.revokeObjectURL(url);
    };
    nouvelleImg.src = url;
    //document.body.appendChild(nouvelleImg);


  });

    });
})    
*/