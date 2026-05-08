# Trazy: Bengaluru Travel Engine ✦

A high-performance travel planning engine built for the Bengaluru market using the Google Native Stack.

## Tech Stack
- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Backend**: Node.js (Express) + TypeScript
- **AI**: Google Gemini 1.5 Flash
- **Maps**: Google Maps Platform (React-Google-Maps)
- **Deployment**: Google Cloud Run

## Core Features
### 1. Smart Hybrid Route Planner
Finds the exact **Switch Point** where you should transition from public transport (BMTC/Metro) to private transport (Uber/Auto) for the most efficient commute.

### 2. Merge Point Finder
Calculates the geographically optimal junction for multiple travelers from different parts of Bengaluru to meet before heading to a shared destination.

## Setup Instructions

### Prerequisites
- Node.js (v20+)
- Google Cloud Project with Gemini and Maps APIs enabled.

### Local Development
1. Clone the repository.
2. Create a `.env` file in the root:
   ```env
   GOOGLE_GENERIC_AI_KEY=your_gemini_key
   VITE_GOOGLE_MAPS_API_KEY=your_maps_key
   PORT=3001
   ```
3. Install dependencies:
   ```bash
   # Terminal 1: Backend
   cd server
   npm install
   npm run dev

   # Terminal 2: Frontend
   cd client
   npm install
   npm run dev
   ```

### Deployment to Google Cloud Run
Run the following command in the root:
```bash
gcloud builds submit --config cloudbuild.yaml
```

## Security
- API keys are handled strictly by the Node.js backend.
- The frontend uses a proxy to communicate with the server, ensuring keys are never exposed in client-side code.
