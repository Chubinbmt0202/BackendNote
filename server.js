require('dotenv').config();
const express = require('express');
const cors = require('cors');
const supabase = require('./src/config/supabase');
const app = express();
const routes = require('./src/routes');

// Middleware
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Đọc dữ liệu JSON từ request body

// Route kiểm tra server
app.get('/', (req, res) => {
    res.send('🚀 Backend Note API is running!');
});

// Router
app.use('/api', routes);




// Chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});