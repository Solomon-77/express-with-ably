import type { Request, Response } from "express";
import Ably from 'ably'

const rest = new Ably.Rest({ key: process.env.ABLY_KEY });

export async function authHandler(req: Request, res: Response) {
    const { username } = req.body;

    if (!username) {
        res.status(400).json({ error: 'Username required' });
        return;
    }

    try {
        const tokenRequest = await rest.auth.createTokenRequest({ clientId: username });
        res.json(tokenRequest);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}