const mongoose = require("mongoose");

const slotsSchema = new mongoose.Schema({
  consultant_id: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  booked_slots: [
    {
      booked_by: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        default: null,
      },
      start_time: Date,
      end_time: Date,
      amount_paid: {
        type: Number,
        default: 0,
      },
    },
  ],
});

const Slot = mongoose.model("Slot", slotsSchema);

module.exports = Slot;
