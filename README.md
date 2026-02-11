\# CampusEventHub – Inter-College Event Management Platform



CampusEventHub is a MERN stack web application that enables colleges to host and manage events such as hackathons, sports competitions, cultural fests, and workshops. Students can browse and register for events across colleges.



---



\## 🛠 Tech Stack



\- MongoDB (Database)

\- Express.js (Backend Framework)

\- React (Frontend - Vite)

\- Node.js (Runtime)

\- Docker (Containerization)



---



\## 📁 Project Structure



CampusEventHub\_Team4/

│

├── frontend/       → React application

├── backend/        → Express server \& API

├── docs/           → Project documentation

├── docker-compose.yml

├── requirements.txt (documentation only)

└── README.md



---



\## 🚀 Local Setup (Without Docker)



\### 1️⃣ Backend



cd backend  

npm install  

npm run dev  



Server runs on:  

http://localhost:5000  



---



\### 2️⃣ Frontend



cd frontend  

npm install  

npm run dev  



App runs on:  

http://localhost:5173  



---



\## 🐳 Run With Docker (Recommended)



Make sure Docker Desktop is running.



From project root:



docker-compose up --build



Services:

\- Frontend → http://localhost:5173

\- Backend → http://localhost:5000

\- MongoDB → localhost:27017



---



\## 🔁 Git Workflow



\- Do NOT push to main branch.

\- All development happens in dev branch.

\- Create feature branches for major features.

\- Raise Pull Requests → Merge into dev.



Example:



git checkout dev  

git pull  

git checkout -b feature/auth  

git commit -m "feat(auth): add login API"  

git push origin feature/auth  



---



\## 👥 Team Guidelines



\- Write clean commit messages.

\- Keep dev branch stable.

\- Do not push secrets.

\- Docker must always run successfully.



