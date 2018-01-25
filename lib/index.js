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
          `<td class="row-name">${food.name}</td>` +
          `<td>${food.calories}</td>` +
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
    $("#food-table").find('tbody').append(
      "<tr>" +
        `<td class="row-name">${name}</td>` +
        `<td>${calories}</td>` +
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
  $(e.target).closest(food).remove()

  fetch(`https://quantified-self-api-data.herokuapp.com/api/v1/foods/${foodId}`, {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' }
  })
})
