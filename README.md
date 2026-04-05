# store-api

Backend API + Frontend UI

### Run backend

1. Tạo file môi trường tại `backend/.env` với nội dung mẫu:
```
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/storedb
JWT_SECRET=your-secret-key
```
2. Chạy backend:
```
cd backend
npm install
npm run dev
```
### Seed role vào database
```
cd backend
npm run seed
```
### Run frontend
```
Frontend hiện là static React (CDN), không cần build tool.
```
Tùy chọn 1 - chạy bằng npm:
```
cd frontend
npm install
npm run dev
```
Tùy chọn 2 - mở trực tiếp file:
```
Mở `frontend/index.html` bằng trình duyệt.
```

### Tải thêm cái này vào backend

```
npm install express-rate-limit
```