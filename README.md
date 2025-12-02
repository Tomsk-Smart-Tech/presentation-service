# SmartSlides: AI-Powered Presentation Builder

**SmartSlides** is an innovative web application designed to help teachers and educators create visual presentations quickly and effortlessly using Generative AI. By simply describing a topic, users can generate a structured presentation with slides, text, and visual suggestions, which can then be further customized in a powerful built-in editor.

## 🚀 Key Features

*   **AI-Powered Generation:** Transform a simple text prompt into a full presentation structure (JSON) using a fine-tuned LLM (Qwen 3 8B) hosted on NVIDIA Triton Inference Server.
*   **Interactive Editor:** A rich canvas editor (built with React and Konva.js) allowing users to add, move, resize, and style text, shapes, and images.
*   **Templates:** Ready-made slide templates (Title, Content, Image, Final) for quick creation.
*   **Presentation Mode:** A built-in full-screen viewer to present slides directly from the browser.
*   **Export Options:** Export presentations to **PDF** for sharing or **JSON** for saving and editing later.
*   **Authentication:** Simple role-based login system.

## 📂 Project Structure

The repository is organized into three main components:

*   **`backend/`**: A Python FastAPI application that acts as the middleware. It handles user authentication and proxies requests to the AI inference server.
    *   *Documentation:* [Backend README](backend/README.md)
*   **`frontend/`**: A React + TypeScript single-page application. It provides the user interface for the editor, AI chat, and presentation viewer.
    *   *Documentation:* [Frontend README](frontend/README.md)
*   **`triton/`**: Configuration and setup for the NVIDIA Triton Inference Server, including the model repository structure.

## 🛠️ Setup and Installation

### Prerequisites

*   **Docker & Docker Compose** (Recommended for full stack deployment)
*   **Node.js** (for local frontend development)
*   **Python 3.8+** (for local backend development)
*   **NVIDIA GPU** (Required for running the Triton Inference Server with acceleration)

### Quick Start (using Docker Compose)

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-folder>
    ```

2.  **Start the services:**
    ```bash
    docker-compose up --build
    ```
    This will start the Backend, Frontend, and Triton Server.

3.  **Access the Application:**
    *   Frontend: `http://localhost:3000`
    *   Backend API: `http://localhost:8001`
    *   Triton Server: `http://localhost:8000`

### Manual Setup (Local Development)

#### 1. Backend

Navigate to the `backend` directory and follow the instructions in [backend/README.md](backend/README.md).

```bash
cd backend
pip install -r requirements.txt
python main.py
```

#### 2. Frontend

Navigate to the `frontend` directory and follow the instructions in [frontend/README.md](frontend/README.md).

```bash
cd frontend
npm install
npm start
```

#### 3. Triton Inference Server

Ensure you have the Triton Inference Server running and accessible at the URL specified in your backend configuration (default: `localhost:8000`).

## 📚 Documentation

Detailed documentation for the source code, including function descriptions and API details, can be found within the code files (docstrings/JSDoc) and in the component-specific READMEs linked above.

*   **Backend API:** defined in `backend/main.py`
*   **Frontend Components:** located in `frontend/src/components/`

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

[License Name] - see the LICENSE file for details.
