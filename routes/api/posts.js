const express = require('express')
const router = express.Router();

// @router 	Get api/posts/test
// @desc	Tests posts route
// @access	Public

router.get('/test', (req, res) => res.json('posts works'));

module.exports = router;