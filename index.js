var restify = require('restify');
var pg      = require('pg.js');
var fs      = require('fs');

var server = restify.createServer();

// No 'Access-Control-Allow-Origin' header is present on the requested resource. 
// Origin 'http://localhost:9000' is therefore not allowed access. 
server.use(restify.CORS()); 
server.use(restify.fullResponse());

//reading config file
var config = JSON.parse(fs.readFileSync('/etc/nodejs-config/GeoObject.json'));

// connection string to GeoObject database
var conString = "postgres://" + 
               config.pg.user + ":" +
               config.pg.pass + "@" + 
               config.pg.host + "/" + 
               config.pg.db;

server.get(
   {path: '/continents', version:'1.0.0'}, 
   function(req,res){
      pg.connect(conString, function(err, client, done){
      //Return if an error occurs
      if(err) {
         //TODO respond with error code
         console.error('error fetching client from pool', err);
      }

      var sql_locale='SELECT DISTINCT locale FROM geo_object.continent ';
      var responseLocaleArray = [];

      client.query(sql_locale, function(err, result){

      	 //Return if an error occurs
         if(err) {
            console.error('error fetching client from pool', err);      
         }

         result.rows.forEach(
            function(data) {
               responseLocaleArray.push(data.locale);          
            }
         );

	    // Header
	    var locale = req.header('Accept-Language', 'es-AR');		//"es-AR" es el valor default en caso de ser null
		var languagesArray = locale.match(/[a-zA-z\-]{2,10}/g) || [];
        var resultDB = "";
		languagesArray.every(
			function(dataLang){
				responseLocaleArray.every(
					function(dataDB){
						if(dataLang.toUpperCase() == dataDB.toUpperCase()){
							resultDB = dataDB;
							return false;
						}
						return true;
					}
				);
				if(resultDB == "")
					return false;
				else return true;
			}
		); 
		
		console.log(resultDB);
		console.log(locale);

		if(resultDB == "") resultDB = "es-AR";

	var sql = 'SELECT id, code, name, description, comment FROM geo_object.continent WHERE erased=false AND locale ilike ';
	sql += "'" + resultDB + "'";
	sql += " ORDER BY name";


	      var responseArray = [];
	      client.query(sql, function(err, result) {
	         //Return if an error occurs
	         if(err) {
	            console.error('error fetching client from pool', err);      
	         }
	         // Storing result in an array
	         result.rows.forEach(
	            function(data) {
	               var dto = {
	                  id: data.id,
	                  code: data.code,
	                  name: data.name,
	                  description: data.description,
	                  comment: data.comment,
	                  _links: {
	                     continent: {
	                        href: 'http://'+config.host+':'+ config.port + "/continents/" + data.code,
	                        type: 'application/json'
	                     }
	                  }
	               };
	               responseArray.push(dto);
	            }
	         );
	         done(); //release the pg client back to the pool 
	         var model = {
	            "org.geoobject.model.Continent": responseArray
	         };
	         res.json(model);
	      });

      });
   });
});

server.get(
   {path: '/continents/:code', version:'1.0.0'}, 
   function(req,res){
      pg.connect(conString, function(err, client, done){
      //Return if an error occurs
      if(err) {
         //TODO respond with error code
         console.error('error fetching client from pool', err);
      }
      //querying database
      var sql = 'SELECT id, code, name, description, comment FROM geo_object.continent WHERE erased=false AND code ilike ';
      sql += "'" + req.params.code + "'";
      sql += " ORDER BY name";

      console.log(sql);
      client.query(sql, function(err, result) {
         //Return if an error occurs
         if(err) {
            console.error('error fetching client from pool', err);      
         }
          if(!result.rows[0]) 
            res.send(404);
         else{
            var dto = {
               id: result.rows[0].id,
               code: result.rows[0].code,
               name: result.rows[0].name,
               description: result.rows[0].description,
               comment: result.rows[0].comment,
               _links: {
                  continent: {
                     rel : 'self',
                     href: 'http://'+config.host+':' + config.port + "/continents/" + result.rows[0].code,
                     type: 'application/json'
                  }
               }
            };
            var model = {
               "org.geoobject.model.Continent" : dto
            }
            res.json(model);
         }
         done(); //release the pg client back to the pool 
      });
   });
});


/*** Paises ***/
server.get(
   {path: '/countries', version:'1.0.0'}, 
   function(req,res){
      pg.connect(conString, function(err, client, done){
      //Return if an error occurs
      if(err) {
         //TODO respond with error code
         console.error('error fetching client from pool', err);
      }
      //querying database
      var sql = 'SELECT id, code_iso_alfa2, code_iso_alfa3, code_iso_num, name_iso, common_name, comment, citizenship, entity, entity_code_iso_alfa2 FROM geo_object.country WHERE erased=false';
      sql += " ORDER BY common_name";
      var responseArray = [];
      client.query(sql, function(err, result) {
         //Return if an error occurs
         if(err) {
            console.error('error fetching client from pool', err);      
         }
         // Storing result in an array
         result.rows.forEach(
            function(data) {
               var dto = {
                  id: data.id,
                  code_iso_alfa2: data.code_iso_alfa2,
                  code_iso_alfa3: data.code_iso_alfa3,
                  code_iso_num: data.code_iso_num,
                  name_iso: data.name_iso,
                  common_name: data.common_name,
                  comment: data.comment,
                  citizenship: data.citizenship,
                  entity: data.entity,
                  entity_code_iso_alfa2: data.entity_code_iso_alfa2,
                  _links: {
                     country: {
                        href: 'http://'+config.host+':'+ config.port + "/countries/" + data.code_iso_alfa3,
                        type: 'application/json'
                     }
                  }
               };
               responseArray.push(dto);
            }
         );
         done(); //release the pg client back to the pool 
         var model = {
            "org.geoobject.model.Country": responseArray
         };
         res.json(model);
      });
   });
});



server.get(
   {path: '/countries/:code_iso_alfa3', version:'1.0.0'}, 
   function(req,res){
      pg.connect(conString, function(err, client, done){
      //Return if an error occurs
      if(err) {
         //TODO respond with error code
         console.error('error fetching client from pool', err);
      }
      //querying database
      var sql = 'SELECT id, code_iso_alfa2, code_iso_alfa3, code_iso_num, name_iso, common_name, comment, citizenship, entity, entity_code_iso_alfa2 FROM geo_object.country WHERE erased=false AND code_iso_alfa3 ilike ';
      sql += "'" + req.params.code_iso_alfa3 + "'";
      sql += " ORDER BY common_name";
      console.log(sql);
      client.query(sql, function(err, result) {
         //Return if an error occurs
         if(err) {
            console.error('error fetching client from pool', err);      
         }
          if(!result.rows[0]) 
            res.send(404);
         else{
            var dto = {
            	id: result.rows[0].id,
               	code_iso_alfa2: result.rows[0].code_iso_alfa2,
               	code_iso_alfa3: result.rows[0].code_iso_alfa3,
               	code_iso_num: result.rows[0].code_iso_num,
               	name_iso: result.rows[0].name_iso,
               	common_name: result.rows[0].common_name,
               	comment: result.rows[0].comment,
               	citizenship: result.rows[0].citizenship,
               	entity: result.rows[0].entity,
               	entity_code_iso_alfa2: result.rows[0].entity_code_iso_alfa2,
               	_links: {
                	country: {
                    rel : 'self',
                    href: 'http://'+config.host+':' + config.port + "/countries/" + result.rows[0].code_iso_alfa3,
                    type: 'application/json'
                  }
               }
            };
            var model = {
               "org.geoobject.model.Country" : dto
            }
            res.json(model);
         }
         done(); //release the pg client back to the pool 
      });
   });
});



server.get(
   {path: '/continents/:code/countries', version:'1.0.0'}, 
   function(req,res){
      pg.connect(conString, function(err, client, done){
      //Return if an error occurs
      if(err) {
         //TODO respond with error code
         console.error('error fetching client from pool', err);
      }
      //querying database
      var sql = 'SELECT country.id, country.code_iso_alfa2, country.code_iso_alfa3, country.code_iso_num, country.name_iso, country.common_name, country.comment, country.citizenship, country.entity, country.entity_code_iso_alfa2 FROM geo_object.country country LEFT JOIN geo_object.continent continent ON country.continent_id = continent.id WHERE country.erased=false AND continent.code ilike ';
   		sql += "'" + req.params.code + "'";
   		sql += " ORDER BY common_name";
      var responseArray = [];
      client.query(sql, function(err, result) {
         //Return if an error occurs
         if(err) {
            console.error('error fetching client from pool', err);      
         }
         // Storing result in an array
         result.rows.forEach(
            function(data) {
               var dto = {
                  id: data.id,
                  code_iso_alfa2: data.code_iso_alfa2,
                  code_iso_alfa3: data.code_iso_alfa3,
                  code_iso_num: data.code_iso_num,
                  name_iso: data.name_iso,
                  common_name: data.common_name,
                  comment: data.comment,
                  citizenship: data.citizenship,
                  entity: data.entity,
                  entity_code_iso_alfa2: data.entity_code_iso_alfa2,
                  name: data.name,
                  _links: {
                     continent: {
                     	href: 'http://'+config.host+':' + config.port + "/continents/" + req.params.code,
                        type: 'application/json'
                     },
                     country: {
                        href: 'http://'+config.host+':' + config.port + "/countries/" + data.code_iso_alfa3,
                        type: 'application/json'
                     }
                  }
               };
               responseArray.push(dto);
            }
         );
         done(); //release the pg client back to the pool 
         var model = {
            "org.geoobject.model.Country": responseArray
         };
         res.json(model);
      });
   });
});


server.listen(config.port);
console.log("GeoObject Listening on port " + config.port);