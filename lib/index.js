require('../styles/foods.scss')
require('../styles/diary.scss')
var $;
$ = require('jquery');
var foodIds = {}

//Populate list with all stored foods on page load

$(document).ready(function(){
  fetch("https://quantified-self-api-data.herokuapp.com/api/v1/foods")
    .then(response => {return response.json()})
    .then(data => {
      data.forEach(function(food){
        foodIds[food.name] = food.id
       $("#food-table").prepend(
        "<div class='row'>" +
          `<div class="row-name" contentEditable='true'>${food.name}</div>` +
          `<div class="row-cals" contentEditable='true'>${food.calories}</div>` +
         `<div><button>-</button></div>` +
        "</div>"
       )
      })
    })
})

//Add new food

$("#food-btn").on("click", function(e) {
  e.preventDefault()
  var name = $("input[name='food-name']").val()
  var calories = $("input[name='food-cal']").val()
  var tableRef = document.getElementById('food-table').getElementsByTagName('tbody')[0]

  if (name === '') {
    alert("Please enter a food name.")
  } else if (calories === '') {
    alert("Please enter a calorie amount.")
  } else {
    $("#food-table").prepend(
      "<div class='row'>" +
        `<div class="row-name" contentEditable='true'>${name}</div>` +
        `<div class='row-cals' contentEditable='true'>${calories}</div>` +
        `<div><button>-</button></div>` +
      "</div>"
    )
    $("input[name='food-name']").val('')
    $("input[name='food-cal']").val('')
  }

  const newFood = {food: {name: name, calories: calories}}
  fetch("https://quantified-self-api-data.herokuapp.com/api/v1/foods", {
    method: 'post',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(newFood) })
    .then(response => {
      return response.json()
    })
    .then(foodInfo => {
      foodIds[foodInfo.name] = foodInfo.id
    })
})

//Delete Foods

$("#food-table").on("click", function(e) {
  var food = $(e.target).parent().parent()[0]
  var name = $(food).find("div.row-name").html()
  var foodId = foodIds[name]
  if ($(e.target).is(":button")) {
    $(e.target).closest(food).remove()
    fetch(`https://quantified-self-api-data.herokuapp.com/api/v1/foods/${foodId}`, {
      method: 'delete',
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

//Edit foods

$('#food-table').on('focus', '[contenteditable]', function (e) {
  var beforeValue = $(this).html()
  var cellId = foodIds[beforeValue]
  var parent = $(this).parent()[0]
  var children =  $(parent).find('TD')

  if (beforeValue = $(children[0]).html()) {
    $(this).data('inputType', "name")
    $(this).data('beforeCalories', $(children[1]).html())
  } else {
    $(this).data('inputType', "cals")
    $(this).data('beforeName', $(children[0]).html())
  }
  $(this).data('id', cellId)

}).on('blur keyup paste input', '[contenteditable]', function () {

  var newValue = $(this).html()
  if (typeof($(this).data("beforeName") === 'undefined')) {
    var updateFood = {food: {name: newValue, calories: $(this).data("beforeCalories")}}
  } else {
    updateFood = {food: {name: $(this).data("beforeName"), calories: newValue}}
  }
  var foodId = $(this).data('id')
  fetch(`https://quantified-self-api-data.herokuapp.com/api/v1/foods/${foodId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify(updateFood),
  })
})

//filter the foods
$(document).ready(function () {
  $("#filter-box").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#food-table .row").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    })
  })
})

/////////////////////////////////////////////////////////////////////

$(document).ready(function(){
  fetch("https://quantified-self-api-data.herokuapp.com/api/v1/foods")
    .then(response => {return response.json()})
    .then(data => {
      data.forEach(function(food){
        foodIds[food.name] = food.id
       $("#food-suggestions").prepend(
        "<div class='row'>" +
          `<div class="d-row-name" contentEditable='true'>${food.name}</div>` +
          `<div class="d-row-cals" contentEditable='true'>${food.calories}</div>` +
         `<input type='checkbox'>` +
        "</div>"
       )
      })
    })
})

$(document).ready(function() {
  var buttons = $("#meal-buttons").find(".meal-btn").each(function() {
    $(this).on("click", (e) => {
      var meal = this.innerText.toLowerCase()
      var checkedFoods = boxChecker()
      var targetMeal = $(`#${meal}`).find(".meal-foods")
      $(checkedFoods).each(function(index) {
      targetMeal.append(
        `<div class='row'>` +
          `<div class='d-row-name'>${this[0]}</div>` +
          `<div class='d-row-cals'>${this[1]}</div>` +
        `</div>`
        )
      })
    })
  })
})

//returns an array of arrays of name and calories.
var boxChecker = function() {
  var allFoods = $("#food-suggestions").find(".row")
    var checkedFoods = $(allFoods).filter(function() {
      let check = $(this).find("input[type='checkbox']")
      if (check.is(":checked")) {
        return true
      } else {
        return false
      }
    })
    var foodDetails = checkedFoods.map(function(x) {
      return [this.innerText.split(/\n/).slice(0,2)]
    })
  return foodDetails
}