module.exports = (fn) => {
  return (req, res, next) => {
    console.log("catchAsync");
    fn(req, res, next).catch(next);
  };
};
