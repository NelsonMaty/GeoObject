$ npm install 	//para instalar modulos de node dentro del proyecto.

crear archivo de config en /etc/nodejs-config/[nombre_de_proyecto] con formato json.
Ejemplo:
{
	"port" :8080,
	"pg"   :{
		"user"  :"user",
		"pass"  :"pass",
		"host"  :"localhost",
		"db"    :"my_db",
		"port"  :5432
		}
}

$ node index.js //para ejecutar el webservice

