var express = require("express"),
    Storage = require("./storage"),
    app = express();

var storage = new Storage();
storage.setup().then(function() {
  app.listen(process.env.PORT || 80, function() {
    console.log('Server started');
  });
});

app.get("/", function (req, res) {
  storage.populate(1234).then(storage.score.bind(storage)).then(function(score) {
    res.send("Hello world, " + score + "!");
  });
});
