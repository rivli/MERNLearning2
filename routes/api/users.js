const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

// Bringing User Model
const User = require('../../models/User');

// @route  POST api/users
// @desc   Register new User
// @access Public
router.post('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please use a valid Email').isEmail(),
    check('password', 'Please enter a password with 6 or more charachters').isLength({ min:6 })
], async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // separate data from req.body
    const { name, email, password } = req.body;

    try {

        // See if user exists
        let user = await User.findOne({ email });

        if(user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }

        // Get the User's gravatar

        const avatar = gravatar.url(email, {
            s: "200",
            r: "pg",
            d: "mm"
        });

        user = new User({
            name,
            email,
            avatar,
            password
        })

        // Encrypt password

        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password, salt);

        // Saving the user

        await user.save();

        // Return JWT

        res.send('User registered');

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }

});

module.exports = router;