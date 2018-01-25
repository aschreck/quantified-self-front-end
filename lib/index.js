require('../styles/foods.scss')
var $;
$ = require('jquery');

$(document).ready(function(){
  //when the document loads, I want to grab all the existing food items
  //I will make a fetch call to the api and append a thing for each one. 
  fetch("https://quantified-self-api-data.herokuapp.com/api/v1/foods")
    .then(response => {return response.json()})
    .then(data => { 
      data.forEach(function(e){
        //for each, append a new row to the table 
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
  // 1) append this to the table
  var tableRef = document.getElementById('food-table').getElementsByTagName('tbody')[0]
  // var newRow = tableRef.insertRow(tableRef.rows.length);
  $("#food-table").find('tbody').append(
    "<tr>" + 
      `<td>${name}</td>` + 
      `<td>${calories}</td>` + 
    "</tr>"
  )

  //2) save to tr> database 
})