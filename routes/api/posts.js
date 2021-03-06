const express = require('express')
const router = express.Router();
const passport = require('passport');
const mongoose = require('mongoose');

// Load Models
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

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
router.delete('/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
	Profile.findOne({user: req.user.id})
	.then(profile => {
		Post.findById(req.params.id)
		.then(post =>{
			if(post.user.toString() !== req.user.id) {
				return res.status(401).json({notAuthorised: 'User not authorised'});
			}

			// then delete
			post.remove().then(() => res.json({success: true}));
		})
		.catch(err => res.status(404).json({postnotfound: 'No post found'}));
	})
	.catch(err => res.status(404).json({notFound: 'User not found'}));
});

// @router 	POST api/posts/like/:id
// @desc	Like a post
// @access	Private
router.post('/like/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
	Profile.findOne({user: req.user.id})
	.then(profile => {
		Post.findById(req.params.id)
		.then(post =>{
			if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
				return res.status(400).json({alreadyLiked: 'User already liked this post'})
			}

			// Add userid to likes array
			post.likes.unshift({user: req.user.id});
			post.save().then(post => res.json(post));
		})
		.catch(err => res.status(404).json({postnotfound: 'No post found'}));
	})
	.catch(err => res.status(404).json({notFound: 'User not found'}));
});

// @router 	POST api/posts/unlike/:id
// @desc	Unlike a post
// @access	Private
router.post('/unlike/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
	Profile.findOne({user: req.user.id})
	.then(profile => {
		Post.findById(req.params.id)
		.then(post =>{
			if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
				return res.status(400).json({neverLiked: 'User has not liked this post'})
			}

			// Remove userid to likes array
			const removeIndex = post.likes.map(item => item.user.toString()).indexOf(req.user.id);
			post.likes.splice(removeIndex, 1);

			post.save().then(post => res.json(post));
		})
		.catch(err => res.status(404).json({postnotfound: 'No post found'}));
	})
	.catch(err => res.status(404).json({notFound: 'User not found'}));
});

// @router 	POST api/posts/comment/:id
// @desc	Add comment to a post
// @access	Private
router.post('/comment/:id', passport.authenticate('jwt', {session: false}), (req, res) => {
	const {errors, isValid} = validatePostInput(req.body);
	if(!isValid) {
		return res.status(400).json(errors)
	}

	Post.findById(req.params.id)
	.then(post => {
		const newComment = {
			text: req.body.text,
			name: req.body.name,
			avatar: req.body.avatar,
			user: req.user.id
		}

		// Add to comments array
		post.comments.unshift(newComment);

		// Save
		post.save().then(post => res.json(post))
	})
	.catch(err => res.status(404).json({postNotFound: 'No post found'}));
});

// @router 	Delete api/posts/comment/:id
// @desc	Remove comment to a post
// @access	Private
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', {session: false}), (req, res) => {
	Post.findById(req.params.id)
	.then(post => {
		// Check if comment exists
		if(post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
			return res.status(404).json({commentdoesnotexist: 'Comment does not exist'});
		}

		// Get remove index
		const removeIndex = post.comments.map(item => item._id.toString()).indexOf(req.params.comment_id);

		// Splice out of comments array
		post.comments.splice(removeIndex, 1);

		post.save().then(post => res.json(post));
	})
	.catch(err => res.status(404).json({postNotFound: 'No post found'}));
});

module.exports = router;