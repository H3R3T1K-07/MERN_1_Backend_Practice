const express = require('express')
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

// Load Models
const Post = require('../../models/Post');
const User = require('../../models/User');

// Load input Validation
const  validatePostInput = require('../../validation/post');

// @router 	Get api/posts/test
// @desc	Tests posts route
// @access	Public
router.get('/test', (req, res) => res.json('posts works'));

// @router 	POST api/posts
// @desc	Create post
// @access	Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
	const {errors, isValid} = validatePostInput(req.body);
	if(!isValid) {
		return res.status(400).json(errors)
	}

	const newPost = new Post({
		text: req.body.text,
		name: req.boody.name,
		avatar: req.body.name,
		user: req.user.id
	});

	newPost.save().then(post => res.json(post))
});

module.exports = router;