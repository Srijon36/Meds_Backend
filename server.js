const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

// ================= CORS =================
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://1313kfc0-5173.inc1.devtunnels.ms",
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ================= HTTP + SOCKET.IO =================

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: corsOptions,
});

app.set("io", io);


// ================= SOCKET HANDLERS =================

require("./sockets/inventory.socket")(io);
require("./sockets/emergency.socket")(io);


// ================= CONTROLLERS =================
// FIXED FOR RENDER LINUX CASE-SENSITIVE PATH

const {
  createDefaultAdmin,
} = require("./controllers/registercontroller/registerController");


// ================= DATABASE =================

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected Successfully");

    if (createDefaultAdmin) {
      await createDefaultAdmin();
      console.log("✅ Default admin checked");
    }
  })
  .catch((err) => {
    console.log(
      "❌ MongoDB Connection Failed:",
      err.message
    );
  });


// ================= ROUTES =================

const loginRoutes = require("./routers/loginroutes/loginroutes");

const registerRoutes = require("./routers/registerroutes/registerroutes");

const adminRoutes = require("./routers/adminroutes/adminroutes");

const pharmacyRoutes = require("./routers/pharmacyroutes/pharmacyroutes");

const medicineRoutes = require("./routers/medicineroutes/medicineroutes");

const reservationRoutes = require("./routers/reservationroutes/reservationroutes");

const emergencyRoutes = require("./routers/emergencyroutes/emergencyroutes");

const notificationRoutes = require("./routers/notificationroutes/notificationroutes");


// ================= USE ROUTES =================

app.use(
  "/api/logins",
  loginRoutes
);

app.use(
  "/api/registers",
  registerRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/pharmacies",
  pharmacyRoutes
);

app.use(
  "/api/medicines",
  medicineRoutes
);

app.use(
  "/api/reservations",
  reservationRoutes
);

app.use(
  "/api/emergency",
  emergencyRoutes
);

app.use(
  "/api/notifications",
  notificationRoutes
);


// ================= TEST API =================

app.get("/", (req, res) => {

  res.status(200).json({
    success:true,
    message:
      "QuickMeds Backend running successfully 🚀",
  });

});


// ================= ERROR HANDLER =================

app.use((err, req, res, next)=>{

  console.error(
    "❌ Error:",
    err.message
  );

  res
  .status(err.status || 500)
  .json({
    success:false,
    message:
      err.message ||
      "Internal Server Error",
  });

});


// ================= SERVER =================

const PORT =
  process.env.PORT || 5000;


httpServer.listen(PORT,()=>{

  console.log(
    `🚀 Server running on port ${PORT}`
  );

  console.log(
    "🔌 Socket.io ready"
  );

});