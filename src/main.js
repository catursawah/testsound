(function () {
  // Utility function to create HTML elements
  function createElement(tag, className, attributes = {}, innerHTML = "") {
    const element = document.createElement(tag);
    element.className = className;
    Object.keys(attributes).forEach((attr) =>
      element.setAttribute(attr, attributes[attr])
    );
    if (innerHTML) element.innerHTML = innerHTML;
    return element;
  }

  const StartButton = createElement("button", "start-button", {});
  document.body.appendChild(StartButton);

  const microphoneIcon = createElement("img", "microphone-img", {
    src: "/Assets/microphone.png",
    alt: "microphone-img",
  });
  StartButton.appendChild(microphoneIcon);

  const mainContainer = createElement("div", "box");
  document.body.appendChild(mainContainer);

  const heading = createElement("h3", "heading", {}, "Alfred");
  mainContainer.appendChild(heading);

  const timer = createElement("div", "timer", {}, "0:00");
  mainContainer.appendChild(timer);

  const imageContainer = createElement("div", "image-container");
  mainContainer.appendChild(imageContainer);

  // Add the image as a background
  imageContainer.style.backgroundImage = "url('/Assets/man.png')";
  imageContainer.style.backgroundSize = "cover";
  imageContainer.style.backgroundPosition = "center";

  const Speaking = createElement("h3", "Speaking-text", {}, "Speaking...");
  mainContainer.appendChild(Speaking);
  
  const midButtonsContainer = createElement("div","mid-button-container");
  mainContainer.appendChild(midButtonsContainer);
  
  const micButton = createElement("button","mic-button",{});
  midButtonsContainer.appendChild(micButton);

  const micIcon = createElement("img", "mic-image", {
    src: "/Assets/microphone.png",
    alt: "mic-img",
  });
  micButton.appendChild(micIcon);  

  const chatButton = createElement("button","chat-button");
  midButtonsContainer.appendChild(chatButton);

  const chatIcon = createElement("img", "chat-image", {
    src: "/Assets/chat.png",
    alt: "chat-img",
  });
  chatButton.appendChild(chatIcon);
  

  const buttonContainer = createElement("div", "button-container");
  document.body.appendChild(buttonContainer);

  const closeButton = createElement("button", "close-button", {}, "X");
  buttonContainer.appendChild(closeButton);

  const minimizeButton = createElement("button", "minimize-button", {}, "v");
  buttonContainer.appendChild(minimizeButton);

  // function to increment timer
  // Timer logic
  let seconds = 0;
  let timerInterval;
  function startTimer() {
    seconds = 0; // Reset seconds to 0
    timer.innerHTML = "0:00"; // Reset timer display
    timerInterval = setInterval(() => {
      seconds++;
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      timer.innerHTML = `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }, 1000);
  }

  // Function to stop the timer
  function stopTimer() {
    clearInterval(timerInterval); // Stop the interval
  }
  // Show the box when the start button is clicked
  StartButton.addEventListener("click", () => {
    mainContainer.style.display = "block";
    StartButton.style.display = "none";
    microphoneIcon.style.display = "none";
    buttonContainer.style.display = "flex";
    startTimer();
  });

  // hide the main container when close is clicked
  closeButton.addEventListener("click", () => {
    mainContainer.style.display = "none";
    buttonContainer.style.display = "none";
    StartButton.style.display = "flex";
    microphoneIcon.style.display = "block";
    stopTimer();
  });

  const style = document.createElement("style");
  style.textContent = `
.start-button {
    display: flex;
    align-items: center;
    justify-content: center; 
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 60px;
    height: 60px;
    background-color:#dddcdc;
    border: none;
    border-radius: 50%; 
    cursor: pointer;
    padding: 0;
    transition: transform 0.3s ease; 
}
.start-button:hover{
   transform: scale(1.2); 
}
.microphone-img {
    width: 40px; 
    height:40px; 
    transition: transform 0.3s ease;
}
.microphone-img:hover {
    transform: scale(1.2); 
}
.box {
   display: none;
   position: fixed;
   bottom: 144px; 
   right: 20px;
   width: 340px;
   height: 285px;
   background-color: white;
   border: 1px solid #ccc;
   border-radius: 10px;
   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
   padding: 20px;
   z-index: 1000;
}
.heading {
   font-size: 20px;
   text-align: center; 
   margin: 0;
}
.button-container {
   display: none;
   position: fixed;
   bottom: 80px; 
   right: 20px; 
   width: 385px;
   justify-content:center; 
   z-index: 1000;   
}
.close-button{
  height:50px;
  width:50px;
  border-radius: 50%;
  background-color:rgb(218, 8, 8);
  border:none;
  color:white;
  font-size:25px;
  cursor:pointer;
  margin-right:35px
}
.minimize-button{
  height:50px;
  width:50px;
  border-radius: 50%;
  background-color:black;
  border:none;
  color:white;
  font-size:25px;
  cursor:pointer;
}
.timer{
  font-size: 18px;
  text-align: center;
  margin-top: 10px;
}
.image-container {
  width: 100px;
  height: 100px;
  border-radius: 50%; 
  margin: 13px auto;
  background-color:
}
.Speaking-text{
  font-size:18px;
  text-align: center; /* Horizontally center the text */
}
.mid-button-container{
  display:flex;
  justify-content:center
}
.mic-button{
  width: 40px;
  height:40px;
  background-color:#dddcdc;
  border-radius:50%;
  border:none;
  margin-right:10px;
  display: flex;
  align-items: center;
  justify-content: center; 
}
.chat-button{
  width: 40px;
  height:40px;
  background-color:#dddcdc;
  border-radius:50%;
  border:none;
  display: flex;
  align-items: center;
  justify-content: center; 
}
.mic-image{
  height:30px;
  width:30px
}
.chat-image{
  height:32px;
  width:32px
}
`;

  document.head.appendChild(style);
})();