var express = require("express");
var router = express.Router();



//POST LOGIN ROUTE
router.post("/login", (req, res) => {
    console.log(req.body);
    console.log(req.params);
    res.json({
        userId: "123",
        token: "dad"
    })
});

//POST REGISTER ROUTE
router.post("/signup", (req, res) => {
    console.log(req.body);
    console.log(req.params);
    res.json({
        userId: "123",
        token: "dad"
    })
});

module.exports = router;