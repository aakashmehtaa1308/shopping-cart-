const path = require('path');
const fs = require('fs');
const https = require('https');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const shortId = require('shortid');

const env = require('dotenv');
env.config();

const errorController = require('./controllers/errorpage');
const User = require('./models/user');
const Emitter = require('events');

// console.log(process.env.NODE_ENV);
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.rgsad.mongodb.net/${process.env.MONGO_DBNAME}`;

// function myDate() {
//   var d = new Date();
//   var n = d.toISOString();
//   return n;
// }

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});
const csrfProtection = csrf();

//for ssl connections..
// const privateKey = fs.readFileSync('server.key');
// const certificate = fs.readFileSync('server.cert');


//Event emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter);

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, shortId.generate() + '-' + file.originalname);
    // console.log(err);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');

const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'access.log'),
  { flags: 'a' }
);

// app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

const { emit } = require('process');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  // console.log("entered in my middleware with csrfToken ", req.csrfToken());
  // console.log(req.session.user.role);
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  // res.locals.isAdmin = true;
  if (req.session.isLoggedIn) {
    if (req.session.user.role === 'customer') {
      res.locals.isAdmin = false;
    } else {
      res.locals.isAdmin = true;
    }
  }

  next();
});

app.use((req, res, next) => {
  // throw new Error('Sync Dummy');
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500Page);

app.use(errorController.get404Page);

app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  console.log(error);
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
  });
});

//for ssl connection.
// const server = https
//   .createServer({ key: privateKey, cert: certificate }, app)
//   .listen(process.env.PORT || 3000);

const server = app.listen(process.env.PORT || 3000);
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log('connected!!!!');
    // app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  //join
  // console.log(socket.id);
  socket.on('join', (orderId) => {
    // console.log(orderId);
    socket.join(orderId);
  });
});

eventEmitter.on('orderUpdated', (data) => {
  io.to(`order_${data.id}`).emit('orderUpdated', data);
});

// eventEmitter.on('orderPlaced', () => {
//   io.to('adminRoom').emit('orderPlaced', data);
// })
