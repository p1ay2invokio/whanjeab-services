# ใช้ Node.js เวอร์ชัน Alpine (ขนาดเล็กและเบา)
FROM node:25-alpine

# กำหนด Working Directory ใน Container
WORKDIR /app

# Copy ไฟล์ package.json และ package-lock.json ก่อน (เพื่อใช้ Cache ของ Docker)
COPY package*.json ./

# ติดตั้ง Dependencies
RUN npm install

# Copy Source Code ทั้งหมดเข้าไป
COPY . .

# เปิด Port ที่แอปพลิเคชันจะรัน (เช่น 3000)
EXPOSE 3001

RUN "npx prisma generate"

# คำสั่งเริ่มต้นเมื่อ Container รัน (สำหรับ Dev แนะนำ npm run dev)
CMD ["npm", "start"]