\# Backend - CampusEventHub



This is the Express.js backend for the CampusEventHub platform.



---



\## 🛠 Stack



\- Node.js

\- Express.js

\- MongoDB

\- Mongoose

\- JWT

\- bcryptjs

\- Nodemailer

\- dotenv



---



\## 📁 Structure



backend/

│

├── config/

├── controllers/

├── routes/

├── models/

├── middleware/

├── server.js

└── .env



---



\## 🔐 Environment Variables (.env)



PORT=5000  

MONGO\_URI=mongodb://localhost:27017/campuseventhub  

JWT\_SECRET=your\_secret\_key  



---



\## 🚀 Run Locally



npm install  

npm run dev  



Server runs at:

http://localhost:5000



---



\## 🐳 Docker



When using Docker, MongoDB host changes to:



mongodb://mongo:27017/campuseventhub

