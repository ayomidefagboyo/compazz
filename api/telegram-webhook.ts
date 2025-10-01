import { VercelRequest, VercelResponse } from '@vercel/node';

// We'll import the bot service dynamically to avoid issues
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Import bot service dynamically
    const TelegramBotService = (await import('../src/services/telegramBot')).default;

    // Create bot instance
    const bot = new TelegramBotService({
      token: process.env.TELEGRAM_BOT_TOKEN || process.env.VITE_TELEGRAM_BOT_TOKEN || '',
      webhookUrl: `${process.env.VERCEL_URL || 'https://yourapp.vercel.app'}/api/telegram-webhook`,
      botUsername: process.env.TELEGRAM_BOT_USERNAME || process.env.VITE_TELEGRAM_BOT_USERNAME || 'CompazzAI_bot'
    });

    // Handle the webhook update
    await bot.handleWebhook(req.body);

    // Send success response
    res.status(200).json({
      ok: true,
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Webhook error:', error);

    // Send error response
    res.status(500).json({
      ok: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}