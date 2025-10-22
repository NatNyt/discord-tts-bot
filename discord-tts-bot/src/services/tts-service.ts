class TTSService {
    private client: any;

    constructor() {
        const textToSpeech = require('@google-cloud/text-to-speech');
        this.client = new textToSpeech.TextToSpeechClient();
    }

    async convertTextToSpeech(text: string, languageCode: string = 'en-US'): Promise<Buffer> {
        const request = {
            input: { text: text },
            voice: { languageCode: languageCode, ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await this.client.synthesizeSpeech(request);
        return response.audioContent;
    }
}

export default TTSService;