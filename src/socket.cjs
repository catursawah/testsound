const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Import the CORS module
const fs = require('fs');
const path = require('path');
const { SpeechClient } = require('@google-cloud/speech');
const { OpenAI } = require('openai');
const speechClient = new SpeechClient();

const app = express();
const server = http.createServer(app);

// CORS settings for Socket.io
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

// Use CORS middleware to allow requests from your client
app.use(cors({ origin: '*' }));

const openai = new OpenAI({
    apiKey: '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', // Replace with your OpenAI API key
  });

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('startGoogleCloudStream', () => {
        console.log('Starting Google Cloud Stream...');
        // Pass socket to the transcription function
        startGoogleCloudStream(socket);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Create a Google Cloud Speech Stream
function startGoogleCloudStream(socket) {
    const request = {
        config: {
            encoding: 'LINEAR16',  // Audio encoding format
            sampleRateHertz: 16000, // Audio sample rate
            languageCode: 'en-US',  // Language of the audio
        },
        interimResults: false, // To get partial transcription while processing
    };

    const recognizeStream = speechClient.streamingRecognize(request)
        .on('data', async (data) => {
            if (data.results[0] && data.results[0].alternatives[0]) {
                const transcript = data.results[0].alternatives[0].transcript;
                console.log('Transcription:', transcript);

                // Generate response using OpenAI API
                try {
                    const response = await openai.chat.completions.create({
                        model: "gpt-4",
                        messages: [
                            {
                                role: "system",
                                content: "You are a senior blockchain consultant representing Antier, specializing in custom blockchain solutions, DeFi platforms, centralized/decentralized exchanges, mobile wallets, NFT marketplaces, and RWA tokenization. Your primary goal is to gather client requirements and guide them to book an appointment with Antier's senior consultants. Always redirect users to understand how Antier can assist in building secure and scalable products if the conversation deviates. Validate email and phone details for booking, ensure concise one-line responses, and maintain a natural conversational flow."
                            },
                            { role: "user", content: transcript },
                        ],
                    });
                    const chatResponse = response.choices[0].message.content;
                    console.log('ChatGPT Response:', chatResponse);
                    const audioPath = await generateTTS(chatResponse); // Generate audio response

                    // Emit both the response and audio file URL to the client
                    socket.emit('chat-response', { transcript, chatResponse, audioPath });
                } catch (error) {
                    console.error('Error generating ChatGPT response:', error);
                    socket.emit('chat-response', { transcript, chatResponse: "Sorry, an error occurred while processing your request." });
                }
            }
        })
        .on('error', (error) => {
            console.error('Error in transcription:', error);
        });

    socket.on('binaryData', (audioData) => {
        // Process incoming audio data and send it to the Google Cloud Speech API
        recognizeStream.write(Buffer.from(audioData));
    });

    socket.on('endStream', () => {
        // Close the Google Cloud stream when the client disconnects
        recognizeStream.end();
    });
}

async function generateTTS(text) {
    try {
        // Create speech from text using OpenAI's TTS API
        const audioDir = path.resolve('./audio_files');
        
        // Check if the folder exists, if not, create it
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir);
        }

        // Get the list of files in the audio_files folder
        const files = fs.readdirSync(audioDir);
        
        // If there are files, delete them
        if (files.length > 0) {
            console.log('Cleaning up existing files...');
            for (const file of files) {
                const filePath = path.join(audioDir, file);
                fs.unlinkSync(filePath); // Delete the file
            }
        }
        const timestamp = Date.now();  // Unique timestamp to differentiate files
        const speechFile = path.resolve(`./audio_files/speech_${timestamp}.mp3`);  
        const response = await openai.audio.speech.create({
            model: "tts-1",  // Use the correct model for TTS
            input: text,
            voice: 'alloy',  // Choose the voice you prefer
        });

        // The audio data is in binary format, so we need to save it
        const buffer = Buffer.from(await response.arrayBuffer());
        await fs.promises.writeFile(speechFile, buffer);

        // Save the audio data to a file
        return speechFile;
          
        }

        
    catch (error) {
        console.error('Error generating TTS audio:', error);
        throw error;
    }
}

app.use('/audio', express.static(path.join(__dirname, 'audio')));

server.listen(3000,'0.0.0.0',() => {
    console.log('Server is running on port 3000');
});