const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("./../utils/apiFeatures");

exports.getUsers = catchAsync(async (req, res, next) => {
  //http://localhost:5000/user?limit=3&page=1

  let filter = {};

  const features = new APIFeatures(User.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const users = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      data: users,
    },
  });
});

exports.addMoney = async (userId, amount) => {
  const response = false;
  await User.findById(userId, (err, userFound) => {
    if (err) {
      return;
    }
    userFound.WalletAmount = userFound.WalletAmount + amount;
    userFound.save((err, updatedUser) => {
      if(err){
        return;
      }
      response = true;
    });
  })

  return response;
}
