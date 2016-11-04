module.exports = function( ) {

	var express = require( "express" )
		, util = require ("util")
		, router = express.Router({ mergeParams : true }) ;



	// route middleware to validate :name
	router.param('idZC', function(req, res, next, idZC) {
	    // do validation on name here
	    // blah blah validation
	    // log something so we know its working
	    console.log('doing name validations on ' + idZC);

	    // once validation is done save the new item in the req
	    req.idZC = idZC;
	    // go to the next thing
	    next(); 
	});

/*
	router.route( '/collab/:idZC/espacetravail/:idZP' )
*/	
	router.route( '/' )
	    .get( function(req, res,next) {
	  	 
  	  
	    	var idZC= req.params.idZC ;
	    	var idZP= req.params.idZP ;
	    	var port= req.params.port ;
	    	var rang= req.params.rang ;
	    	var minmax= req.params.minmax ;
	    	
	    	var host = req.headers.host;
	    	var splithost=host.split(":");
	    	
	    	var url="http://"+splithost[0]+":"+port;
	    	
	    	var splitminmax = minmax.split("-");
	    	var min=splitminmax[0];
	    	var max=splitminmax[1];
	    	
	    	console.log('CLIENT workspace.js -> routage GET : reception de  idZC= '+idZC +' idZP= '+idZP+' port= '+port + 'rang= '+rang+' --- host= '+host );	
	    	console.log('CLIENT workspace.js -> routage GET : calcul de l url = '+url );	
	
	    	res.render('workspace', { title: 'Itac_ZC_app' , urldemande:url, myZP:idZP, rangZP:rang , NbZEMin:min , NbZEMax:max  });
	  	} );
	
	/*
	router.get('/hello/:name', function(req, res) {
	    res.send('hello ' + req.name + '!');
	});
 */

return router;
};


