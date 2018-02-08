var $;
$ = require('jquery');
var foodIds = {}

function diaryLoad() {
  getFoods()
  addFoodsToMeals()
  deleteFoodFromMeal()
  getSavedMealFoods()
  addCalTotalListeners()
  updateRemainingCals()
  updateTotalCals()
}

function getFoods() {fetch("https://qs-api-node.herokuapp.com/api/v1/foods")
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

function addFoodsToMeals() {
  var buttons = $("#meal-buttons").find(".meal-btn").each(function () {
    $(this).on("click", (e) => {
      addFoodsToMeal(this)
      uncheckBoxes()
    })
  })
}

function addFoodsToMeal(mealObj) {
  var meal = mealObj.innerText.toLowerCase()
  var checkedFoods = checkBoxesChecked()
  var targetMeal = $(`#${meal}`).find(".meal-foods")
  var targetMealId = targetMeal.parent()[0].dataset.mealId
  $(checkedFoods).each(function (index) {
    var foodId = foodIds[this[0]]
    addFoodToMeal(this, targetMeal, targetMealId, foodId)
  })
}

function addFoodToMeal(mealObj, targetMeal, targetMealId, foodId) {
  fetch(`https://qs-api-node.herokuapp.com/api/v1/meals/${targetMealId}/foods/${foodId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  targetMeal.append(
    `<div class='row'>` +
    `<div class='d-row-name'>${mealObj[0]}</div>` +
    `<div class='d-row-cals'>${mealObj[1]}</div>` +
    `<div><button>-</button></div>` +
    `</div>`
  )
}


function uncheckBoxes() {
  $("input[type='checkbox']").each(function() {
    if ($(this).is(":checked")) {
      $(this).prop('checked', false)
    }
  })
}

var checkBoxesChecked = function () {
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

function deleteFoodFromMeal() {
  $(document).find(".meal").on("click", function (e) {
    if ($(e.target).is(":button")) {
      var row = $(e.target).parent().parent()
      var name = $(row).find(".d-row-name")[0].innerText
      var foodId = foodIds[name]
      var mealId = parseInt($(row).parent().parent()[0].dataset.mealId)
      fetch(`https://qs-api-node.herokuapp.com/api/v1/meals/${mealId}/foods/${foodId}`, {
        method: 'delete',
        headers: { 'Content-Type': 'application/json' }
      })
      row.remove()
    }
  })
}

function getSavedMealFoods() {
  fetch(`https://qs-api-node.herokuapp.com/api/v1/meals/`)
  .then(function (response) { return response.json() })
  .then(function (response) {
    response.forEach(function(meal) {
    appendAllMealFoods(meal)
    })
  })
}

function appendAllMealFoods(meal) {
  meal.foods.forEach(function (food) {
    $(`div[data-meal-id="${meal.id}"]`).find(".meal-foods").append(
      `<div class='row'>` +
      `<div class='d-row-name'>${food.name}</div>` +
      `<div class='d-row-cals'>${food.calories}</div>` +
      `<div><button>-</button></div>` +
      `</div>`
    )
  })
}

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

function updateRemainingCals () {
  $(".meal").each(function() {
    var remainingCals = $(this).find('#remaining-cals')
    $(this).find("#total-cals").on("DOMSubtreeModified", function(){
      var goal = parseInt(remainingCals[0].dataset.goal)
      var actual = this.textContent
      var remainingNumber = goal - actual
      remainingCals.text(remainingNumber)
      turnRedOrGreen(remainingCals, remainingNumber)
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
      turnRedOrGreen(remainingCalories, difference)
    })
  })
}

function turnRedOrGreen(calsObj, calsDifference) {
  if (calsDifference > 0) {
    calsObj.removeClass("red")
    calsObj.addClass('green')
  } else {
    calsObj.removeClass("green")
    calsObj.addClass('red')
  }
}
 module.exports = diaryLoad
