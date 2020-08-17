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

// @router 	Get api/posts
// @desc	Fetch post
// @access	Public
router.get('/', (req, res) => {
	Post.find()
	.sort({date: -1})
	.then(posts => res.json(posts))
	.catch(err => res.status(404).json({NoPostsFound: 'No post found'}));
});

// @router 	Get api/posts/:id
// @desc	Fetch post
// @access	Public
router.get('/:id', (req, res) => {
	Post.findById(req.params.id)
	.then(posts => res.json(posts))
	.catch(err => res.status(404).json({NoPostFound: 'No post found with that ID'}));
});

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
		name: req.body.name,
		avatar: req.body.avatar,
		user: req.user.id
	});

	newPost.save().then(post => res.json(post))
});

// @router 	POST api/posts
// @desc	Delete post from profile
// @access	Private
//router.delete('/experience/:exp_id', passport.authenticate('jwt', {session: false}), (req, res) => {

module.exports = router;