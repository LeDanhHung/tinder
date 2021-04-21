var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

const mongoose = require("mongoose");
var multer = require("multer");
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/tmp/my-uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})

var upload = multer({ storage: storage }).array('avatars');


var urlDb =
  "mongodb+srv://admin:admin@cluster0.fcoai.mongodb.net/tinder?retryWrites=true&w=majority";
mongoose.connect(urlDb, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
});
const { Schema } = mongoose;
const user = new Schema({
  email: String,
  password: String,
  name: String,
  date: String,
  gioitinh: String,
  gioithieu: String,
  sothich: String,
  avatars: Array,
});
var connectUsers;
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("kết nối thành công");

});

app.post("/insertUser", (req, res, next) => {
  upload(req,res,function(err){
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.log(err);
    } else if (err) {
      // An unknown error occurred when uploading.
      console.log(err);
    }
    else{
      connectUsers = db.model("users", user);
      connectUsers({
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        date: req.body.date,
        gioitinh: req.body.gioitinh,
        sothich: req.body.sothich,
        gioithieu: req.body.gioithieu,
        avatars: req.body.avatars,
      }).save(function (err) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/");
        }
      });
    }
  })
 
});

app.get('/login', function (request, response) {

  response.render('login');
});
app.get('/edit/:id',function(request,response){
  response.render('edit',{id:request.params.id});
})
app.get('/dangki', function (request, response) {
  response.render('dangki');
});
app.get('/user', function (request, response) {
  var connectUsers = db.model("users", user);
  connectUsers.find({}, function (err, users) {
    if (err) {
      console.log(err);
    } else {
      response.render('user', { users: users });
    }
  });
});

app.get('/userApi', function (request, response) {
  var connectUsers = db.model("users", user);
  connectUsers.find({}, function (err, users) {
    if (err) {
      console.log(err);
    } else {
      response.json(users);
    }
  });
});
// xoa
app.post('/:id',function (request,respone) {
  connectUsers = db.model("users", user);
  connectUsers.deleteOne({ _id: request.params.id},function(err,user){
    console.log(request.params.id);
    respone.redirect("/user");
  })
});
// sua 
app.post("/updateUser/:id", (req, res, next) => {
  connectUsers = db.model("users", user);
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.send(err);
    } else if (err) {
      res.send(err);
    } else {
      var update = {
        email: req.body.email,
        password: req.body.password,
        name: req.body.name,
        date: req.body.date,
        gioitinh: req.body.gioitinh,
        sothich: req.body.sothich,
        gioithieu: req.body.gioithieu,
        avatars: req.body.avatars,
       
      };
      connectUsers
        .findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), update)
        .then(function (user) {
          res.redirect("/user");
        })
        .catch((err) => console.log(err));
    }
  });

});

function statusCode(code = undefined, message = undefined, data = undefined) {
  return (baseJson = {
    code: code,
    message: message,
    data: data,
  });
}
//them user 
router.get("/themUser", function (req, res, next) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.send(err);
    } else if (err) {
      res.json(statusCode(400, err));
    } else {
      
      const user = new Schema({
        // userName, password,… viết theo đối tượng trên csdl
        name: req.body.name,
        password: req.body.password,
        date: req.body.date,
        email: req.body.email,
        gioitinh: req.body.gioitinh,
        sothich: req.body.sothich,
        gioithieu: req.body.gioithieu,
      //  avatars: req.files.map((file) => "upload/" + file.filename),
      });
      user.save(function (err) {
        // lỗi không thể thêm
        if (err) res.json(statusCode(500, "Server Error", err));
        // thêm thành công
        else res.json(statusCode(200, "Success", user));
      });
    }
  });

});



app.post('/login', function (request, response) {

  response.redirect('/login');
});
app.post('/dangki', function (request, response) {

  response.redirect('/dangki');
});
app.post('/insertUser', function (request, response) {
  response.redirect('/user');
});
app.post('/user',function(request,response) {
  response.redirect('/user')
});
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
