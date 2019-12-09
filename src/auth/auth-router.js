const express = require('express');
const authRouter = express.Router();
const jsonBodyParser = express.json();
const AuthService = require('./auth-service');


authRouter
    .post('/api/auth/login', jsonBodyParser, (req, res, next) => {
        const { user_name, password } = req.body;
        const loginUser = { user_name, password }; 
        console.log(req.body)
        for (const [key, value] of Object.entries(loginUser)) {
            if (value == null) {
                return res.status(400).json({ error: { message: `Missing ${key}` } })
            }
        }
        AuthService.getUserWithUserName(  
            req.app.get('db'),
            loginUser.user_name
        )
            .then(dbUser => {
                if (!dbUser) {
                    return res.status(400).json({ error: { message: 'Incorrect user_name or password' } })
                }
                return AuthService.comparePasswords(loginUser.password, dbUser.password)
                    .then(compareMatch => {
                        console.log(compareMatch, 'JJJJJJJJJJJJJ')
                        if (!compareMatch) {
                            return res.status(400).json({ error: { message: 'Incorrect user_name or password' } })
                        }
                        const subject = dbUser.user_name;
                        const payload = { user_id: dbUser.id}
                        console.log(subject)
                        return res.json({authToken: AuthService.createJwt(subject, payload)})
                    })
            })
            .catch(next)
    })

module.exports = authRouter;