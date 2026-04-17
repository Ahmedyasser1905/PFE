import express from 'express';
import { supabase } from '../config/supabase';
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
        const userId = req.user!.id; // Supabase UUID
        const sessionId = providedSessionId || crypto.randomUUID();

        // 1. Save user message in Supabase
        await supabase.from('chat_messages').insert({
            user_id: userId,
            role: 'user',
            content: message,
            session_id: sessionId,
        });

        // 2. Get conversation history (last 20 messages)
        const { data: history } = await supabase
            .from('chat_messages')
            .select('role, content')
            .eq('user_id', userId)
            .eq('session_id', sessionId)
            .order('created_at', { ascending: true })
            .limit(20);

        const anthropicMessages = (history || []).map(m => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
        }));

        const systemPrompt = `Tu es un assistant spécialisé dans la construction et l'estimation de projets pour l'application BUILDEST. Tu aides les utilisateurs à comprendre leurs projets, calculs de matériaux, et estimations de coûts. Réponds toujours en français ou en arabe (selon la langue de l'utilisateur) de manière concise et professionnelle.`;

        const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

        let assistantContent: string;

        if (!anthropicApiKey) {
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

            const data = await response.json() as any;

            if (!response.ok) {
                console.error('[Chat] Anthropic API error:', data);
                return res.status(502).json({
                    message: 'AI service error. Please try again later.',
                });
            }

            assistantContent = data.content?.[0]?.text || 'No response from AI';
        }

        // 3. Save assistant response in Supabase
        await supabase.from('chat_messages').insert({
            user_id: userId,
            role: 'assistant',
            content: assistantContent,
            session_id: sessionId,
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
        const userId = req.user!.id;
        const sessionId = req.query.sessionId as string;

        let query = supabase
            .from('chat_messages')
            .select('role, content, session_id, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: true })
            .limit(100);

        if (sessionId) {
            query = query.eq('session_id', sessionId);
        }

        const { data: messages, error } = await query;
        if (error) throw error;

        res.json({ 
            messages: (messages || []).map(m => ({
                ...m,
                sessionId: m.session_id,
                createdAt: m.created_at
            }))
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// ─── DELETE /api/chat/history — Clear chat history ────────────────────────────
router.delete('/history', async (req: AuthRequest, res) => {
    try {
        const userId = req.user!.id;
        const sessionId = req.query.sessionId as string;

        let query = supabase.from('chat_messages').delete().eq('user_id', userId);
        if (sessionId) {
            query = query.eq('session_id', sessionId);
        }

        const { error } = await query;
        if (error) throw error;

        res.json({ message: 'Chat history cleared' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
