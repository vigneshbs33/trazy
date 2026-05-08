import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERIC_AI_KEY || '');

app.post('/api/route', async (req, res) => {
  try {
    const { from, to, priority } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are Trazy, a Bengaluru travel AI. Return ONLY valid JSON.
      No markdown. No explanation. Just raw JSON.
      
      Find hybrid public+private transport routes in Bengaluru.
      From: ${from}
      To: ${to}
      Priority: ${priority}

      Return this exact JSON structure:
      {
        "routes": [
          {
            "type": "public" | "hybrid" | "private",
            "name": "route name",
            "segments": [
              {
                "mode": "bus" | "metro" | "walk" | "uber" | "auto",
                "description": "Bus 500C from Koramangala to Silk Board",
                "duration": 25,
                "cost": 20,
                "lat": 12.9279,
                "lng": 77.6271
              }
            ],
            "switchPoint": "location name or null",
            "switchPointCoords": { "lat": 12.9279, "lng": 77.6271 } | null,
            "switchReason": "why switch here or null",
            "totalTime": 45,
            "totalCost": 55,
            "comfort": 3,
            "recommended": true | false
          }
        ],
        "insight": "one line AI insight comparing the options"
      }

      Use real Bengaluru bus numbers, metro lines, landmarks. 
      Include approximate coordinates (lat, lng) for key points so they can be mapped.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON if Gemini wraps it in markdown blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;
    
    res.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate route' });
  }
});

app.post('/api/merge', async (req, res) => {
  try {
    const { destination, travelers } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are Trazy, a Bengaluru travel AI. Return ONLY valid JSON.
      No markdown. No explanation. Just raw JSON.

      Find the optimal merge point for a group going to ${destination}.
      Travelers: ${JSON.stringify(travelers)}

      Return this exact JSON structure:
      {
        "mergePoint": "Trinity Metro Station",
        "mergePointArea": "MG Road, Bengaluru",
        "mergePointCoords": { "lat": 12.9738, "lng": 77.6119 },
        "mergeReason": "why this point was chosen",
        "travelerRoutes": [
          {
            "name": "Priya",
            "from": "Jayanagar",
            "hasCar": false,
            "mode": "Bus 500A",
            "routeDescription": "Bus 500A from Jayanagar to Trinity",
            "duration": 22,
            "cost": 15
          }
        ],
        "finalLeg": {
          "description": "All drive together from Trinity to ${destination}",
          "duration": 35,
          "mode": "car"
        },
        "insight": "one line summary of time/cost saved vs alternatives"
      }

      Use real Bengaluru locations, bus numbers, metro lines.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? jsonMatch[0] : text;

    res.json(JSON.parse(jsonStr));
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to find merge point' });
  }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
