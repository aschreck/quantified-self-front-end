var $;
$ = require('jquery');
var foodIds = {}

function foodLoad() {
  addExistingFoods()
  addNewFood()
  deleteFood()
  editFood()
  filterFoods()
}

function addExistingFoods() {
  fetch("https://quantified-self-api-data.herokuapp.com/api/v1/foods")
    .then(response => { return response.json() })
    .then(data => {
      data.forEach(function (food) {
        foodIds[food.name] = food.id
        $("#food-table").prepend(
          "<div class='row food'>" +
          `<div class="row-name" contentEditable='true'>${food.name}</div>` +
          `<div class="row-cals" contentEditable='true'>${food.calories}</div>` +
          `<div><button>-</button></div>` +
          "</div>"
        )
      })
    })
}

function addNewFood() {
  $("#food-btn").on("click", function (e) {
    e.preventDefault()

    var name = $("input[name='food-name']").val()
    var calories = $("input[name='food-cal']").val()

    verifyNewFood(name, calories)

    createNewFood(name, calories)
  })
}


function verifyNewFood (name, calories) {
  if (name === '') {
    alert("Please enter a food name.")
  } else if (calories === '') {
    alert("Please enter a calorie amount.")
  } else {
    renderNewFood(name, calories)
    $("input[name='food-name']").val('')
    $("input[name='food-cal']").val('')
  }
}

function renderNewFood(name,calories) {
  $("#food-table").prepend(
    "<div class='row'>" +
      `<div class="row-name" contentEditable='true'>${name}</div>` +
      `<div class='row-cals' contentEditable='true'>${calories}</div>` +
    `<div><button>-</button></div>` +
    "</div>"
  )
}

function createNewFood(name, calories) {
  const newFood = { food: { name: name, calories: calories } }
  fetch("https://quantified-self-api-data.herokuapp.com/api/v1/foods", {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newFood)
    })
    .then(response => {
      return response.json()
    })
    .then(foodInfo => {
      foodIds[foodInfo.name] = foodInfo.id
  })
}
//Delete Foods

function deleteFood() {
  $("#food-table").on("click", function (e) {
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
}

//Edit foods
function editFood() {
  $('#food-table').on('focus', '[contenteditable]', function (e) {
    if (isNaN($(this).html()) == false) {
      //grab the name from the thing.

      var foodName = $(this).parent().find(".row-name").text()
    }
    var beforeValue = $(this).html()
    var cellId = foodIds[beforeValue] || foodIds[foodName]
    var parent = $(this).parent()[0]
    var children = $(parent).find('div')

    if (isNaN(beforeValue)) {
      $(this).data('inputType', "name")
      $(this).data('beforeCalories', $(children[1]).html())
    } else {
      $(this).data('inputType', "cals")
      $(this).data('beforeName', $(children[0]).html())
    }
    $(this).data('id', cellId)

  }).on('blur keyup paste input', '[contenteditable]', function () {
    var newValue = $(this).html()
    // if (typeof ($(this).data("beforeName") === 'undefined')) {
      if (isNaN(newValue)) {
        var updateFood = { food: { name: newValue, calories: $(this).data("beforeCalories") } }
      } else {
        var updateFood = { food: { name: $(this).data("beforeName"), calories: newValue } }
      }
    var foodId = $(this).data('id')
    fetch(`https://quantified-self-api-data.herokuapp.com/api/v1/foods/${foodId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateFood),
    })
  })
}

//filter the foods
function filterFoods() {
  $(document).ready(function () {
    $("#filter-box").on("keyup", function () {
      var value = $(this).val().toLowerCase();
      $("#food-table .row").filter(function () {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
      })
    })
  })
}

// export * from './food'
module.exports = foodLoad
