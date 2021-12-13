const https = require('https');
const PaytmChecksum = require('paytmchecksum');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.initiatePayment = catchAsync(async (req, res) => {
    console.log(req.body);
    var paytmParams = {};

    paytmParams.body = {
        "requestType": "Payment",
        "mid": process.env.TEST_MERCHANT_ID,
        "orderId": req.body.orderId,
        "callbackUrl": "https://<callback URL to be used by merchant>",
        "txnAmount": {
            "value": req.body.amount,
            "currency": "INR",
        },
        "userInfo": {
            "custId": req.body.userId
        },
    };

    console.log(paytmParams);

    PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.TEST_MERCHANT_KEY).then(function (checksum) {
        paytmParams.head = {
            "signature": checksum
        };

        var post_data = JSON.stringify(paytmParams);

        var options = {

            /* for Staging */
            hostname: 'securegw-stage.paytm.in',

            /* for Production */
            // hostname: 'securegw.paytm.in',

            port: 443,
            path: `/theia/api/v1/initiateTransaction?mid=${process.env.TEST_MERCHANT_ID}&orderId=${req.body.orderId}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': post_data.length
            }
        };

        var response = "";
        var post_req = https.request(options, function (post_res) {
            post_res.on('data', function (chunk) {
                response += chunk;
            });

            post_res.on('end', function () {
                res.json(JSON.parse(response));
            });
        });

        post_req.write(post_data);
        post_req.end();
    }).catch(err => {
        res.status(400).json(err)
    })

})