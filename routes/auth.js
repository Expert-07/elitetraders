const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();    

router.get('/confirm', (req, res) => {
    try {
        const { email } = jwt.verify(req.query.token, process.env.JWT_SECRET);
        res.send(`<h2>Email ${email} confirmed successfully!</h2>
            <p>Redirecting to login page...</p>
            a<script>
                setTimeout(() => {
                    window.location.href = '/login';
                }, 3000);
            </script>`);
    } catch (err) {
        res.status(400).send('Invalid or expired token');
    }   
    });

    module.exports = router;