# Frontend Documentation

This directory contains the frontend application for SmartSlides, built with React and TypeScript.

## Project Structure

*   `src/components/`: Contains all React components used in the application.
    *   `AiInput/`: Components related to the AI input bar.
    *   `Canvas/`: Components for the presentation drawing canvas (Konva.js).
    *   `Chat/`: Components for the chat interface (currently not fully active in main view).
    *   `Login/`: The login page component.
    *   `PresentationView/`: The full-screen presentation mode component.
    *   `Settings/`: Modal for application settings.
    *   `Sidebar/`: Panels for slides, properties, and templates.
    *   `Toolbar/`: The top toolbar with editing tools.
*   `src/services/`: API clients and data transformation utilities.
*   `src/ai/`: Mock API for testing AI features without a backend.
*   `src/types.ts`: TypeScript definitions for the application's data structures (Slides, Shapes, etc.).

## Setup and Installation

1.  **Prerequisites:**
    *   Node.js (v14 or higher)
    *   npm or yarn

2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

## Running the Application

To start the development server:

```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Environment Variables

Create a `.env` file in the root of the `frontend` directory (if needed) to configure API endpoints:

```
REACT_APP_API_BASE_URL=http://localhost:8001
```

## Key Features

*   **Slide Editor:** Drag-and-drop interface for creating slides with text, shapes, and images.
*   **AI Integration:** Generate complete presentations from a single text prompt.
*   **Export:** Save presentations as JSON or export them to PDF.
*   **Presentation Mode:** View slides in full-screen mode.
