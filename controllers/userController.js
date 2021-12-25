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

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  res.status(200).json({
    status: "success",
    data: {
      data: user,
    },
  });
});

// TODO: POPULATE ALL BOOKED SLOTS OF USER

exports.getAllSlots = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId)
    .select("+slots_booked_by_this")
    .populate("slots_booked_by_this");

  res.status(200).json({
    status: "success",
    data: user.slots_booked_by_this,
  });
});
