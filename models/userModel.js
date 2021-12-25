const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please tell us your name!"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  image: {
    type: String,
    default:
      "https://www.pixsy.com/wp-content/uploads/2021/04/ben-sweet-2LowviVHZ-E-unsplash-1.jpeg",
  },
  role: {
    type: String,
    enum: ["user", "consultant", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      // This only works on CREATE and SAVE!!!
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords are not the same!",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  callRate: {
    type: Number,
    default: 2,
  },
  location: {
    type: String,
    default: "Delhi",
  },
  professionName: {
    type: String,
    default: "professional",
  },
  walletAmount: {
    type: Number,
    default: 0,
  },
  availability: {
    monday: {
      active: {
        type: Boolean,
        default: true,
      },
      start: {
        type: String,
        default: () => "10:00",
      },
      end: {
        type: String,
        default: "18:00",
      },
      slotSize: {
        type: Number,
        default: 30,
      },
      breakSize: {
        type: Number,
        default: 10,
      },
    },
    tuesday: {
      active: {
        type: Boolean,
        default: true,
      },
      start: {
        type: String,
        default: "10:00",
      },
      end: {
        type: String,
        default: "18:00",
      },
      slotSize: {
        type: Number,
        default: 30,
      },
      breakSize: {
        type: Number,
        default: 10,
      },
    },
    wednesday: {
      active: {
        type: Boolean,
        default: true,
      },
      start: {
        type: String,
        default: "10:00",
      },
      end: {
        type: String,
        default: "18:00",
      },
      slotSize: {
        type: Number,
        default: 30,
      },
      breakSize: {
        type: Number,
        default: 10,
      },
    },
    thursday: {
      active: {
        type: Boolean,
        default: true,
      },
      start: {
        type: String,
        default: "10:00",
      },
      end: {
        type: String,
        default: "18:00",
      },
      slotSize: {
        type: Number,
        default: 30,
      },
      breakSize: {
        type: Number,
        default: 10,
      },
    },
    friday: {
      active: {
        type: Boolean,
        default: true,
      },
      start: {
        type: String,
        default: "10:00",
      },
      end: {
        type: String,
        default: "18:00",
      },
      slotSize: {
        type: Number,
        default: 30,
      },
      breakSize: {
        type: Number,
        default: 10,
      },
    },
    saturday: {
      active: {
        type: Boolean,
        default: true,
      },
      start: {
        type: String,
        default: "10:00",
      },
      end: {
        type: String,
        default: "6:00",
      },
      slotSize: {
        type: Number,
        default: 30,
      },
      breakSize: {
        type: Number,
        default: 10,
      },
    },
    sunday: {
      active: {
        type: Boolean,
        default: true,
      },
      start: {
        type: String,
        default: "10:00",
      },
      end: {
        type: String,
        default: "18:00",
      },
      slotSize: {
        type: Number,
        default: 30,
      },
      breakSize: {
        type: Number,
        default: 10,
      },
    },
  },
});

userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
