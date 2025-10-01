import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TradeSignal {
  poolId: string;
  agentId: string;
  asset: string;
  tradeType: 'long' | 'short';
  amount: number;
  leverage: number;
  entryPrice: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (req.method === 'POST') {
      const signal: TradeSignal = await req.json();

      const { data: agent } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('id', signal.agentId)
        .eq('is_active', true)
        .maybeSingle();

      if (!agent) {
        return new Response(
          JSON.stringify({ error: 'Agent not found or inactive' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: trade, error: tradeError } = await supabase
        .from('trades')
        .insert({
          pool_id: signal.poolId,
          executed_by_agent: signal.agentId,
          trade_type: signal.tradeType,
          asset: signal.asset,
          entry_price: signal.entryPrice,
          amount: signal.amount,
          leverage: signal.leverage,
          status: 'open',
        })
        .select()
        .single();

      if (tradeError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create trade', details: tradeError }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      await supabase
        .from('ai_agents')
        .update({
          total_trades: agent.total_trades + 1,
          last_trade_at: new Date().toISOString(),
        })
        .eq('id', signal.agentId);

      return new Response(
        JSON.stringify({ success: true, trade }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const poolId = url.searchParams.get('poolId');

      if (!poolId) {
        return new Response(
          JSON.stringify({ error: 'poolId required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: agents } = await supabase
        .from('ai_agents')
        .select('*')
        .eq('pool_id', poolId)
        .eq('is_active', true);

      return new Response(
        JSON.stringify({ agents: agents || [] }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in ai-trade-executor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});