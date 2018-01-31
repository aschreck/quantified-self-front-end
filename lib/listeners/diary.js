var $;
$ = require('jquery');
var foodIds = {}

function diaryLoad() {
  getFoods()
  addFoodToMeal()
  deleteFoodFromMeal()
  getSavedMealFoods()
  addCalTotalListeners()
  updateRemainingCals()
  updateTotalCals()
}

function getFoods() {fetch("https://quantified-self-api-data.herokuapp.com/api/v1/foods")
  .then(response => { return response.json() })
  .then(data => {
    data.forEach(function (food) {
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
}

function addFoodToMeal() {
  var buttons = $("#meal-buttons").find(".meal-btn").each(function () {
    $(this).on("click", (e) => {
      var meal = this.innerText.toLowerCase()
      var checkedFoods = boxChecker()
      var targetMeal = $(`#${meal}`).find(".meal-foods")
      var targetMealId = targetMeal.parent()[0].dataset.mealId
      $(checkedFoods).each(function (index) {
        var foodId = foodIds[this[0]]
        fetch(`https://quantified-self-api-data.herokuapp.com/api/v1/meals/${targetMealId}/foods/${foodId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })

        targetMeal.append(
          `<div class='row'>` +
          `<div class='d-row-name'>${this[0]}</div>` +
          `<div class='d-row-cals'>${this[1]}</div>` +
          `<div><button>-</button></div>` +
          `</div>`
        )
      })
    })
  })
}

//returns an array of arrays of name and calories.
var boxChecker = function () {
  var allFoods = $("#food-suggestions").find(".row")
  var checkedFoods = $(allFoods).filter(function () {
    let check = $(this).find("input[type='checkbox']")
    if (check.is(":checked")) {
      return true
    } else {
      return false
    }
  })
  var foodDetails = checkedFoods.map(function (x) {
    return [this.innerText.split(/\n/).slice(0, 2)]
  })
  return foodDetails
}

//remove foods from meal.
function deleteFoodFromMeal() {
  $(document).find(".meal").on("click", function (e) {

    if ($(e.target).is(":button")) {
      var row = $(e.target).parent().parent()
      var name = $(row).find(".d-row-name")[0].innerText
      var foodId = foodIds[name]
      var mealId = parseInt($(row).parent().parent()[0].dataset.mealId)
      fetch(`https://quantified-self-api-data.herokuapp.com/api/v1/meals/${mealId}/foods/${foodId}`, {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' }
      })
      row.remove()
    }
  })
}

function getSavedMealFoods() {
  fetch(`https://quantified-self-api-data.herokuapp.com/api/v1/meals/`)
    .then(function (response) { return response.json() })
    .then(function (response) {
      response.forEach(function (meal) {
        meal.foods.forEach(function (food) {
          $(`div[data-meal-id="${meal.id}"]`).find(".meal-foods").append(
            `<div class='row'>` +
            `<div class='d-row-name'>${food.name}</div>` +
            `<div class='d-row-cals'>${food.calories}</div>` +
            `<div><button>-</button></div>` +
            `</div>`
          )
        }
        )
      })
    })
}

//grab all of the meal tables
function addCalTotalListeners() {
  $(".meal-foods").each(function () {
    $(this).on("DOMSubtreeModified", function () {
      var totalCalories = 0
      $(this).find(".d-row-cals").each(function () {
        totalCalories += parseInt(this.innerText)
      })
      var mealTable = $(this).parent()[0]
      $(mealTable).find("#total-cals").text(totalCalories)
    })
  })
}

//update remaining calories based on the current value of total calories.
function updateRemainingCals () {
  $(".meal").each(function() {
    var remainingCals = $(this).find('#remaining-cals')
    $(this).find("#total-cals").on("DOMSubtreeModified", function(){
      var goal = parseInt(remainingCals[0].dataset.goal)
      var actual = this.textContent
      var remainingNumber = goal - actual
      remainingCals.text(remainingNumber)
        if (remainingNumber > 0) {
          remainingCals.addClass('green')
        } else {
          remainingCals.addClass('red')
        }
    })
  })
}

function updateTotalCals() {
  $(".meal-cals-total").each(function() {
    $(this).on("DOMSubtreeModified", function() {
      var actual = 0
      $(".meal-cals-total").each(function() {
        actual += parseInt(this.textContent)
      })
      $("#calories-consumed").text(actual)
      var remainingCalories = $("#remaining-calories")
      var calGoal = parseInt(remainingCalories[0].dataset.goal)
      var difference = calGoal - actual
      remainingCalories.text(difference)
      if (difference > 0) {
        debugger
        remainingCalories.removeClass("red")
        remainingCalories.addClass('green')
      } else {
        remainingCalories.removeClass("green")
        remainingCalories.addClass('red')
      }
    })
  })
}

 module.exports = diaryLoad
