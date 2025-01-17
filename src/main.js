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
  // Helper function to handle API requests
  const apiRequest = async (url, method = "POST", payload = {}) => {
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      return null;
    }
  };

  let socket = io.connect("http://172.16.15.184:3000");
  let context,
    processor,
    input,
    bufferSize = 2048;
  let isRecording = false;
  const constraints = { audio: true, video: false };

  const audio = createElement(
    "audio", // Tag name
    "audio-player-class", // Class name
    { id: "audio-player", controls: "true" }, // Attributes
    "" // No innerHTML
  );
  audio.style.display = "none";
  // Append the audio element to a container or the body
  document.body.appendChild(audio);

  const StartButton = createElement("button", "start-button", {});
  document.body.appendChild(StartButton);

  const microphoneIcon = createElement("img", "microphone-img", {
    src: "/Assets/microphone.png",
    alt: "microphone-img",
  });
  StartButton.appendChild(microphoneIcon);

  const mainContainer = createElement("div", "box");
  document.body.appendChild(mainContainer);

  const chatbotContainer = createElement("div", "chatbot");
  document.body.appendChild(chatbotContainer);

  // Create the upper div container and append it to the chatbot container
  const upperDiv = createElement("div", "upper-div-container");
  chatbotContainer.appendChild(upperDiv);

  const chatWindow = createElement("div", "chat-window");
  chatbotContainer.append(chatWindow);

  // Add the back icon and heading to the upper div
  const backIcon = createElement("img", "backIcon-img", {
    src: "/Assets/Back-icon.png",
    alt: "backIcon-img",
  });
  upperDiv.appendChild(backIcon);

  // Add a click event listener to the back icon
  backIcon.addEventListener("click", () => {
    mainContainer.style.display = "block"; // Show the main container
    chatbotContainer.style.display = "none";
  });

  const innerHeading = createElement(
    "h3",
    "heading",
    {},
    "Switch to voice mode"
  );
  upperDiv.appendChild(innerHeading);
  // const upperDiv = createElement("div","upper-div-container");
  // chatbotContainer.appendChild(upperDiv);

  // const innerHeading = createElement("h3", "heading", {}, "Switch to voice mode");
  // chatbotContainer.appendChild(innerHeading);

  // const backIcon = createElement("img", "backIcon-img", {
  //   src: "/Assets/Back-icon.png",
  //   alt: "backIcon-img",
  // });
  // chatbotContainer.appendChild(backIcon);

  const heading = createElement("h2", "heading", {}, "Alfred");
  mainContainer.appendChild(heading);

  const timer = createElement("div", "timer", {}, "0:00");
  mainContainer.appendChild(timer);

  const imageContainer = createElement("div", "image-container");
  mainContainer.appendChild(imageContainer);

  // Add the image as a background
  imageContainer.style.backgroundImage = "url('/Assets/man.png')";
  imageContainer.style.backgroundSize = "cover";
  imageContainer.style.backgroundPosition = "center";

  const Speaking = createElement("h3", "Speaking-text", {}, "Thinking...");
  mainContainer.appendChild(Speaking);

  const midButtonsContainer = createElement("div", "mid-button-container");
  mainContainer.appendChild(midButtonsContainer);

  const micButton = createElement("button", "mic-button", {});
  midButtonsContainer.appendChild(micButton);

  const micIcon = createElement("img", "mic-image", {
    src: "/Assets/microphone.png",
    alt: "mic-img",
  });
  micButton.appendChild(micIcon);

  const chatButton = createElement("button", "chat-button");
  midButtonsContainer.appendChild(chatButton);

  const chatIcon = createElement("img", "chat-image", {
    src: "/Assets/chat.png",
    alt: "chat-img",
  });
  chatButton.appendChild(chatIcon);

  chatIcon.addEventListener("click", () => {
    chatbotContainer.style.display = "block";
    mainContainer.style.display = "none";
  });

  // Create the message container
  const messageContainer = createElement("div", "message-container");
  chatbotContainer.appendChild(messageContainer); // Append to chatbot container, not body

  // Create the input field
  const messageInput = createElement("input", "message-input", {
    type: "text",
    placeholder: "Write your message",
  });
  messageContainer.appendChild(messageInput);

  // Create the send button
  const sendButton = createElement("button", "send-button");
  messageContainer.appendChild(sendButton);

  // Create the send icon and append it to the button
  const sendIcon = createElement("img", "send-icon", {
    src: "/Assets/send-button.png", // Update with the correct path to your icon
    alt: "Send",
  });
  sendButton.appendChild(sendIcon);
  // update the window
  const updateChatWindow = (text, sender) => {
    const messageDiv = createElement("div", `message ${sender}`, {}, text);
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
    chatWindow.style.display= "flex"
    
  };
  // function to send user message to the backend
  sendButton.addEventListener("click", async () => {
    const userMessage = messageInput.value.trim();
    console.log(userMessage);
    if (userMessage) {
      messageInput.value = "";
      updateChatWindow(userMessage, "user");
      const payload = { userText: userMessage };

      const data = await apiRequest(
        "http://172.16.15.184:3000/text-response",
        "POST",
        payload
      );
      handleApiResponse(data);
    }
  });

  // function to handle api response 
  function handleApiResponse(response){
    if (response?.chatresponse){
      const BotMessage =response?.chatresponse;
      updateChatWindow(BotMessage, "bot");
    }
  }

  //
  messageInput.addEventListener("keydown", async (event) => {
    if (event.key === "Enter" && messageInput.value.trim()) {
      sendButton.click(); // Trigger the send button's click event
      messageInput.value = ""; // Clear input field after sending message
    }
  });

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
    initRecording();
  });

  // hide the main container when close is clicked
  closeButton.addEventListener("click", () => {
    mainContainer.style.display = "none";
    buttonContainer.style.display = "none";
    StartButton.style.display = "flex";
    microphoneIcon.style.display = "block";
    chatbotContainer.style.display = "none";
    stopTimer();
    stopRecording();
  });

  const audioPlayer = document.querySelector("#audio-player");

  // startBtn.addEventListener('click', initRecording);
  // pauseBtn.addEventListener('click', stopRecording);

  // Handle socket connection
  socket.on("connect", () => {
    console.log("Connected to the server!");
  });

  // Handle chat responses and audio file from server
  socket.on("chat-response", (data) => {
    console.log(data.chatResponse);
    const { transcript, chatResponse, audio } = data;
    // Play the audio response
    // if (audioPath) {
    //     // Assuming audioPath is the path to the audio file generated by the backend
    //     audioPlayer.src = audioPath; // Set the audio player's source to the backend audio file
    //     audioPlayer.play(); // Play the audio
    // }
    if (audio) {
      // const audioBlob = new Blob([Uint8Array.from(atob(audio), c => c.charCodeAt(0))], { type: 'audio/mp3' });
      const audioBlob = base64ToBlob(audio, "audio/mpeg");
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayer.src = audioUrl; // Set the audio player's source
      audioPlayer.play(); // Play the audio
    }
  });

  function initRecording() {
    console.log("initial recording");
    if (isRecording) return;

    isRecording = true;
    // sttTextDisplay.textContent = "Listening..."; // Show listening status
    socket.emit("startGoogleCloudStream", ""); // Start server-side stream

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      context = new (window.AudioContext || window.webkitAudioContext)();
      processor = context.createScriptProcessor(bufferSize, 1, 1);
      processor.connect(context.destination);
      const analyser = context.createAnalyser();
      input = context.createMediaStreamSource(stream);
      input.connect(processor);

      processor.onaudioprocess = (e) => {
        const left = e.inputBuffer.getChannelData(0);
        const left16 = downsampleBuffer(left, 44100, 16000);
        socket.emit("binaryData", left16); // Send audio data
      };

      context.resume();
    });
  }
  function stopRecording() {
    console.log("stop recording");
    if (!isRecording) return;
    isRecording = false;
    socket.emit("endStream"); // End the server-side stream
    // sttTextDisplay.textContent = "Stopped listening"; // Update UI
  }
  function base64ToBlob(base64, contentType = "", sliceSize = 512) {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, { type: contentType });
  }

  function downsampleBuffer(buffer, sampleRate, outSampleRate) {
    if (outSampleRate === sampleRate) return buffer;
    if (outSampleRate > sampleRate) throw "Outsample rate must be smaller";

    const sampleRateRatio = sampleRate / outSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Int16Array(newLength);
    let offsetResult = 0,
      offsetBuffer = 0;

    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0,
        count = 0;
      for (
        let i = offsetBuffer;
        i < nextOffsetBuffer && i < buffer.length;
        i++
      ) {
        accum += buffer[i];
        count++;
      }

      result[offsetResult] = Math.min(1, accum / count) * 0x7fff;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }

    return result.buffer;
  }

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
   height: 402px;
   background-color: white;
   border: 1px solid #ccc;
   border-radius: 10px;
   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
   padding: 20px;
   z-index: 1000;
}
.heading {
   font-size: 25px;
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
  font-size: 22px;
  text-align: center;
  margin-top: 15px;
}
.image-container {
  width: 130px;
  height: 130px;
  border-radius: 50%; 
  margin: 19px auto;
}
.Speaking-text{
  font-size:22px;
  text-align: center; /* Horizontally center the text */
}
.mid-button-container{
  display:flex;
  justify-content:center
}
.mic-button{
  width: 60px;
  height:60px;
  background-color:#dddcdc;
  border-radius:50%;
  border:none;
  margin-right:19px;
  display: flex;
  align-items: center;
  justify-content: center; 
   cursor: pointer;
}
.chat-button{
  width: 60px;
  height:60px;
  background-color:#dddcdc;
  border-radius:50%;
  border:none;
  display: flex;
  align-items: center;
  justify-content: center; 
   cursor: pointer;
}
.mic-image{
  height:35px;
  width:35px
}
.chat-image{
  height:44px;
  width:44px
}
.chatbot{
 display: none;
   position: fixed;
   bottom: 144px; 
   right: 20px;
   width: 340px;
   height: 402px;
   background-color:white;
   border: 1px solid #ccc;
   border-radius: 10px;
   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
   padding: 20px;
   z-index: 1000;
   max-height:402px;
  overflow-y: auto; /* Enable vertical scrolling if content exceeds max height */
}
.upper-div-container {
  display: flex; 
  align-items: center; 
  padding: 10px;
  margin-top:-16px
}

.backIcon-img {
  height: 26px; 
  width: 33px;
  margin-right: 10px;
  cursor:pointer
}
/* Position the message container at the bottom of the chatbot container */
.message-container {
  position: absolute; /* Position relative to the parent container */
  bottom: 0; /* Stick to the bottom */
  left: 0;
  right: 0; /* Stretch across the width */
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20px; 
   padding: 16px 24px;
    border: 1px solid #ECECEC;
    border-radius: 24px;
}

/* Style for the input field */
.message-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
}

/* Style for the send button */
.send-button {
  background-color: transparent;
  border: none;
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Style for the send icon */
.send-icon {
  height: 20px;
  width: 35px;
}
   .chat-window {
    flex-grow: 1;
    overflow-y: auto;
    padding: 10px;
    display: none;
    flex-direction: column;
    max-height:293px;
  }
 .message {
    margin: 10px 0;
    padding: 10px;
    border-radius: 4px;
    max-width: 75%;
    word-wrap: break-word;
  }

  .message.user {
    align-self: flex-end;
    background: #62bff3;
  }

  .message.bot {
    align-self: flex-start;
    background: #d9dee0;
  }

`;

  document.head.appendChild(style);
})();
