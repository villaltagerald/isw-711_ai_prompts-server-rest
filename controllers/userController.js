const User = require("../models/userModel");

/**
 * Creates a user
 *
 * @param {*} req
 * @param {*} res
 */
const userPost = async (req, res) => {
  let user = new User();
  user.first_name = req.body.first_name;
  user.last_name  = req.body.last_name;
  user.password = req.body.password;
  user.email = req.body.email;
  user.varified = req.body.varified;
  //user.permission=req.body.permission;

  if (user.first_name && user.last_name) {
    await user.save()
      .then(data => {
        res.status(201); // CREATED
        res.header({
          'location': `/api/user/?id=${data.id}`
        });
        res.json(data);
      })
      .catch( err => {
        res.status(422);
        console.log('error while saving the user', err);
        res.json({
          error: 'There was an error saving the user'
        });
      });
  } else {
    res.status(422);
    console.log('error while saving the user')
    res.json({
      error: 'No valid data provided for user'
    });
  }
};

/**
 * Get all user
 *
 * @param {*} req
 * @param {*} res
 */
const userGet = (req, res) => {
  // if an specific user is required
  if (req.query && req.query.id) {
    User.findById(req.query.id)
      .then( (user) => {
        user.password ="";
        res.json(user);
      })
      .catch(err => {
        res.status(404);
        console.log('error while queryting the user', err)
        res.json({ error: "User doesnt exist" })
      });
  } else {
    // get all user
    let userId = req.user.userId;
    User.find({ _id: { $ne: userId } })
      .then( user => {
        res.json(user);
      })
      .catch(err => {
        res.status(422);
        res.json({ "error": err });
      });
  }
};

/**
 * Updates a user
 *
 * @param {*} req
 * @param {*} res
 */
const userPatch = (req, res) => {
  // get user by id
  if (req.query && req.query.id) {
    User.findById(req.query.id, function (err, user) {
      if (err) {
        res.status(404);
        console.log('error while queryting the user', err)
        res.json({ error: "User doesnt exist" })
      }
      //revisar nombre de usuario
      user.first_name = req.body.first_name?req.body.first_name:user.first_name;
      user.last_name  = req.body.last_name?req.body.last_name:user.last_name;
      user.password = req.body.password?req.body.password:user.password;
      user.email = req.body.email?req.body.email:user.email;
      user.varified = req.body.varified===user.varified?user.varified:req.body.varified;
      //user.permission = req.body.permission?req.body.permission:user.permission;

      user.save(function (err) {
        if (err) {
          res.status(422);
          console.log('error while saving the user', err)
          res.json({
            error: 'There was an error saving the user'
          });
        }
        res.status(200); // OK
        res.json(user);
      });
    });
  } else {
    res.status(404);
    res.json({ error: "User doesnt exist 2" })
  }
};

/**
 * Deletes a user
 *
 * @param {*} req
 * @param {*} res
 */
 const userDelete = (req, res) => {
  // get user by id
  if (req.query && req.query.id) {
    User.findById(req.query.id, function (err, user) {
      if (err) {
        res.status(404);
        console.log('error while queryting the user', err)
        res.json({ error: "User doesnt exist" })
      }

      user.deleteOne(function (err) {
        if (err) {
          res.status(422);
          console.log('error while deleting the user', err)
          res.json({
            error: 'There was an error deleting the user'
          });
        }
        res.status(204); //No content
        res.json({});
      });
    });
  } else {
    res.status(404);
    res.json({ error: "User doesnt exist" })
  }
};

const userConsult = (email) => {
  return User.findOne({ email })
    .then((user) => {
      if (user) {
        // Usuario encontrado, devolver la información en formato JSON
        return user;
      } else {
        // Usuario no encontrado, no devolver nada
        return null;
      }
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
};


module.exports = {
  userGet,
  userPost,
  userPatch,
  userDelete,
  userConsult
}