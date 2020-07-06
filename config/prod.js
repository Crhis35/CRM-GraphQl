// module.exports = {
//   googleClientId:
//     '392066281887-uni9ubfc16sp5cdlkhmssm57nu6vv603.apps.googleusercontent.com',
//   googleClientSecret: 'BG13Y_6jwcM-CT7EB2UNUJT-',
//   mongoURI:
//     'mongodb+srv://crhis:pNk7M1kj7uTgSPiR@cluster0-pvwyu.mongodb.net/emaily?retryWrites=true&w=majority',
//   mongoURILocal: 'mongodb://localhost:27017/emaily',
//   cookieKey: 'dasldnkassadsadasdasdklnsdasldnksaldlsadn',
// };
module.exports = {
  mongoURI: process.env.MONGO_URI,
  jwtSecret: 'perreoinminetexxd',
  jwtExpiresIn: '24h',
};
