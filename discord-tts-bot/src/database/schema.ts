import { Schema, model } from 'mongoose';

const ttsSchema = new Schema({
  text: { type: String, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const TTS = model('TTS', ttsSchema);

export default TTS;