import express from "express"
import { authHandler } from "../api_functions/ably_auth_handler.js"

const router = express.Router()

// ABLY Routes
router.post('/ably/authHandler', authHandler)

export default router