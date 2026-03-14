# Text to Diagram AI

Text to Diagram AI is a powerful, AI-driven web application that automatically converts natural language text, step-by-step processes, and ideas into professional Mermaid.js diagrams.

## Features

- **AI-Powered**: Uses Groq (LLaMA 3) to intelligently parse your text and extract relationships.
- **Multiple Diagram Types**: Supports Flowcharts, Mind Maps, Sequence Diagrams, Architecture Diagrams, State Diagrams, and Entity-Relationship Diagrams.
- **Failover System**: Rotates between multiple GROQ API keys if one gets rate-limited.
- **Interactive Viewer**: Zoom, pan, and inspect diagrams directly in the browser.
- **Export Options**: Export your diagrams to PNG, SVG, or raw Mermaid code.

## Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, React Router, Mermaid.js, Lucide React
- **Backend**: Node.js, Express, Groq SDK

## Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- 3 Groq API keys (you can get them for free at [groq.com](https://console.groq.com/))

### Environment Variables

#### Backend
1. Duplicate the `.env` file in the `backend/` directory or update the existing one:
   ```env
   PORT=3001
   GROQ_API_KEY_1=your_first_key
   GROQ_API_KEY_2=your_second_key
   GROQ_API_KEY_3=your_third_key
   ```

#### Frontend
1. The frontend already has a `.env` file pointing to `http://localhost:3001`. You can change it if your backend runs on a different port:
   ```env
   VITE_API_URL=http://localhost:3001
   ```

### Running Locally

1. **Start the Backend server:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **Start the Frontend development server:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` (or the port Vite provides).

## Example Input Text

Try pasting this into the generator:

> Process of making coffee: Start by boiling water. Then grind the coffee beans. If you have a filter, put it in the dripper, otherwise use a french press. Pour hot water over the beans. Finally, pour into cup.

## Deployment

- **Frontend**: Easily deployable on Vercel by selecting the `frontend` directory and setting the Root Directory setting to `frontend` or using `vercel deploy` within the frontend folder. Set the `VITE_API_URL` environment variable to your deployed backend URL.
- **Backend**: Can be deployed on Render by creating a new Web Service pointing to the repository, setting the Root Directory to `backend`, and specifying `npm start`. Set your `GROQ_API_KEY_*` variables in the Service settings.
