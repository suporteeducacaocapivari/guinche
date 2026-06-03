// ================================================================
// SUPABASE CLIENT - Configuração compartilhada
// ================================================================
// ATENÇÃO: Substitua pelos valores do seu projeto
// URL: Settings > API > Project URL
// ANON_KEY: Settings > API > anon public
// ================================================================

const SUPABASE_URL = 'https://vicxjzsfqloedmayejoy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpY3hqenNmcWxvZWRtYXllam95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0NTUxMDcsImV4cCI6MjA5NjAzMTEwN30.oYHkOqAdizsJqFie8nJmZLk8IAFlu3pFuWeotXIJTCs';

// Carrega a biblioteca Supabase via CDN
// Usando importmap no HTML para compatibilidade
let supabaseClient = null;

function initSupabase() {
  if (typeof supabase !== 'undefined' && !supabaseClient) {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });
    console.log('✅ Supabase client initialized');
    return supabaseClient;
  }
  return supabaseClient;
}

// ================================================================
// API DE SENHAS - Todas as operações do banco
// ================================================================

const SenhaAPI = {
  // Obtém o cliente (inicializa se necessário)
  getClient() {
    if (!supabaseClient) initSupabase();
    return supabaseClient;
  },

  // ==========================================
  // CONTADOR
  // ==========================================
  async getContador() {
    const client = this.getClient();
    const { data, error } = await client
      .from('contador')
      .select('valor')
      .eq('id', 1)
      .single();
    if (error) throw error;
    return data.valor || 0;
  },

  async incrementarContador() {
    const client = this.getClient();
    // Usa RPC ou incremento manual
    // Como vamos chamar após criar a senha, apenas lemos e incrementamos
    const { data, error } = await client
      .from('contador')
      .select('valor')
      .eq('id', 1)
      .single();
    if (error) throw error;
    const novoValor = (data.valor || 0) + 1;
    const { error: updateError } = await client
      .from('contador')
      .update({ valor: novoValor })
      .eq('id', 1);
    if (updateError) throw updateError;
    return novoValor;
  },

  // ==========================================
  // SENHA ATUAL
  // ==========================================
  async getSenhaAtual() {
    const client = this.getClient();
    const { data, error } = await client
      .from('senha_atual')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw error;
    return data;
  },

  async setSenhaAtual(numero, guiche, senhaFormatada) {
    const client = this.getClient();
    const timestamp = Date.now();
    const { error } = await client
      .from('senha_atual')
      .update({
        numero: numero,
        guiche: guiche,
        timestamp: timestamp,
        senha_formatada: senhaFormatada
      })
      .eq('id', 1);
    if (error) throw error;
    return { numero, guiche, timestamp, senha_formatada: senhaFormatada };
  },

  // ==========================================
  // HISTÓRICO
  // ==========================================
  async getHistorico() {
    const client = this.getClient();
    const { data, error } = await client
      .from('historico')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(5);
    if (error) throw error;
    return data || [];
  },

  async adicionarHistorico(numero, guiche, senhaFormatada) {
    const client = this.getClient();
    const timestamp = Date.now();
    const { error } = await client
      .from('historico')
      .insert({
        numero: numero,
        guiche: guiche,
        timestamp: timestamp,
        senha_formatada: senhaFormatada
      });
    if (error) throw error;

    // Mantém só os últimos 5 registros no histórico
    await client.rpc('limpar_historico_antigo', { max_registros: 5 });

    return { numero, guiche, timestamp, senha_formatada: senhaFormatada };
  },

  // ==========================================
  // TRIGGER CHAMAR NOVAMENTE
  // ==========================================
  async triggerChamarNovamente() {
    const client = this.getClient();
    const timestamp = Date.now();
    // Alterna entre true/false para garantir que o change event dispare
    const { data } = await client
      .from('trigger_chamar')
      .select('ativo')
      .eq('id', 1)
      .single();

    const novoAtivo = !(data?.ativo ?? false);
    const { error } = await client
      .from('trigger_chamar')
      .update({
        ativo: novoAtivo,
        timestamp: timestamp
      })
      .eq('id', 1);
    if (error) throw error;
    return true;
  },

  // ==========================================
  // CHAMAR PRÓXIMA SENHA (Operação completa)
  // ==========================================
  async chamarProximaSenha(guiche) {
    const client = this.getClient();
    
    // Incrementa contador
    const novoNumero = await this.incrementarContador();
    
    // Formata a senha
    const senhaFormatada = `S${String(novoNumero).padStart(3, '0')}`;
    
    // Atualiza senha atual
    await this.setSenhaAtual(novoNumero, guiche, senhaFormatada);
    
    // Adiciona ao histórico
    await this.adicionarHistorico(novoNumero, guiche, senhaFormatada);
    
    return {
      numero: novoNumero,
      guiche: guiche,
      senhaFormatada: senhaFormatada
    };
  },

  // ==========================================
  // CHAMAR SENHA MANUAL
  // ==========================================
  async chamarSenhaManual(numero, guiche) {
    const client = this.getClient();
    const senhaFormatada = `S${String(numero).padStart(3, '0')}`;
    
    await this.setSenhaAtual(numero, guiche, senhaFormatada);
    await this.adicionarHistorico(numero, guiche, senhaFormatada);
    
    return {
      numero: numero,
      guiche: guiche,
      senhaFormatada: senhaFormatada
    };
  },

  // ==========================================
  // REAL-TIME LISTENERS
  // ==========================================
  onSenhaAtualChange(callback) {
    const client = this.getClient();
    const channel = client
      .channel('senha-atual-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'senha_atual',
          filter: 'id=eq.1'
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
    return channel;
  },

  onTriggerChamarChange(callback) {
    const client = this.getClient();
    const channel = client
      .channel('trigger-chamar-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'trigger_chamar',
          filter: 'id=eq.1'
        },
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();
    return channel;
  },

  onHistoricoChange(callback) {
    const client = this.getClient();
    const channel = client
      .channel('historico-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'historico'
        },
        async (payload) => {
          // Busca o histórico completo atualizado
          const historico = await this.getHistorico();
          callback(historico);
        }
      )
      .subscribe();
    return channel;
  }
};