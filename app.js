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
function statusCode(code = undefined, message = undefined, data = undefined) {
  return (baseJson = {
    code: code,
    message: message,
    data: data,
  });
}
// sua 
// app.put('/suaUser', function (req, res,next) {
//   upload(req, res, function (err) {
//     if (err instanceof multer.MulterError) {
//       res.send(err);
//     } else if (err) {
//       res.json(statusCode(400, err));
//     } else {
//       var update = {
//         name: req.body.name,
//         password: req.body.password,
//         date: req.body.date,
//         email: req.body.email,
//         gioitinh: req.body.gioitinh,
//         sothich: req.body.sothich,
//         gioithieu: req.body.gioithieu,
//        // avatars: req.files.map((file) => "upload/" + file.filename),
//       };
//       connectUsers
//         .findByIdAndUpdate(mongoose.Types.ObjectId(req.body.id), update)
//         .then(function (user) {
//           if (user) {
//             // thành công
//             res.json(statusCode(200, "Success", user));
//           } else {
//             // không tìm thấy user theo id nhận đc
//             res.json(statusCode(404, "Not Found", err));
//           }
//         })
//         .catch((err) => {
//           // lỗi server khong thể update
//           res.json(statusCode(500, "Server Error", err));
//         });
//     }
//   });
// });
// óa react
app.delete('/delete2', function (req, res, next) {

  connectUsers.deleteOne({ _id: req.body._id }, function (err, user) {
    return err
      ? res.json(statusCode(404, "Not Found", err))
      : res.json(statusCode(200, "Success", user));
  });

})
//them react
app.post('/insertUser2', function (req, res) {
  console.log('hbjnkml,')
  upload(req, res, function (err) {

    if (err instanceof multer.MulterError) {
      res.send(err);
    } else if (err) {
      res.json(statusCode(400, err));
    } else {
      connectUsers = db.model("users", user);

      // userSchema thay bằng schema giống ở hàm update làm ở lab67
      const user1 = new connectUsers({
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
      user1.save(function (err) {
        // lỗi không thể thêm
        if (err) res.json(statusCode(500, "Server Error", err));
        // thêm thành công
        else res.json(statusCode(200, "Success", user1));
      });
    }
  })
});
// them sever
app.post("/insertUser", (req, res, next) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      console.log(err);
    } else if (err) {
      // An unknown error occurred when uploading.
      console.log(err);
    }
    else {
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
app.get('/edit/:id', function (request, response) {
  response.render('edit', { id: request.params.id });
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
app.post('/deleteUser', function (request, respone) {
  console.log(request.body)
  var connectUsers = db.model("users", user);
  connectUsers.findByIdAndDelete( request.body._id, function (err) {
    // if(err){
    //   console.log(err)
    // }
    // else{
    //   respone.json()
    // }
    // console.log(request.params.id);
    // respone.redirect("/user");

    if (err) {
      respone.json({ errCode: 500, errMess: err })
    }
    else {
      connectUsers.find({}).then(users => {
        respone.render('user', { users: users.map(obj => obj.toJSON(obj)) })
        respone.json({ errCode: "Xóa thành công!", errMess: 200 })
      })
    }
  })
});
// sua 
// app.post("/updateUser", (req, res, next) => {

//   upload(req, res, function (err) {
//     if (err instanceof multer.MulterError) {
//       res.send(err);
//     } else if (err) {
//       res.send(err);
//     } else {
//       var update = {
//         email: req.body.email,
//         password: req.body.password,
//         name: req.body.name,
//         date: req.body.date,
//         gioitinh: req.body.gioitinh,
//         sothich: req.body.sothich,
//         gioithieu: req.body.gioithieu,
//         avatars: req.body.avatars,

//       };
//       connectUsers = db.model("users", user).updateOne({ _id: req.body._id }, update, function (err, user) {
//           if(err){
//             res.json(statusCode(500,"Error",null))
//           }
//           else{
//             // res.redirect('/user')
//             res.json(statusCode(200, "Ok", user))
//           }
//       })

//       // connectUsers
//       //   .findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id), update)
//       //   .then(function (user) {
//       //     res.redirect("/user");
//       //   })
//       //   .catch((err) => console.log(err));

//   }});

// });

app.post('/updateUser', function (req, res) {
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
  connectUsers = db.model("users", user).updateOne({ _id: req.body._id }, update, function (err, user) {
    if (err) {
      res.json({ errCode: 500, errMess: err })
    }
    else {
      res.render('user')
      res.json({ errCode: 200, errMess: "Ok" })
    }
  })
})



app.post('/login', function (request, response) {

  response.redirect('/login');
});
app.post('/dangki', function (request, response) {

  response.redirect('/dangki');
});
app.post('/insertUser', function (request, response) {
  response.redirect('/user');
});
app.post('/user', function (request, response) {
  response.redirect('/user')
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
