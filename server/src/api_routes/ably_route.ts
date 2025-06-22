import express from "express"
import { authHandler } from "../api/ably_auth_handler.js"

const router = express.Router()

router.post('/authHandler', authHandler)

export default router