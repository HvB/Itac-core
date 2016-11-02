function ctrl_morpion(lgn, col, tt){
	if(document.getElementById("lgn"+lgn+"col"+col).className!="clique"){
		remplitMorpion(lgn, col, tt);
		clique(lgn,col);
		changerTour();
		viewMorpion(lgn, col, tt);
		
		if(verifierAlignH(lgn,tt)){
			vider(tt);
			viewMorpion(lgn, col, tt);
			viewMorpionVide(tt);
			vireclasse();
			window.setTimeout("gui_gainInvisible()",2000);
			window.setTimeout("viderGain()",2000);
			window.setTimeout("gui_gainVisible()",2000);
		}
		
		if(verifierAlignV(col,tt)){
			vider(tt);
			viewMorpion(lgn, col, tt);
			viewMorpionVide(tt);
			vireclasse();
			window.setTimeout("gui_gainInvisible()",2000);
			window.setTimeout("viderGain()",2000);
			window.setTimeout("gui_gainVisible()",2000);
		}
		
		if(verifierAlignD(tt)){
			vider(tt);
			viewMorpion(lgn, col, tt);
			viewMorpionVide(tt);
			vireclasse();
			window.setTimeout("gui_gainInvisible()",2000);
			window.setTimeout("viderGain()",2000);
			window.setTimeout("gui_gainVisible()",2000);
		}
		
		if(morpionVide(tt)){
			vider(tt);
			viewMorpionVide(tt);
			vireclasse();
		}
	}
}