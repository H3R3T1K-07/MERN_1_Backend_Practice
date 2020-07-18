const express = require('express')
const router = express.Router();

// @router 	Get api/users/test
// @desc	Tests users route
// @access	Public

router.get('/test', (req, res) => res.json('users works'));

module.exports = router;