
function OpenFile(event) {
    var input = event.target
    console.log(input.files[0])
    Papa.parse(input.files[0], {
      complete: function (result) {
        console.log(result)
      }
    })
  }