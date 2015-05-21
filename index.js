var restify = require('restify');
var pg      = require('pg.js');
var fs      = require('fs');

var server = restify.createServer();

//reading config file
var config = JSON.parse(fs.readFileSync('/etc/nodejs-config/GeoObject_properties.json'));

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
      //querying database
      var sql = 'SELECT id, code, name, description, comment FROM geo_object.continent WHERE erased=false';
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
                     continents: {
                        rel : 'self',
                        href: 'http://localhost:' + config.port + "/continents/" + data.code,
                        type: 'application/json'
                     }
                  }
               };
               responseArray.push(dto);
            }
         );
         done(); //release the pg client back to the pool 
         res.json(responseArray);
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
                  continents: {
                     rel : 'self',
                     href: 'http://localhost:' + config.port + "/continents/" + result.rows[0].code,
                     type: 'application/json'
                  }
               }
            };
            res.json(dto);
         }
         done(); //release the pg client back to the pool 
      });
   });
});

server.listen(config.port);
console.log("GeoObject Listening on port " + config.port);