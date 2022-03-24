const express = require('express');
const app = express();
const { v4 } = require('uuid');
const moment = require('moment');
const axios = require('axios');
const fs = require('fs');
const _ = require('lodash');
const chalk = require('chalk');

app.listen(3000, () => console.log("Servidor express activo http://localhost:3000"));

let rutaArchivo = `${__dirname}/files/usuarios.json`;

//El registro de los usuarios debe hacerse con la API Random User usando axios para consultar la data.

app.get('/registrar', (req, res) => {
    axios.get('https://randomuser.me/api/').then((respuesta) => {
        let codigo = v4();

        let usuario = {
            nombre : respuesta.data.results[0].name.first,
            apellido : respuesta.data.results[0].name.last,
            sexo : respuesta.data.results[0].gender,
            id  : codigo.slice(0,8), //Cada usuario registrado debe tener un campo id único generado por el paquete UUID.
            timestamp : moment().format('YYYY-MM-DD HH:mm:ss') //Cada usuario debe tener un campo timestamp almacenando la fecha de registro obtenida y formateada por el paquete Moment.
        }

        fs.readFile(rutaArchivo, "utf8", (error, contenido) => {
            contenido = JSON.parse(contenido);
            contenido.push(usuario);
            contenido = JSON.stringify(contenido, null, 4);

            fs.writeFile(rutaArchivo, contenido, 'utf8', (error) => {
                //Por cada consulta realizada al servidor, se debe devolverle al cliente una lista con los datos de todos los usuarios registrados 
                //usando Lodash para dividir el arreglo en 2 separando los usuarios por sexo
                var personas = JSON.parse(contenido);
                
                let mujeres = _.filter(personas, (item) => {
                    return item.sexo === 'female'
                });
                let hombres = _.filter(personas, (item) => {
                    return item.sexo === 'male'
                });

                let data = `El usuario ${usuario.nombre} ${usuario.apellido} ha sido registrado con éxito<br><br>`
                
                data += "Mujeres<br>"
                mujeres.forEach((mujer, index) => {
                    data += `${index+1}. Nombre: ${mujer.nombre} - Apellido: ${mujer.apellido} - ID: ${mujer.id} - Timestamp: ${mujer.timestamp}<br>`
                })

                data += "<br>Hombres<br>"
                hombres.forEach((hombre, index) => {
                    data += `${index+1}. Nombre: ${hombre.nombre} - Apellido: ${hombre.apellido} - ID: ${hombre.id} - Timestamp: ${hombre.timestamp}<<br>`
                })

                error ? res.send("Ha ocurrido un error") : res.send(data);
                //En cada consulta también se debe imprimir por la consola del servidor la misma lista de usuarios pero con fondo blanco 
                //y color de texto azul usando el paquete Chalk.
                console.log(chalk.blue.bgWhite(contenido));
            })
        })
    })
});