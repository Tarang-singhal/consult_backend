const mongoose = require("mongoose");
const validator = require("validator");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  photo: {
    type: String,
    default: "default.jpg",
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
