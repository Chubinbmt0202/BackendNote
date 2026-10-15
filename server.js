require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./src/routes');

// Middleware
app.use(cors()); // Cho phép Frontend gọi API
app.use(express.json()); // Đọc dữ liệu JSON từ request body
app.use(express.urlencoded({ extended: true })); // Đọc dữ liệu urlencoded nếu có

// Route kiểm tra server
app.get('/', (req, res) => {
    res.send('🚀 Backend Note API is running!');
});

// Router
app.use('/api', routes);


// Chạy server
const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
}

module.exports = app;