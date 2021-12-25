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

  if ((await Slot.findOne({ consultant_id: consultantId })) == undefined) {
    await Slot.create({
      consultant_id: consultantId,
      booked_slots: [],
    });
  }

  const userWalletBalance = await User.findById(userId).select("+walletAmount");

  if (userWalletBalance.walletAmount < callRate) {
    return next(new AppError("Not enough credits!", 400));
  }

  const slots = await Slot.findOneAndUpdate(
    { consultant_id: consultantId },
    {
      $push: {
        booked_slots: {
          booked_by: userId,
          start_time: startTime,
          end_time: endTime,
          amount_paid: callRate,
        },
      },
    },
    { new: true }
  );

  const user = await User.findByIdAndUpdate(userId, {
    $inc: { walletAmount: -callRate },
  });

  await Slot.findOneAndUpdate(
    { consultant_id: user.slot_booked_by_this },
    {
      $push: {
        booked_slots: {
          booked_by: userId,
          start_time: startTime,
          end_time: endTime,
          amount_paid: callRate,
        },
      },
    }
  );

  await User.findByIdAndUpdate(consultantId, {
    $inc: { walletAmount: callRate },
  });

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    data: {
      slots,
    },
  });
});

// TODO: ADD A CANCELLATION OF A BOOKED SLOT AND RETURN THE CREDITS TO THE USER
