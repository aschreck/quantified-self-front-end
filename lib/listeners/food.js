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

//Add new food
function addNewFood() {
  $("#food-btn").on("click", function (e) {
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
    var beforeValue = $(this).html()
    var cellId = foodIds[beforeValue]
    var parent = $(this).parent()[0]
    var children = $(parent).find('TD')

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
    if (typeof ($(this).data("beforeName") === 'undefined')) {
      var updateFood = { food: { name: newValue, calories: $(this).data("beforeCalories") } }
    } else {
      updateFood = { food: { name: $(this).data("beforeName"), calories: newValue } }
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

// sort foods by calories
var oldCollection
oldCollection = document.getElementsByClassName("row food")

$('#head-cal').on('click', sortByCalories)

var action = 1

function sortByCalories() {
  if (action == 1) {
    var originalDivCollection = document.getElementsByClassName("row food")
    var ascArray = []
    for (var i = originalDivCollection.length >>> 0; i--;) {
      ascArray[i] = originalDivCollection[i]
    }
    ascArray.sort(function (a, b) {
      return Number(a.children[1].innerHTML) - Number(b.children[1].innerHTML)
    })
    var ascOutput = ""
    for (var i = 0; i < ascArray.length; i++) {
      ascOutput += ascArray[i].outerHTML
    }
    document.getElementById('food-table').innerHTML = ascOutput
    action += 1
  } else if (action == 2) {
    var ascDivCollection = document.getElementsByClassName("row food")
    var descArray = []
    for (var i = ascDivCollection.length >>> 0; i--;) {
      descArray[i] = ascDivCollection[i]
    }
    descArray.sort(function (a, b) {
      return Number(b.children[1].innerHTML) - Number(a.children[1].innerHTML)
    })
    var descOutput = ""
    for (var i = 0; i < descArray.length; i++) {
      descOutput += descArray[i].outerHTML
    }
    document.getElementById('food-table').innerHTML = descOutput
    action += 1
  } else {
    oldCollection
    var originalArray = []
    for (var i = oldCollection.length >>> 0; i--;) {
      originalArray[i] = oldCollection[i]
    }
    var originalOutput = ""
    for (var i = 0; i < originalArray.length; i++) {
      originalOutput += originalArray[i].outerHTML
    }
    document.getElementById('food-table').innerHTML = originalOutput
    action = 1
  }
}

// export * from './food'
module.exports = foodLoad
