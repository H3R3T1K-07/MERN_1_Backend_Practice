const express = require('express')
const router = express.Router();

// @router 	Get api/profile/test
// @desc	Tests profile route
// @access	Public

router.get('/test', (req, res) => res.json('profile works'));

module.exports = router;
