require('../styles/foods.scss')
var $;
$ = require('jquery');

$(document).ready(function(){
  fetch("https://quantified-self-api-data.herokuapp.com/api/v1/foods")
    .then(response => {return response.json()})
    .then(data => { 
      data.forEach(function(e){
       $("#food-table").append(
         "<tr>" +
          `<td>${e.name}</td>` +
          `<td>${e.calories}</td>` +
         "</tr>" 
       )
      })
    })
})

$("#food-btn").on("click", function(e){
  e.preventDefault()
  var name = $("input[name='food-name']").val()
  var calories = $("input[name='food-cal']").val()
  var tableRef = document.getElementById('food-table').getElementsByTagName('tbody')[0]
  $("#food-table").find('tbody').append(
    "<tr>" + 
      `<td>${name}</td>` + 
      `<td>${calories}</td>` + 
    "</tr>"
  )
  //2) save to tr> database 
})