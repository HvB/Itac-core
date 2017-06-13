var rond='<img src="img/rond.png" width="75%" />';
var croix='<img src="img/croix.png" width="75%" />';
var vide='<img src="img/vide.png"/>';
var tour = 0;
var t_symbole= new Array(2);
t_symbole[0]=rond;
t_symbole[1]=croix;
var t_score=new Array();
t_score['rond']=0;
t_score['croix']=0;
var verif;

var tt_morpion=new Array(3);
	for(var i=0;i<3;i++){
		tt_morpion[i]=new Array(3);
		for(var j=0;j<3;j++){
			tt_morpion[i][j]=vide;
		}
	}


function remplitMorpion(lgn, col, tt){
	tt[lgn][col]=t_symbole[tour];
}

function changerTour(){
	if(tour==0){
		tour=1;
	}else{
		tour=0;
	}
}

function verifierAlignH(lgn,tt){
	if(tt[lgn][0]==croix){
		if(tt[lgn][0]==tt[lgn][1]&&tt[lgn][1]==tt[lgn][2]){
		t_score['croix']=t_score['croix']+1;
		document.getElementById("gain").innerHTML='Croix a gagné !';
		return true;
		}
	}
	
	if(tt[lgn][0]==rond){
		if(tt[lgn][0]==tt[lgn][1]&&tt[lgn][1]==tt[lgn][2]){
		t_score['rond']=t_score['rond']+1;
		document.getElementById("gain").innerHTML='Rond a gagné !';
		return true;
		}
	}
}
function verifierAlignV(col,tt){
	if(tt[0][col]==croix){
		if(tt[0][col]==tt[1][col]&&tt[1][col]==tt[2][col]){
			t_score['croix']=t_score['croix']+1;
			document.getElementById("gain").innerHTML='Croix a gagné !';
			return true;
		}
	}
	
	if(tt[0][col]==rond){
		if(tt[0][col]==tt[1][col]&&tt[1][col]==tt[2][col]){
			t_score['rond']=t_score['rond']+1;
			document.getElementById("gain").innerHTML='Rond a gagné !';
			return true;
		}
	}
}

function verifierAlignD(tt){
	if(tt[0][0]==rond){
		if(tt[0][0]==tt[1][1]&&tt[1][1]==tt[2][2]){
			t_score['rond']=t_score['rond']+1;
			document.getElementById("gain").innerHTML='Rond a gagné !';
			return true;
			
		}
	}
	
	if(tt[0][0]==croix){
		if(tt[0][0]==tt[1][1]&&tt[1][1]==tt[2][2]){
			t_score['croix']=t_score['croix']+1;
			document.getElementById("gain").innerHTML='Croix a gagné !';
			return true;
		}
	}
	
	if(tt[0][2]==croix){
		if(tt[0][2]==tt[1][1]&&tt[1][1]==tt[2][0]){
			t_score['croix']=t_score['croix']+1;
			document.getElementById("gain").innerHTML='Croix a gagné !';
			return true;
		}
	}
	if(tt[0][2]==rond){
		if(tt[0][2]==tt[1][1]&&tt[1][1]==tt[2][0]){
			t_score['rond']=t_score['rond']+1;
			document.getElementById("gain").innerHTML='Rond a gagné !';
			return true;
		}
	}
}

function vider(tt){
	for(var i=0;i<3;i++){
		for(var j=0;j<3;j++){
			tt[i][j]=vide;
		}
	}
}

function morpionVide(tt){
var test = 0;
	for(var i=0;i<3;i++){
		for(var j=0;j<3;j++){
			if(tt[i][j]!=vide){
				test = test +1;
			}
		}
	}
	
	if(test==9){
		return true;
	}else{
		return false;
	}
}

function clique(lgn,col){
	document.getElementById("lgn"+lgn+"col"+col).className="clique";
}

function vireclasse(){
	document.getElementById("lgn0col0").className="";
	document.getElementById("lgn0col1").className="";
	document.getElementById("lgn0col2").className="";
	document.getElementById("lgn1col0").className="";
	document.getElementById("lgn1col1").className="";
	document.getElementById("lgn1col2").className="";
	document.getElementById("lgn2col0").className="";
	document.getElementById("lgn2col1").className="";
	document.getElementById("lgn2col2").className="";
}

function viderGain(){
	document.getElementById("gain").innerHTML=" ";
}
