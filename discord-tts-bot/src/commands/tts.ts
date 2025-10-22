export const execute = async (message: any, args: string[]) => {
    const text = args.join(" ");
    
    if (!text) {
        return message.reply("Please provide text to convert to speech.");
    }

    try {
        // Call the TTS service to convert text to speech
        const audioBuffer = await TTSService.convertTextToSpeech(text);
        
        // Send the audio buffer back to the user
        await message.channel.send({
            files: [{
                attachment: audioBuffer,
                name: 'tts-output.mp3'
            }]
        });
    } catch (error) {
        console.error("Error converting text to speech:", error);
        message.reply("There was an error processing your request.");
    }
};