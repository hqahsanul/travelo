const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
const engine = require('ejs-locals')
const bodyParser = require('body-parser');
require('dotenv').config();
app.use(cors());
const mongoose = require('mongoose');
mongoose.set('debug', process.env.NODE_ENV === 'development');

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, 'static')))
app.set('views', path.join(__dirname, 'views'))
app.engine('ejs', engine)
app.set('view engine', 'ejs')

app.use((req, res, next) => {
  res.success = (data, msg) => {
    // console.log(data)
    res.status(200).json({
      success: true,
      data,
      msg,
    })
  }
  next()
});

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swagger.json');
app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customfavIcon: '/fav32.png',
    customSiteTitle: 'Metrimonial',
    authorizeBtn: false,
    swaggerOptions: {
      filter: true,
      displayRequestDuration: true,
    },
  }),
);

const port = process.env.PORT

const connectDB = require('./db/db');

app.use('/api', require('./routes/apiRoutes'));

const http = require('http');
server = http.createServer(app);
server.listen(port, () => console.log(`Server running on port ${port}`));
const io = require('socket.io')(server);



//-----------------------SOCKET IO------------------------------------------------




