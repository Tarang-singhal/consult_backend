const Slot = require("../models/slotsModel.js");
const User = require("../models/userModel.js");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.bookSlot = catchAsync(async (req, res, next) => {
  const consultantId = req.body.consultantId;
  const userId = req.body.userId;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const callRate = req.body.callRate || 0;

  // CHECKING WALLET BALANCE
  const userWalletBalance = await User.findById(userId).select("+walletAmount");

  if (userWalletBalance.walletAmount < callRate) {
    return next(new AppError("Not enough credits!", 400));
  }

  const slots = await Slot.create({
    user_id: userId,
    start_time: startTime,
    end_time: endTime,
    amount_paid: callRate,
    consultant_id: consultantId,
  });

  await User.findByIdAndUpdate(userId, {
    $inc: { walletAmount: -callRate },
    $push: { slot_booked_as_user: slots._id },
  });
  await User.findByIdAndUpdate(consultantId, {
    $inc: { walletAmount: callRate },
    $push: { slot_booked_as_consultant: slots._id },
  });

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    data: {
      slots,
    },
  });
});

exports.cancelSlot = catchAsync(async (req, res, next) => {
  const slotId = req.params.slotId;

  const slot = await Slot.findById(slotId);

  if (!slot) {
    return next(new AppError("Slot not found", 404));
  }

  await User.findByIdAndUpdate(slot.user_id, {
    $pull: { slot_booked_as_user: slotId },
    $inc: { walletAmount: slot.amount_paid },
  });
  await User.findByIdAndUpdate(slot.consultant_id, {
    $pull: { slot_booked_as_consultant: slotId },
    $inc: { walletAmount: -slot.amount_paid },
  });

  await slot.remove();

  res.status(202).json({
    status: "success",
    data: {
      slot,
    },
  });
});
