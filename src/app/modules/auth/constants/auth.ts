// src/app/modules/auth/constants/auth.ts
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === 'true'
export const DEV_USERNAME = import.meta.env.VITE_DEV_USERNAME || 'dev'
export const DEV_PASSWORD = import.meta.env.VITE_DEV_PASSWORD || '1234'

export const DEV_USER = {
  id: 0,
  username: DEV_USERNAME,
  email: "dev@example.com",
  first_name: "Dev",
  last_name: "User",
  fullname: "Dev User",
  occupation: "Developer",
  companyName: "Development",
  phone: "0000000000",
  roles: [1],
  pic: "",
  language: "en",
  timeZone: "Asia/Jakarta",
}