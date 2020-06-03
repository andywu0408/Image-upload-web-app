// Always include at top of Javascript file
"use strict";

const colors = ["#e6e2cf", "#dbcaac", "#c9cbb3", "#bbc9ca", "#a6a5b5", "#b5a6ab", "#eccfcf",
    "#eceeeb", "#bab9b5"];
const fonts = ["Indie Flower", "Dancing Script", "Long Cang", "Homemade Apple"];

// By default
let selectedColor = colors[0];
let selectedFont = fonts[0];
let imageName = null;

function on() {
  document.getElementById("overlay").style.display = "block";
  document.getElementById("popup").style.display = "block";
  document.getElementById("close-popup-icon").style.display = "block";
}

function off() {
  document.getElementById("overlay").style.display = "none";
  document.getElementById("popup").style.display = "none";
  document.getElementById("close-popup-icon").style.display = "none";
}

// UPLOAD IMAGE using a post request
// Called by the event listener that is waiting for a file to be chosen
const uploadFile = actionName => {
  console.log("Uploading file...")

    // get the file chosen by the file dialog control
    const selectedFile = document.getElementById(actionName).files[0];
    // store it in a FormData object
    const formData = new FormData();
    // name of field, the file itself, and its name
    formData.append('newImage', selectedFile, selectedFile.name);

    // build a browser-style HTTP request data structure
    const xhr = new XMLHttpRequest();
    // it will be a POST request, the URL will this page's URL+"/upload" 
    xhr.open("POST", "/upload", true);
  console.log("About to call img api...")
    // sendGetRequest();
    let chooseImgButton = document.getElementById('choose-tag');
    chooseImgButton.textContent = "Uploading...";

    // callback function executed when the HTTP response comes back
    xhr.onloadend = function (e) {
        // Get the server's response body
       // console.log(xhr.responseText);
        // now that the image is on the server, we can display it!
       
        let newImage = document.getElementById("serverImage");
        // newImage.src = "../images/" + selectedFile.name;
        newImage.src = "http://ecs162.org:3000/images/chewu/" + selectedFile.name;
        let replaceButtonContainer = document.getElementById('replace-container');
        let img = document.getElementById('serverImage');
        img.style.height = "auto";
        document.getElementById('imageContainer').style.height = "auto";
        document.getElementById('letterID').style.height = "auto";
      
        replaceButtonContainer.style.display = "block";
        let ChooseImgButtonContainer = document.getElementById('controls');
        ChooseImgButtonContainer.style.display = "none";
      
        let imageContainer = document.getElementById('imageContainer');

        imageContainer.style.border = 0;
    }

    // actually send the request
    xhr.send(formData);
};

function getImgUrl(elmtId, returnedText, otherOne) {
    let newImage = document.getElementById("serverImage");
  console.log("In getImgUrl(), get jpg name: " + returnedText)
    newImage.src = "http://ecs162.org:3000/images/"+returnedText;
}

// sends an AJAX request asking the server 
// function sendGetRequest() {

//   let xhr = new XMLHttpRequest;
//   // it's a GET request, it goes to URL /seneUploadToAPI
//   xhr.open("GET","sendUploadToAPI");
  
//   // Add an event listener for when the HTTP response is loaded
//   xhr.addEventListener("load", function() {
//       if (xhr.status == 200) {  // success
//         getImgUrl("goodMessage",xhr.responseText);
//       } else { // failure
//         getImgUrl("badMessage",xhr.responseText);
//       }
//   });
  
  // Actually send request to server
//   xhr.send();
// }

const updateFont = e => {
    var selectedFontListItem = e.target.id;
    var selectedNum = selectedFontListItem.slice(5, 6);

    /* update unicode symbols for entire font selection list */
    for (let i = 1; i <= 4; i++) {
        if (i != selectedNum) {
            let symbListItem = document.getElementById(`symb-${i}`);
            symbListItem.textContent = "\u25C7";
        } else {
            document.getElementById(`symb-${selectedNum}`).textContent = "\u2756";
            document.getElementById('letter').style.fontFamily = fonts[i - 1];
            selectedFont = fonts[i - 1];
        }
    }
};
const updateColor = e => {
    const selectedColorNum = e.target.id.slice(5, 6);

    if (e.type == "mouseover") {
        const letter = document.getElementById("letterID");
        letter.style.backgroundColor = colors[selectedColorNum - 1];
        for (let i = 1; i <= 8; i++) {
            let colorBox = document.getElementById(`color${i}`);
            if (i != selectedColorNum) {
                if (colorBox.style.border != 'solid')
                    colorBox.style.border = 'none';
            } else {
                colorBox.style.border = 'dashed';
            }
        }
    } else if (e.type == "click") {
        selectedColor = colors[selectedColorNum - 1]
        for (let i = 1; i <= 8; i++) {
            let colorBox = document.getElementById(`color${i}`);
            if (i != selectedColorNum) {
                colorBox.style.border = 'none';
            } else {
                colorBox.style.border = 'solid';
            }
        }
    }
}
const onSharePressed = e => {
  
    let cardContent = document.getElementById("letter").value;
  
    // build a browser-style HTTP request data structure
    const xhr = new XMLHttpRequest();
    // it will be a POST request, the URL will this page's URL+"/upload" 
    xhr.open("POST", "/sharePostcard", true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  
    const cardData = {
       photo: imageName,
       message: cardContent,
       font: selectedFont,
       color: selectedColor
    }

    const cardDataJSON = JSON.stringify(cardData);
  

    // callback function executed when the HTTP response comes back
    xhr.onloadend = function (e) {
        // Get the server's response body
        console.log("Response from server ---")
        console.log(xhr.responseText);
        document.getElementById("postcard-link").href = "https://wholesale-pewter-restaurant.glitch.me/card-display.html?id=" +xhr.responseText;
        document.getElementById("postcard-link").textContent = "https://wholesale-pewter-restaurant.glitch.me/card-display.html?id=" +xhr.responseText;
    }

    // actually send the request
    xhr.send(cardDataJSON);
    
}



// Add event listener to the file input element
document.getElementById("fileChooser").addEventListener("change", ()=>{uploadFile("fileChooser")});
document.getElementById("fileReplacer").addEventListener("change", ()=>{uploadFile("fileReplacer")});

// event listener for share button
document.getElementById("share-button").addEventListener("click", onSharePressed)

// event listener for updating font
document.getElementById("font-1").addEventListener("click", updateFont);
document.getElementById("font-2").addEventListener("click", updateFont);
document.getElementById("font-3").addEventListener("click", updateFont);
document.getElementById("font-4").addEventListener("click", updateFont);

// event listener for updating postcard's background color
document.getElementById("color1").addEventListener("mouseover", updateColor);
document.getElementById("color2").addEventListener("mouseover", updateColor);
document.getElementById("color3").addEventListener("mouseover", updateColor);
document.getElementById("color4").addEventListener("mouseover", updateColor);
document.getElementById("color5").addEventListener("mouseover", updateColor);
document.getElementById("color6").addEventListener("mouseover", updateColor);
document.getElementById("color7").addEventListener("mouseover", updateColor);
document.getElementById("color8").addEventListener("mouseover", updateColor);
document.getElementById("color9").addEventListener("mouseover", updateColor);
document.getElementById("color1").addEventListener("click", updateColor);
document.getElementById("color2").addEventListener("click", updateColor);
document.getElementById("color3").addEventListener("click", updateColor);
document.getElementById("color4").addEventListener("click", updateColor);
document.getElementById("color5").addEventListener("click", updateColor);
document.getElementById("color6").addEventListener("click", updateColor);
document.getElementById("color7").addEventListener("click", updateColor);
document.getElementById("color8").addEventListener("click", updateColor);
document.getElementById("color9").addEventListener("click", updateColor);


