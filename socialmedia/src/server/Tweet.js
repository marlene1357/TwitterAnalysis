// Tweets
var method = Tweet.prototype;

function Tweet(id, date, text) {
    this._id = id;
    this._date = date;
    this._text = text;
}

method.getId = function () {
    return this._id;
}

method.getDate = function () {
    return this._date;
}

method.getText = function () {
    return this._text;
}

method.getScore = function () {
    return this._score;
}

method.setScore = function (score) {
    this._score = score;
}

module.exports = Tweet;