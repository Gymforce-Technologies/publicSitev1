'use server'
import { cookies } from 'next/headers'
import { decryptToken, encryptToken, setAccessToken } from './Acces'
import axios from 'axios'

// Define types for better type safety
type CookieOptions = {
  httpOnly: boolean
  secure: boolean
  sameSite: 'strict' | 'lax' | 'none'
  maxAge: number
}

const REFRESH_TOKEN_NAME = 'refreshToken'
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 

const getCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: REFRESH_TOKEN_MAX_AGE,
})

export const setRefreshToken = async (token: string): Promise<void> => {
  try {
    const encryptedToken = encryptToken(token)
    cookies().set(REFRESH_TOKEN_NAME, encryptedToken, getCookieOptions())
  } catch (error) {
    console.error('Error setting refresh token:', error)
    throw new Error('Failed to set refresh token')
  }
}

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    const encryptedToken = cookies().get(REFRESH_TOKEN_NAME)?.value
    return encryptedToken ? decryptToken(encryptedToken) : null
  } catch (error) {
    console.error('Error getting refresh token:', error)
    return null
  }
}

export const clearRefreshToken = async (): Promise<void> => {
  try {
    cookies().delete(REFRESH_TOKEN_NAME)
  } catch (error) {
    console.error('Error clearing refresh token:', error)
    throw new Error('Failed to clear refresh token')
  }
}

export const getnewTokens = async () => {
  const URL = process.env.NEXT_PUBLIC_URL;
  const refreshToken = await getRefreshToken();
    const Req = `${URL}/api/refresh-token/`;
    const response = await axios.post(Req, {
        "refresh_token": refreshToken
    }, {
        headers: {
            'Content-Type': 'application/json',
        }
    });
    console.log()
    const newAccessToken = response.data.access;
    const newRefreshToken = response.data.refresh;
    setAccessToken(newAccessToken);
    setRefreshToken(newRefreshToken);
}