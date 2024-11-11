const express = require("express")
const { exec } = require('child_process');
const { getUser } = require('./database');
const crypto = require('crypto');
//const comando = 'touch test.txt';
//const comando = 'echo "hola mundo" > test.txt';
//const comando = "ping -c 4 google.com"
const app = express();
const port = 3000

const realm = 'User Visible Realm';

// Middleware para autenticar usando Auth Basic HTTP
function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
  
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      // Si no hay cabecera de autorización o no es del tipo Basic, pedir credenciales
      res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
      return res.status(401).send('Autenticación requerida');
    }

 // Decodificar credenciales base64
 const base64Credentials = authHeader.split(' ')[1];
 const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
 const [username, password] = credentials.split(':');

 const user = getUser(username);
 const md5hash = crypto.createHash('md5').update(password).digest('hex');

 if (!user || user.password !== md5hash) {
   // Si el usuario no existe o la contraseña es incorrecta
   res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
   return res.status(401).send('Credenciales incorrectas');
 }

 // Si las credenciales son correctas, continuar con la siguiente función
 return next();
}


app.use(express.static("public"))

// Rutas protegidas por la autenticación Basic

app.get('/logout', (req, res) => {
    res.setHeader('WWW-Authenticate', `Basic realm="${realm}"`);
    res.status(401).send('Has sido deslogueado');
  });

app.get("/", (req,res) => {
    const comando = "figlet hola mundo"
    exec(comando, (error, stdout, stderr) => {
        res.send(`<pre>${stdout}</pre>`)
      });
})

app.get("/ping", (req, res) => {
    const dominio = req.query.dominio
    const comando = "ping -c 4 " + dominio
    exec(comando, (error, stdout, stderr) => {
        res.send(stdout)
    });
})

app.listen(port, () => {
    console.log(`Servidor funcionando en ${port}`)
})