const express = require("express");
 const userRouter = require("./routes/user.routes");
 const universityRouter=require('./routes/university.routes.js')
 const organizationRouter=require("./routes/organization.routes.js");
 const adminRouter=require("./routes/admin.routes.js");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const globalError = require("./controllers/error-controller/error.controller");
const path=require('path')
const fs=require('fs')
// const sanitizeInput = require("./middleware/sanitizeInputs");
// const ExpressMongoSanitize = require("express-mongo-sanitize");
const app = express();

require("./database/db.js")();
app.use(cookieParser());
// app.use(ExpressMongoSanitize())
app.use(
  cors({
    origin: [],
    credentials: true,
  },
)
);

app.use("/static",express.static(path.join(__dirname, './build/static'),{
  maxAge:86400000,
setHeaders: (res, path) => {
    if (path.endsWith('.js') || path.endsWith('.css') || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.jpeg')||
path.endsWith('.jsx')) {
      res.setHeader('Cache-Control', 'public, max-age=' + 86400000);
    }
  },
}));
app.get('/bulc.png', (req, res) => {
  const faviconPath = path.join(__dirname, './build/bulc.png');
  fs.readFile(faviconPath, (err, data) => {
    if (err) {
      console.error('Error reading favicon file:', err);
      res.status(404).end();
    } else {
      res.setHeader('Content-Type', 'image/x-icon');
      res.send(data);
    }
  });
});
// Handle all routes on the server side and serve index.html
app.get(/^(?!\/api\b).*|^\/?$/
, (req, res) => {
  const indexHtml = fs.readFileSync(path.join(__dirname, './build/index.html'), 'utf8');
  res.send(indexHtml);
});
app.use(express.json());
// app.use(sanitizeInput)
app.use(express.urlencoded({ extended: true }));
app.use("/api/v1/user", userRouter);
app.use("/api/v1/university", universityRouter);
app.use("/api/v1/organization", organizationRouter);
app.use("/api/v1/admin",adminRouter);
app.use(globalError);
module.exports = app;
