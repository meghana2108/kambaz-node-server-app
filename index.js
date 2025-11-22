import express from "express";
import cors from "cors";
import session from "express-session";
import "dotenv/config";

import Hello from "./Hello.js";
import Lab5 from "./Lab5/index.js";
import Kambaz from "./Kambaz/index.js";

const app = express();

// ⭐ CORS – allow cookies + restrict to React app
app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  })
);

// ⭐ SESSION CONFIGURATION
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "kambaz",
  resave: false,
  saveUninitialized: false,
};

// ⭐ In production, secure cookies
if (process.env.SERVER_ENV !== "development") {
  sessionOptions.proxy = true;
  sessionOptions.cookie = {
    sameSite: "none",
    secure: true,
    domain: process.env.SERVER_URL,
  };
}

// ⭐ Must be BEFORE routes, AFTER CORS
app.use(session(sessionOptions));

// ⭐ JSON middleware
app.use(express.json());

// ⭐ Routes
Lab5(app);
Hello(app);
Kambaz(app);

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});
