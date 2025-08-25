# ========== Base image ==========
FROM node:20-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Sao chép package.json và package-lock.json (nếu có)
COPY package*.json ./

# Cài đặt dependencies (bao gồm cả dev dependencies cho sequelize-cli)
RUN npm ci

# Sao chép toàn bộ source code
COPY . .

# Cấp quyền execute cho script start
RUN chmod +x start.sh

# Thiết lập biến môi trường
ENV NODE_ENV=production

# Expose port 5000
EXPOSE 5000

# Chạy script khởi động (migrations + seeders + start app)
CMD ["./start.sh"]