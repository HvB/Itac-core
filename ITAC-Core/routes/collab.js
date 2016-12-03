
module.exports = function( ) {
	var express = require( "express" )

	, util = require ("util")
	  , router = express.Router({ mergeParams : true }) ;
//	  , collab = require('../itacapp-collab');


	
	var ZoneCollaborative = require('../ZoneCollaborative');
	var Artifact = require('../Artifact');
	var ZonePartage = require ('../ZonePartage');
	var ZoneEchange = require ('../ZoneEchange');
	

	
	router.route( '/' )
	    .get( function(req, res,next) {
	  	 
	    	
	    	var numconfig= req.params.numconfig ;
	    	    	
	    	
	    	var host = req.headers.host;
			var splithost=host.split(":");    	
	    	var url='http://'+splithost[0];
	    	
	    	console.log('CLIENT configcollab.js -> routage GET , preconfig = '+numconfig +' avec URL='+url);	
	    	
	    	if (numconfig==1) {
	    		
	    		var paramZC={
	    			"idZC": "444",
	    			"emailZC":"",
	    			"descriptionZC":"Zone de travail pré-configurer",
	    			"nbZP": "2",
	    			"ZP": [
	    				{
	    				"idZP":"Table",
	    				"typeZP":"TableTactile",
	    				"nbZEmin":"2",
	    				"nbZEmax":"4",
	    				"urlWebSocket":url,
	    				"portWebSocket":"8080"
	    				},
	    				{
	    				"idZP":"test2",
	    				"typeZP":"Ecran",
	    				"nbZEmin":"1",
	    				"nbZEmax":"6",
	    				"urlWebSocket":url,
	    				"portWebSocket":"8081"
	    				}
	    			]
	    			}; 
	    	}
	    	
	    	console.log('CLIENT configcollab.js -> routage GET,  lancement creation de la ZC \n');
	    	var ZC=new ZoneCollaborative(paramZC);    	  
	
	
	  	  	res.render('collab', { title: 'Express', ipserver:url, zonecollab : paramZC });
	  	} );
	
	


return router;
};


