let jwt = require('jsonwebtoken');
const User = require('../models/user.model');
let config = require('../config');

exports.login = function (req, res) {
    User.findOne({name: req.body.name, password: req.body.password} , function(err, data){
        if(err){
            res.statusCode = 400;
            res.json({
                success: false,
                message: 'Authentication failed! Please check the request'
            });
            return
        }
        if(data ===null){
            res.statusCode = 403;
            res.json({
                success: false,
                message: 'Incorrect username or password'
            });
        }
        else if(data.name === req.body.name && data.password === req.body.password) {
            let token = jwt.sign({username: req.body.name},
                config.secret,
                { expiresIn: '48h' // expires in 48 hours
                }
            );
            // return the JWT token for the future API calls
            res.json({
                success: true,
                message: 'Authentication successful!',
                token: token
            });
        }

        // console.log(data[0].name);
    })

};

exports.checkToken = (req, res, next) => {
    let token = req.headers['x-access-token'] || req.headers['authorization']; // Express headers are auto converted to lowercase
    if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length);
    }

    if (token) {
        jwt.verify(token, config.secret, (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Token is not valid'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        return res.json({
            success: false,
            message: 'Auth token is not supplied'
        });
    }
};

