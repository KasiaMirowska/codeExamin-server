const express = require('express')
const usersRouter = express.Router()
const jsonBodyParser = express.json()
const path = require('path');

usersRouter
    .post('/api/users', jsonBodyParser, (req, res, next) => {
        const { password, user_name, full_name, nickname } = req.body;

        for (const field of ['full_name', 'user_name', 'password']) {
            if (!req.body[field]) {
                return res.status(400).json({ error: { message: `Missing ${field} in request body` } })
            }
        }
        const passwordError = usersService.validatePassword(password)
        if (passwordError) {
            return res.status(400).json({ error: { message: passwordError } })
        }

        UsersService.hasUserWithUserName(
            req.app.get('db'),
            user_name
        )
            .then(takenUser => {
                if (takenUser) {
                    return res.status(400).json({ error: { message: 'Username taken' } })
                }

                return UsersService.hashPassword(password)
                    .then(hashedPassword => {
                        const newUser = {
                            user_name,
                            password: hashedPassword,
                            full_name,
                            nickname,
                            date_created: 'now()',
                        }
                        return UsersService.insertUser(
                            req.app.get('db'),
                            newUser
                        )
                            .then(user => {
                                res
                                    .status(201)
                                    .location(path.posix.join(req.originalUrl, `/${user.id}`))
                                    .json(UsersService.serializeUser(user))
                            })
                    })
            })
            .catch(next)
    })

module.exports = usersRouter;