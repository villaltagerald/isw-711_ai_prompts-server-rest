require('dotenv').config();
const jwt = require('jsonwebtoken');

const express = require('express');
const app = express();
// database connection
const mongoose = require("mongoose");
const db = mongoose.connect(process.env.DB_CONNECTION_STRING, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true
});

const theSecretKey = process.env.JWT_SECRET;

const {
  userPatch,
  userPost,
  userGet,
  userDelete,
  userGetProfile,
  userConsult
} = require("./controllers/userController.js");

const {
  promptsPost,
  promptsGet,
  promptsPatch,
  promptsDelete
} = require("./controllers/promptsController.js");

const {
  createImage,
  createEdit,
  createCompletition } = require("./controllers/openAiController.js");

  const {
    sendMail,
    verifiedUser } = require("./controllers/verificationAuto.js");

// parser for the request body (required for the POST and PUT methods)
const bodyParser = require("body-parser");
// Middlewares
app.use(bodyParser.json());

// check for cors
const cors = require("cors");
app.use(cors({
  domains: '*',
  methods: "*"
}));
/*
// login token based
app.post("/api/session", async function (req, res, next) {
  if (req.body.username && req.body.password) {
    try {
      const user = await userConsult(req.body.username);
      if (req.body.username === user.email && req.body.password === user.password) {
        if (user.varified) {
          const session = saveSession(req.body.username);
          session.then(function (session) {
            console.log('session', session);
            if (!session) {
              res.status(422);
              res.json({
                error: 'There was an error saving the session'
              });
            }
            res.status(201).json({
              session
            });
          })
        } else {//
          res.status(422);
          res.json({
            error: 'At the verification request'
          });
        }
      } else {//
        res.status(422);
        res.json({
          error: 'Invalid username or password'
        });
      }
    } catch (error) {//
      res.status(422);
      res.json({
        error: 'Invalid username or password'
      });
      console.error(error); // Manejar cualquier error que ocurra durante la consulta
    }
  } else {
    res.status(422);
    res.json({
      error: 'Invalid username or password'
    });
  }

});

// Token based Auth
app.use(function (req, res, next) {
  if (req.headers["authorization"]) {
    const token = req.headers['authorization'].split(' ')[1];
    try {
      //validate if token exists in the database
      const session = getSession(token);
      session.then(function (session) {
        if (session) {
          // Obtener la fecha y hora actual
          const fechaActual = new Date();
          // Obtener la fecha de expiración
          const fechaExpiracion = new Date(session.expire);
          // Verificar si la fecha de expiración es mayor a la fecha actual
          if (fechaExpiracion.getTime() > fechaActual.getTime()) {
            next();
            return;
          } else {
            res.status(401);
            res.send({
              valid: false,
              error: "Unauthorized Expire",
            });
          }

        } else {
          res.status(401);
          res.send({
            valid: false,
            error: "Unauthorized",
          });
        }
      })
        .catch(function (err) {
          console.log('there was an error getting the session', err);
          res.status(422);
          res.send({
            error: "There was an error: " + e.message
          });
        });

    } catch (e) {
      res.status(422);
      res.send({
        error: "There was an error: " + e.message
      });
    }
  } else {
    res.status(401);
    res.send({
      valid: false,
      error: "Unauthorized",
    });
  }
});
*/

// login with JWT
app.post("/api/session", async function (req, res) {
  if (req.body.username && req.body.password) {
    try {
      const user = await userConsult(req.body.username);
      if (user && req.body.username === user.email && req.body.password === user.password) {
        if (user.varified) {
          //TODO: query the database to get the user info
          const data = {
            name: user.first_name + " " + user.last_name,
            permission: user.permission,
            token: jwt.sign({
              userId: user._id,
              username: user.email,
              name: user.first_name + " " + user.last_name,
              permission: user.permission
            }, theSecretKey)
          };

          res.status(201).json({
            data
          })
        } else {//
          res.status(422);
          res.json({
            error: 'At the verification request'
          });
        }
      } else {//
        res.status(422);
        res.json({
          error: 'Invalid username or password'
        });
      }
    } catch (error) {//
      res.status(422);
      res.json({
        error: 'Invalid username or password'
      });
      console.error(error); // Manejar cualquier error que ocurra durante la consulta
    }
  } else {
    res.status(422);
    res.json({
      error: 'Invalid username or password'
    });
  }
});

const getRequiredPermissions = (path, method) => {
  //console.log(path, method)
  // Define los permisos requeridos para diferentes rutas y métodos
  const permissions = {
    '/api/prompts': {
      GET: { permission: ['read'], idPermission: 'prompts' },
      POST: { permission: ['create'], idPermission: 'prompts' },
      PUT: { permission: ['edit'], idPermission: 'prompts' },
      PATCH: { permission: ['edit'], idPermission: 'prompts' },
      DELETE: { permission: ['delete'], idPermission: 'prompts' }
    },
    '/api/users': {
      GET: { permission: ['read'], idPermission: 'users' },
      PUT: { permission: ['edit'], idPermission: 'users' },
      DELETE: { permission: ['delete'], idPermission: 'users' }
    },
    // Otras rutas y permisos
  };

  // Verifica si la ruta y el método están definidos en los permisos
  if (permissions[path] && permissions[path][method]) {
    return [permissions[path][method]];
  }

  // Si no se encuentran permisos definidos, retorna un array vacío o un valor predeterminado según tus necesidades
  return [];

}

const hasSufficientPermissions = (userPermissions, requiredPermissions) => {
  //console.log(userPermissions, requiredPermissions);
  // Verifica si el usuario tiene los permisos requeridos

  // Si los permisos requeridos están vacíos, se considera que no se requieren permisos específicos y cualquier usuario puede acceder
  if (requiredPermissions.length === 0) {
    return true;
  }

  // Verifica si el usuario tiene al menos todos los permisos requeridos
  for (const requiredPermission of requiredPermissions) {
    let found = false;
    for (const userPermission of userPermissions) {
      if (userPermission.idPermission === requiredPermission.idPermission) {
        found = requiredPermission.permission.every(action =>
          userPermission.permission.includes(action)
        );
        if (found) {
          break;
        }
      }
    }
    if (!found) {
      return false;
    }
  }

  // El usuario tiene todos los permisos requeridos
  return true;
};
const pathPublic=["/api/users","/api/sendmail","/api/verifieduser/"];
// JWT Authentication middleware
app.use(function (req, res, next) {
  if (req.headers["authorization"]) {
    const authToken = req.headers['authorization'].split(' ')[1];
    try {
      jwt.verify(authToken, theSecretKey, (err, decodedToken) => {
        if (err || !decodedToken) {
          res.status(401);
          res.json({
            error: "Unauthorized 1"
          });
        }
        // Verificar los permisos requeridos para la función
        const requiredPermissions = getRequiredPermissions(req.path, req.method); // Función para obtener los permisos requeridos para la ruta y el método actual
        const userPermissions = decodedToken.permission;

        if (hasSufficientPermissions(userPermissions, requiredPermissions)) {
          console.log('Welcome', decodedToken.name);
          // El usuario tiene los permisos necesarios
          req.user = decodedToken;// Almacena el token decodificado en req.user
          next();
        } else {
          // El usuario no tiene los permisos necesarios
          res.status(401);
          res.send({
            error: "Unauthorized 2"
          });
        }
      });
    } catch (e) {
      res.status(401);
      res.send({
        error: "Unauthorized 3"
      });
    }
  } else if (req.method === 'POST' && pathPublic.includes(req.path)) {
    next();
  } else {
    res.status(401);
    res.send({
      error: "Unauthorized 4"
    });
  }
});



// listen to the task request
app.get("/api/users", userGet);
app.post("/api/users", userPost);
app.patch("/api/users", userPatch);
app.put("/api/users", userPatch);
app.delete("/api/users", userDelete);
//Edicion de Usuario
app.get("/api/usersprofile", userGetProfile);
//prompts
app.get("/api/prompts", promptsGet);
app.post("/api/prompts", promptsPost);
app.patch("/api/prompts", promptsPatch);
app.delete("/api/prompts", promptsDelete);
//verificationAuto
app.post("/api/sendmail", sendMail);
app.post("/api/verifieduser", verifiedUser);
// openAi
app.post("/api/openAiImage", createImage);
app.post("/api/openAiEdit", createEdit);
app.post("/api/openAiCompletition", createCompletition);

app.listen(3000, () => console.log(`Example app listening on port 3000!`))
