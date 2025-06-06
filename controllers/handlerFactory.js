const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");

const sendResponse = function (statusCode, data, res, token, message) {
  const response = {
    status: "success",
  };

  if (message) response.message = message;
  if (Array.isArray(data)) response.results = data.length;
  if (token) response.token = token;
  response.data = data;
  res.status(statusCode).json(response);
};

exports.sendResponse = sendResponse;

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let features = new APIFeatures(Model.find(), req.query).filter().sort().paginate().limitFields();
    const docs = await features.query;

    sendResponse(200, docs, res);
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findById(req.params.id).populate(populateOptions);

    if (!doc) return next(new AppError(400, `no ${Model.modelName} found with this ID.`));

    sendResponse(200, doc, res);
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    sendResponse(201, doc, res, `${Model.modelName} created successfully!`);
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
      new: true,
    });

    if (!doc) return next(new AppError(400, `no ${Model.modelName} found with this ID: ${req.params.id}`));

    sendResponse(200, doc, res, `${Model.modelName} updated successfully!`);
  });

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) return next(new AppError(400, `no ${Model.modelName} found with this ID.`));

    sendResponse(204, null, res);
  });

exports.deleteAll = (Model) =>
  catchAsync(async (req, res, next) => {
    await Model.deleteMany();
    sendResponse(204, null, res);
  });
