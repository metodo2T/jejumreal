import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Configurado para permitir requisições POST da Kiwify
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Envie apenas POST.' });
  }

  try {
    const payload = req.body;
    
    // Essas variáveis serão colocadas no painel do Vercel
    const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Faltam variáveis de ambiente (SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY).');
      return res.status(500).json({ error: 'Falta configuração do servidor.' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Na Kiwify, status aprovado costuma vir em `order_status` ou `order.status`
    const status = payload?.order?.status || payload.order_status;
    const customer = payload?.Customer || payload?.customer;

    if (status !== 'approved' && status !== 'paid') {
      return res.status(200).json({ message: 'Ação ignorada: status do carrinho não é "Aprovado".' });
    }

    const email = customer?.email;
    const name = customer?.full_name || customer?.first_name || 'Aluno Vip';
    
    if (!email) {
      return res.status(400).json({ error: 'Email não encontrado nos dados da compra.' });
    }

    // Gerar uma senha provisória de 6 dígitos pro usuário (ele pode alterar pelo app depois)
    const initialPassword = 'Jejum' + Math.floor(1000 + Math.random() * 9000); 

    // Cria conta de autenticação (Supabase Auth) com privilégios master
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: initialPassword,
      email_confirm: true 
    });

    if (authError) {
      // Se a conta já existe, ignoramos a criação de novo
      if (authError.message.includes('already exists')) {
        return res.status(200).json({ message: 'Aluno já existe no banco de dados. Tudo OK.' });
      }
      console.error("Erro ao criar aluno no Auth (admin):", authError);
      return res.status(500).json({ error: "Erro gerando credenciais no Supabase" });
    }

    // 2. Extrai o ID autogerado
    const newUserId = authData.user.id;

    // 3. Monta o Perfil Oficial do Aplicativo na tabela "users"
    const { error: dbError } = await supabase
      .from('users')
      .insert([
        { 
          id: newUserId, 
          nome: name,
          category: 'Iniciante no Jejum',
          protocol: '16h',
          meta_jejum_atual: 16
        }
      ]);

    if (dbError) {
      console.error("Aviso: o usuario foi criado mas falhou no insert do perfil público.", dbError);
    }

    // Sucesso Absoluto
    return res.status(200).json({ 
      success: true, 
      message: 'Cobrança analisada e usuário gerado com sucesso!', 
      dados_paciente: { email, temp_password: initialPassword } 
    });

  } catch (err: any) {
    console.error('Webhook falhou fatalmente:', err);
    return res.status(500).json({ error: 'Falha processando recebimento.' });
  }
}
