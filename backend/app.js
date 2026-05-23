require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
const authRoutes = require("./routes/authRoutes");
const { connectingdb } = require("./connection");
const testRoutes = require("./routes/testRoutes");
const questionRoutes = require("./routes/questionRoutes");
const attemptRoutes = require("./routes/testAttemptRoutes");
const sandboxRoutes = require("./routes/sandboxRoutes");
const resultRoutes = require("./routes/resultRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const assessmentRoutes = require("./routes/assessmentRoutes");
const userRoutes = require("./routes/userRoutes");
const assessmentAttemptRoutes = require("./routes/assessmentAttemptRoutes");
const mcqRoutes = require("./routes/mcqRoutes");
const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.CLIENT_URL,
      "http://127.0.0.1:5173",
      process.env.BACKEND_URL,
      "localhost:8080"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);
app.options(/.*/, cors());

connectingdb();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/auth", authRoutes);
app.use("/questions", questionRoutes);
app.use("/tests", testRoutes);
app.use("/attempt", attemptRoutes);
app.use("/sandbox", sandboxRoutes);
app.use("/result", resultRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/assessment", assessmentRoutes);
app.use("/users", userRoutes);
app.use("/assessmentattempt", assessmentAttemptRoutes);
app.use("/checkmcq", mcqRoutes);
app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(process.env.PORT, () => {
  console.log(`server started at port ${process.env.PORT} `);
});
