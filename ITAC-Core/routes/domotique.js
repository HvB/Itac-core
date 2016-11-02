module.exports = function( ) {
	

	var express = require( "express")
	  , router = express.Router() ;


	// routage des requetes 
	router.route( '/' )

	.get( function(req, res,next) {
	
		res.render('domotique', { title: 'ITAC' });
	});

return router;
};