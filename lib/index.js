var $;
$ = require('jquery');
var foodIds = {}
const diaryLoad = require('./listeners/diary')
const foodLoad = require('./listeners/food')
require('../styles/diary.scss')
require('../styles/foods.scss')

$(document).ready(function () {
  diaryLoad()
  foodLoad()
})