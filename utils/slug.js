function slugify(text) {

  return text.toLowerCase().split(' ').join('-');
}
module.exports = {
  slugify
}