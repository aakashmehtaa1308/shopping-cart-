const fs = require('fs');
const { nextTick } = require('process');

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      throw err;
    }
  });
};
exports.deleteFile = deleteFile;
