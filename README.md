# Chatcraze Chat Application

**Chatcraze** is a chat application developed to learn WebSocket communication and explore hosting options. It uses **FastAPI** for the backend and **Next.js** for the frontend. The application is containerized with **Docker** using a multi-container setup managed by **Docker Compose**. 

---

## Features
- Real-time communication powered by WebSockets.
- FastAPI backend with PostgreSQL as the database.
- Next.js frontend for a seamless chat experience.
- Fully containerized for easy deployment.

---

## Installation and Running Locally

### Prerequisites
1. Install Docker and Docker Compose on your system.
2. Ensure `docker-compose` is available via the command line.
3. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chatcraze
   ```

### Running with Docker

#### 1. Build and Start the Containers
```bash
docker compose up --build
```
This will:
- Build the backend and frontend Docker images.
- Start the PostgreSQL database, backend, and frontend services.
- Create necessary networks and volumes.

#### 2. Access the Application
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)

#### 3. Stopping the Services
To stop the containers:
```bash
docker compose down
```

---

### Running Locally Without Docker

You can run the backend and frontend independently without Docker:

#### 1. Setup PostgreSQL Database
Ensure you have PostgreSQL installed locally and create a database with the required credentials:
```bash
CREATE DATABASE chatcraze;
CREATE USER chatcraze_user WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE chatcraze TO chatcraze_user;
```

Update the environment variables in `.env` files under the `Root` directory.

#### 2. Running the Backend
Navigate to the `backend` folder and install dependencies:
```bash
cd backend
pip install -r requirements.txt
```
Run the server:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

#### 3. Running the Frontend
Navigate to the `frontend` folder and install dependencies:
```bash
cd frontend
npm install
```
Start the development server:
```bash
npm run dev
```

Access the application:
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:8000](http://localhost:8000)

---

## Environment Variables

Create a `.env` file in the root directory with the following variables:
```env
DB_HOST=<Database Host>
DB_PORT=<Database Port>
DB_NAME=chatcraze
DB_USER=chatcraze_user
DB_PASS=yourpassword
RESEND_API=<Your Resend API Key>
AUTH_SECRET=<Authentication Secret Key>
PROD=<true/false>
```

---

## Directory Structure
```
chatcraze/
├── backend/    # FastAPI backend code
├── frontend/   # Next.js frontend code
├── docker-compose.yml
├── .env
└── README.md
```

---

## Contributions
Feel free to fork this repository, open issues, or create pull requests to enhance the application.

---

## License
This project is licensed under the MIT License. See the LICENSE file for more details.

--- 

Enjoy chatting! 🎉


