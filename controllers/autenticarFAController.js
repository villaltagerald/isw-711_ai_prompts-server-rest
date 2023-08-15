require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_NUMBER;
const client = require("twilio")(accountSid, authToken);
const { userConsult,userConsultId } = require("./userController");
const Code = require("../models/codeModel")
const jwt = require('jsonwebtoken');
const theSecretKey = process.env.JWT_SECRET;

// Generar un código aleatorio
const sendCodeVerify = async (email) => {
  if (email) {
    const user = await userConsult(email);
    const length = 6; // Longitud del código
    const characters = '0123456789'; // Caracteres permitidos
    let code = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters[randomIndex];
    }
    const fechaActual = new Date();
    // Sumar 2 horas a la fecha actual
    const dosHorasDespues = new Date(fechaActual.getTime() + 2 * 60 * 60 * 1000);
    const saveCode = new Code();
    saveCode.userid = user._id;
    saveCode.code = code;
    saveCode.date = dosHorasDespues;
    let response;
    client.messages
      .create({
        body: `Tu codigo Verificacion:${code}`,
        from: twilioNumber,
        to: `+506${user.phone}`,
      })
      .then(response = true).catch(response = false);
    await saveCode.save().then(response = true)
      .catch(response = false);
    return response;
  }
};

const verifyCode = (req, res) => {
  const code=req.body.code;
  Code.findOne({code})
    .then(async(code) => {
      if (code) {
        const fechaHoraExpiration = new Date(code.date);
        const fechaActual = new Date();
        
        if (code.userid === req.body.id && fechaHoraExpiration.getTime() >= fechaActual.getTime()) {
          const user=await userConsultId(req.body.id);
          console.log(user);
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
        }
        else{
          res.status(401);
          res.json({ error: "Code incorrect or code expiration" })
        }
      }
      else{
        res.status(404);
        res.json({ error: "Code dont found" })
      }
    })

}

module.exports = { sendCodeVerify,verifyCode }



