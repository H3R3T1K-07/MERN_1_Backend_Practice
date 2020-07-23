const express = require('express')
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// Load Input Validation
const validateProfileInput = require('../../validation/profile');

// Load User Model
const User = require('../../models/User');

// Load Profile Model
const Profile = require('../../models/Profile');

// @router 	Get api/profile/test
// @desc	Tests profile route
// @access	Public
router.get('/test', (req, res) => res.json('profile works'));

// @router 	Get api/profile/handle/:handle
// @desc	Get Profile by User Handle
// @access	Public
router.get('/handle/:handle', (req, res) => {
	const errors = {};

	Profile.findOne({handle: req.params.handle})
	.populate('user', ['name', 'avatar'])
	.then(profile => {
		if(!profile) {
			errors.noprofile = 'There is no profile for this user';
			res.status(404).json(errors);
		}
		res.json(profile);
	})
	.catch(err => res.status(404).json(err));
});

// @router 	Get api/profile/user/:user_id
// @desc	Get Profile by User ID
// @access	Public
router.get('/user/:user_id', (req, res) => {
	const errors = {};

	Profile.findOne({user: req.params.user_id})
	.populate('user', ['name', 'avatar'])
	.then(profile => {
		if(!profile) {
			errors.noprofile = 'There is no profile for this user';
			res.status(404).json(errors);
		}
		res.json(profile);
	})
	.catch(err => res.status(404).json(errors));
});

// @router 	Get api/profile/user/:user_id
// @desc	Get Profile by User ID
// @access	Public
router.get('/all', (req, res) => {
	const errors = {};

	Profile.find()
	.populate('user', ['name', 'avatar'])
	.then(profile => {
		if(!profile) {
			errors.noprofile = 'There are no profles';
			res.status(404).json(errors);
		}
		res.json(profile);
	})
	.catch(err => res.status(404).json(errors));
});

// @router 	Get api/profile
// @desc	Get curreent users profile
// @access	Private
router.get('/', passport.authenticate('jwt', {session: false}), (req, res) => {
	const errors = {};
	Profile.findOne({user: req.user.id})
		.populate('user', ['name', 'avatar'])
		.then(profile =>{
			if(!profile) {
				errors.noprofile = 'There is no profile for this user';
				return res.status(404).json(errors);
			}
			res.json(profile);
		})
		.catch(err => res.status(400).json(err)); 
});

// @router 	POST api/profile
// @desc	Create or Update current users profile
// @access	Private
router.post('/', passport.authenticate('jwt', {session: false}), (req, res) => {
	const {errors, isValid} = validateProfileInput(req.body);
	if(!isValid) {
		return res.status(400).json(errors)
	}
	// Get fields
	const profileFields = {};
	profileFields.user = req.user.id;

	const {id, handle, company, website, location, bio, status, githubusername, skills, youtube, twitter, facebook, linkedin, instagram} = req.body;

	if(handle){profileFields.handle = handle;}
	if(company){profileFields.company = company;}
	if(website){profileFields.website = website;}
	if(location){profileFields.location = location;}
	if(bio){profileFields.bio = bio;}
	if(status){profileFields.status = status;}
	if(githubusername){profileFields.githubusername = githubusername;}

	// Skills
	if(typeof skills !== 'undefined'){
		profileFields.skills = skills.split(',');
	}

	// Social
	profileFields.social = {};
	if(youtube){profileFields.social.youtube = youtube;}
	if(twitter){profileFields.social.twitter = twitter;}
	if(facebook){profileFields.social.facebook = facebook;}
	if(linkedin){profileFields.social.linkedin = linkedin;}
	if(instagram){profileFields.social.instagram = instagram;}

	Profile.findOne({user: req.user.id}).then(profile => {
		if(profile) {
			// Update
			Profile.findOneAndUpdate(
					{user: req.user.id},
					{$set: profileFields},
					{new: true}
				).then(profile => res.json(profile));
			} else{
				// Create Profile

				// Check if handle exists
				Profile.findOne({hadle: profileFields.handle}).then(profile =>{
					if(profile) {
						errors.handle = 'That handle already exists';
						res.status(400).json(errors);
					}

					// Save profile
					new Profile(profileFields).save().then(profile => res.json(profile));
				});
			}
		}
	);
});


module.exports = router;
