const fs = require('fs')
const sharp = require('sharp')

module.exports = function resize(path, format, width, height,res) {
 try {
    const readStream = fs.createReadStream(path)
    let transform = sharp()
  
    if (format) {
      transform = transform.toFormat(format)
    }
  
    if (width || height) {
      transform = transform.resize(width, height)
    }
    readStream.on('error', function(err) {
        res.end("not_found")

      });
  
    return readStream.pipe(transform)
 } catch (error) {
     console.log(error);
     return null
 }
  
}