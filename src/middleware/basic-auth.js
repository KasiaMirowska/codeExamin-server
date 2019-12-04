const AuthService = require('../auth/auth-service');

function requireAuth(req, res, next) {
    const authToken = req.get('Authorization') || '';

    console.log(authToken)

    console.log(AuthService.parseBasicToken(authToken), '2222222222222222')
    console.log(Buffer.from(authToken, 'base64').toString())


    let basicToken;
    if (!authToken.toLowerCase().startsWith('basic')) {
        console.log(authToken, 'TESTING')
        return res.status(401).json({ error: { message: 'Missing basic token' } })
    } else {
        console.log(authToken, 'kKKKKKKKKKKKK')
        basicToken = authToken.slice('basic'.length, authToken.length)
        console.log(basicToken)
    }

    const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken)

    if (!tokenUserName || !tokenPassword) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }

    AuthService.getUserWithUserName(
        req.app.get('db'),
        tokenUserName
    )
        .then(user => {
            if (!user || user.password !== tokenPassword) {
                return res.status(401).json({ error: 'Unauthorized request' })
            }
            req.user = user;
            next()
        })
        .catch(next)
}

module.exports = { requireAuth };