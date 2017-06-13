function viewMorpion(lgn, col, tt){
	document.getElementById('lgn'+lgn+'col'+col).innerHTML=tt[lgn][col];
	document.getElementById('joueur').innerHTML=t_symbole[tour];
	document.getElementById('scorecroix').innerHTML=t_score['croix'];
	document.getElementById('scorerond').innerHTML=t_score['rond'];
}

function viewMorpionVide(tt){
	for(var i=0;i<3;i++){
		for(var j=0;j<3;j++){
			document.getElementById('lgn'+i+'col'+j).innerHTML=tt[i][j];
		}
	}
}

function gui_gainInvisible(){
	document.getElementById("gain").style.display="none";
}

function gui_gainVisible(){
	document.getElementById("gain").style.display="block";
}