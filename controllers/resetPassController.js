const sgMail = require('@sendgrid/mail')
const jwt = require('jsonwebtoken');
const theSecretKey = process.env.JWT_SECRET;

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const { newPassword } = require('./userController')

/**
 * Executes send mail
 *
 * @param {*} req
 * @param {*} res
 */
const resetMail = async (req, res) => {
    if (req.body && req.body.email) {
        const fechaActual = new Date();
        // Sumar 2 horas a la fecha actual
        const dosHorasDespues = new Date(fechaActual.getTime() + 2 * 60 * 60 * 1000);
        const validationCode = jwt.sign({
            email: req.body.email,
            expiration: dosHorasDespues
        }, theSecretKey);//req.body.email, 
        const msg = {
            to: req.body.email,// Change to your recipient
            from: 'utngerald@outlook.com', // Change to your verified sender
            subject: 'User verification',
            text: 'Haz clic en el siguiente enlace para restablecer tu contraseña en nuestro sitio',
            html: `<strong>Haz clic en el botón de abajo para restablecer tu contraseña en nuestro sitio:</strong><br><br> 
            <a href="http://localhost:3030/reset-password/${validationCode}" style="display:inline-block; 
            background-color:#007BFF; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;" 
            target="_blank">Haz clic para restablecer</a>`
        }

        sgMail.send(msg)
            .then((response) => {
                res.status(200);
                res.send({
                    message: "Email sent successfully"
                });
                //res.send('Correo enviado con éxito');
                //console.log(response[0].statusCode)
                //console.log(response[0].headers)
            })
            .catch((error) => {
                console.error(error)
                res.send('Error al enviar el correo');
            })
    } else {
        // Falta el token en la solicitud
        res.status(400);
        res.json({ error: "Incorrect application: Missing mail in the application" });
    }
}

/**
 * Reset Password
 *
 * @param {*} req
 * @param {*} res
 */
const resetPassword = async (req, res) => {
    if (req.query && req.query.token) {
        try {
            jwt.verify(req.query.token, theSecretKey, async (err, decodedToken) => {
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
                        try {
                            const isNewPass= await newPassword(decodedToken.email, req.body.password);
                            if (isNewPass) {
                                // Usuario verificado y token válido
                                res.status(200);
                                res.send({
                                    message: "Password changed successfully"
                                });
                            } else {
                                // Token válido, pero usuario no verificado
                                res.status(403);
                                res.send({
                                    error: isNewPass
                                });
                            }
                        } catch (error) {
                            // Captura y maneja el error de newPassword
                            console.log('Error while changing password:', error.message);
                            res.status(403);
                            res.send({ error: error.message });
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
    resetMail,
    resetPassword
}