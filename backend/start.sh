#!/bin/sh

echo "Starting application setup..."

# Chờ database sẵn sàng (nếu cần)
echo "Waiting for database to be ready..."
sleep 5

# # Chạy migrations
# echo "Running database migrations..."
# npx sequelize-cli db:migrate

# # Chạy seeders
# echo "Running database seeders..."
# npx sequelize-cli db:seed:all

# Khởi động ứng dụng
echo "Starting the application..."
npm start
