const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth',          require('./routes/auth'));
app.use('/api/users',         require('./routes/users'));
app.use('/api/projects',      require('./routes/projects'));
app.use('/api/requests',      require('./routes/requests'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/admin',         require('./routes/admin'));
app.use('/api/achievements',  require('./routes/achievements'));
app.use('/api/messages',      require('./routes/messages'));
app.use('/api/friends',       require('./routes/friends'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/search',        require('./routes/search'));
app.use('/api/leaderboard',   require('./routes/leaderboard'));
app.use('/api/questions',     require('./routes/questions'));

app.get('/', (req, res) => res.json({ message: 'SIST SkillConnect API running' }));

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 10,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => { console.error('MongoDB error:', err); process.exit(1); });
