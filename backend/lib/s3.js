const AWS = require("aws-sdk");
const { v4: uuidv4 } = require("uuid");
const mime = require("mime-types");
const S3_BUCKET = process.env.S3_BUCKET;

const config = {
  endpoint: process.env.S3_ENDPOINT,
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET,
};
const s3 = new AWS.S3(config);
s3.listBuckets((err, data) => {
  if (err) console.error(err, err.stack);
  else console.log(`S3 Okay: ${data.Buckets[0].Name}`);
});

async function putObject(buffer, fileExtension) {
  let fileName = uuidv4() + "." + mime.extension(fileExtension);
  let file = await s3
    .putObject({ Bucket: S3_BUCKET, Key: fileName, Body: buffer })
    .promise();
  return { file, fileName };
}
function deleteObject() {
  s3.deleteObject({ Bucket: S3_BUCKET, Key: fileName }, function (err, data) {
    if (err) console.log(err, err.stack); // error
    throw new Error();
  });
}

function fileUrl(fileName, altImg) {
  //return `/files/${fileName}`;
  if (fileName) return `${s3_view}/${fileName}`;
  if (altImg === false) return null;
  if (altImg) return altImg;
  return showNoImage();
}

async function getObject(cacheFileName) {
  try {
    let cachedFile = await s3
      .getObject({
        Bucket: S3_BUCKET,
        Key: cacheFileName,
      })
      .promise();
    return cachedFile;
  } catch (err) {
    if (err?.code != "NoSuchKey") console.log(err);
    return false;
  }
}
module.exports.s3 = s3;
module.exports.putObject = putObject;
module.exports.deleteObject = deleteObject;
module.exports.getObject = getObject;
module.exports.S3_BUCKET = S3_BUCKET;
