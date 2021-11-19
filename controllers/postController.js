const multer = require("multer");
const sharp = require("sharp");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Post = require("./../models/postModel");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

exports.uploadPhoto = upload.single("photo");
exports.resizePhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${Date.now()}.jpeg`;
  console.log(req.file.filename);
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/${req.file.filename}`);

  next();
});

exports.createPost = catchAsync(async (req, res, next) => {
  // IT REQUIRES PHOTO , TITLE , EMAIL
  const filteredBody = req.body;
  if (req.file) filteredBody.photo = req.file.filename;
  const post = await Post.create(filteredBody);

  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});
