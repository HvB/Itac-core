
module.exports = function( ) {
	var express = require( "express" )

	, util = require ("util")
	  , router = express.Router({ mergeParams : true }) ;
//	  , collab = require('../itacapp-collab');


	
	var ZoneCollaborative = require('../ZoneCollaborative');
	var Artifact = require('../Artifact');
	var ZonePartage = require ('../ZonePartage');
	var ZoneEchange = require ('../ZoneEchange');
	var Session = require ('../Session');
	

	
	router.route( '/' )
	    .get( function(req, res,next) {
	  	 
	    	
	    	var name= req.params.name ;
	    	console.log('CLIENT session.js -> routage GET , session_name = '+name);	    	
	    	
	    	if (name) {
		    	console.log('CLIENT session.js -> routage GET,  lancement creation de la session \n');
	    		var session = Session.loadSession(name);
		    	
		    	console.log('CLIENT session.js -> routage GET,  lancement recureation de la ZC \n');
		    	var ZC=session.ZC;    	  
	    	}
	
	
	  	  	res.render('collab', { title: 'Express', ipserver:'http://localhost:8080', zonecollab : session.context.zc.config });
	  	} );
	
	


return router;
};


