require('../styles/foods.scss')
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
       $("#food-table").append(
        "<tr>" +
          `<td class="row-name" contentEditable='true'>${food.name}</td>` +
          `<td contentEditable='true'>${food.calories}</td>` +
         `<td><button>-</button></td>` +
        "</tr>"
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
      "<tr>" +
        `<td class="row-name" contentEditable='true'>${name}</td>` +
        `<td contentEditable='true'>${calories}</td>` +
        `<td><button>-</button></td>` +
      "</tr>"
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
  var food = $(e.target).closest("tr")[0]
  var name = food.querySelector("TD").innerText
  var foodId = foodIds[name]
  if ($(e.target).is(":button")) {
    $(e.target).closest(food).remove()
    fetch(`https://quantified-self-api-data.herokuapp.com/api/v1/foods/${foodId}`, {
      method: 'delete',
      headers: { 'Content-Type': 'application/json' }
    })
  }
})

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

$(document).ready(function () {
  $("#filter-box").on("keyup", function () {
    var value = $(this).val().toLowerCase();
    $("#food-table tr").filter(function () {
      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
    })
  })
})
