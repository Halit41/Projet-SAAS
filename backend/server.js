const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./routes/auth");

const app = express();
app.use(cors());
app.use(express.json());

// Log global de toute requête
app.use((req, res, next) => {
  console.log("📩 Requête reçue :", req.method, req.url);
  next();
});

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("SmartLinks API is running ✅");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
