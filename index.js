const express = require('express');
const bodyParser= require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(bodyParser.json({limit : '10mb'}));
app.use(bodyParser.urlencoded({limit : '10mb', extended : true}));

app.get("/", (req, res, next) => {
    res.sendFile('/index.html');
});

app.use("/", require("./routes"));

app.listen(3000, () => {
    console.log("listening to port 3000");
})