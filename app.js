const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const passport = require("passport");

const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin")

require("./config/passport");

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(session({
    secret: 'secret', 
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/user-authentication", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Error connecting to MongoDB:", err));

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});