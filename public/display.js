console.log("App is starting");
console.log("Query string is: "+window.location.href);
getCardDataFromServer();
// sendGetRequest();

function getCardDataFromServer() {
  
  let url = "/sharePostcard" + window.location.search;
  let xhr = new XMLHttpRequest;
  
  xhr.open("GET", url);
  
  xhr.addEventListener("load", function() {
    if(xhr.status == 200){
      let responseStr = xhr.responseText;
      let cardData = JSON.parse(responseStr);
      console.log("Displaying Card....")
      console.log(cardData);
      displayCard(cardData.message, cardData.font, cardData.color, cardData.photo);
    } else {
      console.log(xhr.responseText);
    }
  });
  
  xhr.send();
};


function setImg(elmtId, returnedText, otherOne) {
    let newImage = document.getElementById("serverImage");
  console.log("In getImgUrl(), get jpg name: " + returnedText)
    newImage.src = "http://ecs162.org:3000/images/"+returnedText;
}

// sends an AJAX request asking the server 
function sendGetRequest() {
  console.log("Inside sendGetRequest()")
  let xhr = new XMLHttpRequest;
  // it's a GET request, it goes to URL /seneUploadToAPI
  xhr.open("GET","sendUploadToAPI");
  
  // Add an event listener for when the HTTP response is loaded
  xhr.addEventListener("load", function() {
      if (xhr.status == 200) {  // success
        console.log("Annie1")
        setImg("goodMessage",xhr.responseText);
      } else { // failure
        console.log("Annie2")
        setImg("badMessage",xhr.responseText);
      }
  });
  
  // Actually send request to server
  xhr.send();
}
function displayCard(msg, fontStyle, color, imgName) {
  let letter = document.getElementById('letter');
  let cardContainer = document.getElementById('container');
  let img = document.getElementById("serverImage");
  console.log(imgName)
  const imgUrl = "http://ecs162.org:3000/images/chewu/" + imgName;
 
  letter.textContent = msg;
  cardContainer.style.backgroundColor = color;
  img.src = imgUrl;
  
}
  