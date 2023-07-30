const crypto = require('crypto');
const Session = require("../models/sessionModel");

const saveSession = async function (username) {
  const token = crypto.createHash('md5').update(username + new Date()).digest("hex");
  // insert token to the session table
  const session = new Session();
  session.token = token;
  session.user = username;
  const fechaActual = new Date();
  console.log(new Date());
  session.expire = fechaActual.setHours(fechaActual.getHours() + 1);//sumar una hora a la hora del login
  return session.save();
};

const getSession = function (token) {
  return Session.findOne({ token });
};

module.exports = {
  saveSession,
  getSession
}