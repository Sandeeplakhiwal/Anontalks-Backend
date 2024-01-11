import DataUriParser from "datauri/parser.js";
import path from "path";

const getDataUri = (image) => {
  const parser = new DataUriParser();
  const extName = path.extname(image.originalName).toString();
  console.log(extName);
  return parser.format(extName, image.buffer);
};

export default getDataUri;
