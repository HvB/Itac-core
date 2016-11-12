/* 
 * tableau de parametres permettant de definir les liens vers les pages dynamique en fonction du type d'icone associé
 */
 var paramITAC = [];

 paramITAC['itacapp-collab'] = new Array('collab.png','collaboration.jpg','collab/config');
 paramITAC['itacapp-collab-config1'] = new Array('collab.png','collaboration.jpg','collab/preconfig/1');
 paramITAC['itacapp-vide'] = new Array('rond.png','vide.jpg','test.html');
 paramITAC['itacapp-check'] = new Array('rond.png','check.jpg','test.html');
 paramITAC['itacapp-calcul'] = new Array('rond.png','calcul.jpg','test.html');
 paramITAC['itacapp-meteo'] = new Array('rond.png','meteo.jpg','test.html');
 paramITAC['itacapp-param'] = new Array('rond.png','param.jpg','test.html');
 paramITAC['itacapp-domotique'] = new Array('rond.png','domotique.jpg','domotique');
 paramITAC['itacapp-quete'] = new Array('rond.png','quete.jpg','test.html');
 paramITAC['itacapp-morpix'] = new Array('morpion.png','morpix.jpg','morpion');
 
 
var paramZAITAC = [];
 
paramZAITAC['Table1'] = new Array(1680,1050,5,2,10,70); 
 

// nb de ZE à placer dans une hauteur et dans une largeur 
var NB_ZE_Largeur = 0;
var NB_ZE_Hauteur = 0;
var TailleZEenlargeur = 0;
var TailleZEenhauteur = 0;
var TailleEspaceenlargeur = 0;
var TailleEspaceenhauteur = 0;

function Calcule_Nb_ZE(nomZA, Nb_ZE) {
	
	 /* taille de l'ecran */ 
	var ZA_Largeur = paramZAITAC[nomZA][0]-paramZAITAC[nomZA][5]; // je retire la taille fixe des ZE
	var ZA_Hauteur = paramZAITAC[nomZA][1]-paramZAITAC[nomZA][5]; // je retire la taille fixe des ZE
	
	var Nb_ZE_Max_Largeur = paramZAITAC[nomZA][2];
	var Nb_ZE_Max_Hauteur = paramZAITAC[nomZA][3];
		
    // on calcul , pour la largeur, l'espace minimum entre deux ZE
	var Espace_Largeur_Total = ((ZA_Largeur * paramZAITAC[nomZA][4]) / 100);
	var Largeur_Dispo_Total = ZA_Largeur - Espace_Largeur_Total;
	
	var Espace_Hauteur_Total = ((ZA_Hauteur * paramZAITAC[nomZA][4]) / 100);
	var Hauteur_Dispo_Total = ZA_Hauteur - Espace_Hauteur_Total;
	
	var rapportLH = Math.round(ZA_Largeur / ZA_Hauteur);
	
	// R = nb ZE dans UNE largeur + une longueur
	
	var R = Nb_ZE / 2;
	
	NB_ZE_Hauteur = Math.round( R /(rapportLH+1));
	NB_ZE_Largeur = R - NB_ZE_Hauteur;
	
	//var Espace_Largeur_Min = ((ZA_Largeur) * (Nb_ZE_Max_Largeur+2) / 100);
	//var Espace_Hauteur_Min = ((ZA_Hauteur) * (Nb_ZE_Max_Hauteur+2) / 100);
	

	
	TailleZEenlargeur = Math.round(Largeur_Dispo_Total / NB_ZE_Largeur) ;
	TailleZEenhauteur = Math.round(Hauteur_Dispo_Total / NB_ZE_Largeur);
	
	TailleEspaceenlargeur = Math.round((ZA_Largeur -TailleZEenlargeur*NB_ZE_Largeur) / (NB_ZE_Largeur+1));
	TailleEspaceenhauteur  = Math.round((ZA_Hauteur -TailleZEenhauteur*NB_ZE_Largeur) / (NB_ZE_Hauteur+1));

	/*
	// dans ce cas tout tient dans la longueur	
	if (R < Nb_ZE_Max_Largeur) 
		{
			NB_ZE_Largeur = R;
			NB_ZE_Hauteur = Nb_ZE % 2;
			alert("NB_ZE_Largeur = " + NB_ZE_Largeur +" Nb_ZE_Max_Hauteur = " +Nb_ZE_Max_Hauteur+"");

		} 
		else {
			NB_ZE_Largeur = Nb_ZE_Max_Largeur;
			Nb_ZE_Max_Hauteur = (R - Nb_ZE_Max_Largeur) + (Nb_ZE % 2);
			   alert("NB_ZE_Largeur = " + NB_ZE_Largeur +" Nb_ZE_Max_Hauteur = " +Nb_ZE_Max_Hauteur+"");

		}
	 */
	}
 

function date(id) {
	
	//initLogo(); 
	
	var ladate=new Date();
	
	var tab_mois=new Array("Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre");
	var tab_jour=new Array("Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi");
	
	var h = ladate.getHours();
	var m = ladate.getMinutes();

    if(h<10) {h = "0"+h;}
    if(m<10) {m = "0"+m;}
       

     document.getElementById("date").innerHTML = tab_jour[ladate.getDay()] + " " + ladate.getDate() + " " + tab_mois[ladate.getMonth()] + " " + ladate.getFullYear();
     document.getElementById("heure").innerHTML = h + " : " + m;
     
     setTimeout('date("'+id+'");','1000');
     
     return true;
}




function imageMenu(paramITAC,param) {
	
	var fichier = "images/"+paramITAC[param][0];
	
	//document.getElementById(param).src= "images/"+ paramITAC[param][0];
	return fichier;

}

function initLogo() {

	/*document.getElementById("change").style.marginLeft="50px";
	document.getElementById("change").style.marginTop="20px";*/
	document.getElementById("change").style.backgroundImage =  "url('images/logoITAC.png')";

}

function changeImage(paramITAC,param) {

	document.getElementById("change").style.backgroundImage =  "url('images/"+ paramITAC[param][1]+"')";

}





