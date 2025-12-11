// src/app/modules/auth/core/devHelper.ts
import {UserModel} from './_models'

// Check if we're in development mode
export const IS_DEV_MODE = import.meta.env.DEV

// Dev credentials
export const DEV_CREDENTIALS = {
  email: 'dev',
  password: '1234',
}

// Dev user data
export const DEV_USER: UserModel = {
  id: 0,
  username: 'dev',
  password: undefined,
  email: 'dev@example.com',
  first_name: 'Dev',
  last_name: 'User',
  fullname: 'Dev User',
  occupation: 'Developer',
  companyName: 'Development',
  phone: '0000000000',
  roles: [1],
  pic: '',
  language: 'en',
  timeZone: 'Asia/Jakarta',
  website: 'https://keenthemes.com',
  emailSettings: {
    emailNotification: true,
    sendCopyToPersonalEmail: false,
  },
  auth: {
    token: 'dev-token',
  },
  communication: {
    email: true,
    sms: false,
    phone: false,
  },
  address: {
    addressLine: 'Dev Street',
    city: 'Jakarta',
    state: 'ID',
    postCode: '12345',
  },
  socialNetworks: {
    linkedIn: '',
    facebook: '',
    twitter: '',
    instagram: '',
  },
}

// Check if credentials match dev credentials
export const isDevLogin = (email: string, password: string): boolean => {
  return email === DEV_CREDENTIALS.email && password === DEV_CREDENTIALS.password
}