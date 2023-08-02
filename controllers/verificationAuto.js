const sgMail = require('@sendgrid/mail')
const jwt = require('jsonwebtoken');
const theSecretKey = process.env.JWT_SECRET;

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const { userVerified } = require('./userController')

/**
 * Executes send mail
 *
 * @param {*} req
 * @param {*} res
 */
const sendMail = async (req, res) => {
    if (req.body && req.body._id) {
        const fechaActual = new Date();
        // Sumar 2 horas a la fecha actual
        const dosHorasDespues = new Date(fechaActual.getTime() + 2 * 60 * 60 * 1000);
        const validationCode = jwt.sign({
            userId: req.body._id,
            expiration: dosHorasDespues
        }, theSecretKey);//req.body.email, 
        const msg = {
            to: req.body.email,// Change to your recipient
            from: 'utngerald@outlook.com', // Change to your verified sender
            subject: 'User verification',
            text: 'Click on the following link to verify your user on our site',
            html: `<strong>Click the button below to verify your user on our site:</strong><br><br>
            <a href="http://localhost:3030/verification/${validationCode}" style="display:inline-block; background-color:#007BFF; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;" target="_blank">Click to Verify</a>
        `}

        sgMail.send(msg)
            .then((response) => {
                res.send('Correo enviado con éxito');
                //console.log(response[0].statusCode)
                //console.log(response[0].headers)
            })
            .catch((error) => {
                console.error(error)
                res.send('Error al enviar el correo');
            })
    }
}

/**
 * Verified User
 *
 * @param {*} req
 * @param {*} res
 */
const verifiedUser = async (req, res) => {
    if (req.query && req.query.token) {
        try {
            jwt.verify(req.query.token, theSecretKey, (err, decodedToken) => {
                if (err || !decodedToken) {
                    // Error de autenticación - Token inválido o expirado
                    res.status(401);
                    res.json({
                        error: "Unauthorized: Invalid or expired token"
                    });
                } else {
                    const fechaHoraExpiration = new Date(decodedToken.expiration);
                    const fechaActual = new Date();
                    if (fechaHoraExpiration.getTime() >= fechaActual.getTime()) {
                        const isUserVerified = userVerified(decodedToken.userId);
                        if (isUserVerified) {
                            // Usuario verificado y token válido
                            res.status(200);
                            res.send({
                                message: "User is verified and token is valid"
                            });
                        } else {
                            // Token válido, pero usuario no verificado
                            res.status(403);
                            res.send({
                                error: "Forbidden: User is not verified"
                            });
                        }
                    } else {
                        // Token válido, pero ha expirado
                        res.status(401);
                        res.send({
                            error: "Unauthorized: Token has expired"
                        });
                    }
                }
            });
        } catch (e) {
            // Error desconocido al verificar el token
            res.status(500);
            res.send({
                error: "Internal Server Error: Unable to verify token"
            });
        }
    } else {
        // Falta el token en la solicitud
        res.status(400);
        res.json({ error: "Bad Request: Token is missing from the request" });
    }
}




module.exports = {
    sendMail,
    verifiedUser
}