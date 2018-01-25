require('../styles/foods.scss')
var $;
$ = require('jquery');
var foodIds = {}

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
})

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
  var parent = $(this).parent()[0] //gives us the parent row
  var children =  $(parent).find('TD')
  // $(this).data('beforeName', $(children[0]).html())
  // $(this).data('beforeCalories', $(children[1]).html())
  // $(this).data('before', beforeValue)

  //compare beforeName and beforeCalories to before
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
    //then we know that name is being updated and we need old cal information
    var updateFood = {food: {name: newValue, calories: $(this).data("beforeCalories")}}
  } else {
    //then we know that calories is being updated and use old name
    updateFood = {food: {name: $(this).data("beforeName"), calories: newValue}}
  }
  var foodId = $(this).data('id')
  fetch(`https://quantified-self-api-data.herokuapp.com/api/v1/foods/${foodId}`, {
      method: 'put',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify(updateFood),
    })
  }
)
