# ===== Builder =====
FROM node:20-alpine AS builder
WORKDIR /app

# Sao chép package.json và package-lock.json
COPY package*.json ./

# Cài đặt dependencies
RUN npm ci

# Sao chép source code
COPY . .

# Build ứng dụng (Vite sẽ output vào thư mục "dist")
RUN npm run build


# ===== Nginx runner =====
FROM nginx:1.27-alpine

# Copy cấu hình nginx cho SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output từ Vite (thư mục dist) sang nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Thêm file health check
RUN echo "ok" > /usr/share/nginx/html/health

# Expose port 80
EXPOSE 80

# Chạy nginx
CMD ["nginx", "-g", "daemon off;"]