import express from 'express';
import ChatMessage from '../models/ChatMessage';
import { protect, AuthRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { sendChatSchema } from '../validators/schemas';
import crypto from 'crypto';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// ─── POST /api/chat — Send message & get AI response ─────────────────────────
router.post('/', validateBody(sendChatSchema), async (req: AuthRequest, res) => {
    try {
        const { message, sessionId: providedSessionId } = req.body;
        const userId = req.user!._id;
        const sessionId = providedSessionId || crypto.randomUUID();

        // Save user message
        await ChatMessage.create({
            userId,
            role: 'user',
            content: message,
            sessionId,
        });

        // Get conversation history for this session (last 20 messages for context)
        const history = await ChatMessage.find({ userId, sessionId })
            .sort({ createdAt: 1 })
            .limit(20)
            .select('role content')
            .lean();

        const anthropicMessages = history.map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));

        const systemPrompt = `Tu es un assistant spécialisé dans la construction et l'estimation de projets pour l'application BUILDEST. Tu aides les utilisateurs à comprendre leurs projets, calculs de matériaux, et estimations de coûts. Réponds toujours en français ou en arabe (selon la langue de l'utilisateur) de manière concise et professionnelle.`;

        const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

        let assistantContent: string;

        if (!anthropicApiKey) {
            // Fallback response when API key is not configured
            assistantContent = "Le service AI n'est pas configuré. Veuillez contacter l'administrateur pour configurer la clé API Anthropic.";
            console.warn('[Chat] ANTHROPIC_API_KEY not set — returning fallback response');
        } else {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': anthropicApiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1024,
                    system: systemPrompt,
                    messages: anthropicMessages,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('[Chat] Anthropic API error:', data);
                return res.status(502).json({
                    message: 'AI service error. Please try again later.',
                });
            }

            assistantContent = data.content?.[0]?.text || 'No response from AI';
        }

        // Save assistant response
        await ChatMessage.create({
            userId,
            role: 'assistant',
            content: assistantContent,
            sessionId,
        });

        res.json({
            sessionId,
            message: {
                role: 'assistant',
                content: assistantContent,
            },
        });
    } catch (error: any) {
        console.error('[Chat] Error:', error.message);
        res.status(500).json({ message: 'Chat service error' });
    }
});

// ─── GET /api/chat/history — Get chat history ─────────────────────────────────
router.get('/history', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!._id;
        const sessionId = req.query.sessionId as string;

        const filter: any = { userId };
        if (sessionId) {
            filter.sessionId = sessionId;
        }

        const messages = await ChatMessage.find(filter)
            .sort({ createdAt: 1 })
            .limit(100)
            .select('role content sessionId createdAt')
            .lean();

        res.json({ messages });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── DELETE /api/chat/history — Clear chat history ────────────────────────────
router.delete('/history', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!._id;
        const sessionId = req.query.sessionId as string;

        const filter: any = { userId };
        if (sessionId) {
            filter.sessionId = sessionId;
        }

        await ChatMessage.deleteMany(filter);

        res.json({ message: 'Chat history cleared' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
