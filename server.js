const mongoose = require('mongoose');
const app = require('./app');
const keys = require('./config/keys');

(async () => {
  try {
    await mongoose.connect(keys.mongoURI, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log('DB Sucessfully connected');
  } catch (err) {
    console.log(err);
  }
})();

app.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server running on port ${url}`);
});
