const multer = require("multer");
const AppError = require("./appError");
const slugify = require("slugify");
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError(400, "Not an Image! please upload only images.", false));
};

module.exports = (model) => {
  if (model === "user") {
    const storage = multer.memoryStorage();

    return multer({ storage, fileFilter });
  } else if (model === "book") {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, `public/img/books`);
      },
      filename: (req, file, cb) => {
        const extension = file.mimetype.split("/")[1];
        const title = req.body.title || req.params.id;
        const slug = slugify(title, { lower: true, strict: true });

        cb(null, `book-${slug || req.params.id}-${Date.now()}.${extension}`);
      },
    });

    return multer({ storage, fileFilter });
  }
};
