const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function diagnoseClientes() {
  try {
    console.log('--- Iniciando Diagnóstico de Clientes ---');
    console.log('Tentando Login...');

    // Tenta login com credenciais padrão que o usuário criou anteriormente
    // Se falhar, pode ser que o usuário criou com outro email.
    // Vou assumir as credenciais padrão do mock anterior ou as que o usuário citou (admin@admin.com / 123456).
    
    let token;
    let user;

    try {
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'admin@admin.com',
        password: '123456'
      });
      token = loginRes.data.accessToken;
      user = loginRes.data.user;
      console.log('✅ Login OK.');
      console.log('User:', user);
    } catch (e) {
      console.error('❌ Falha no login:', e.response?.data || e.message);
      // Tentar registrar um novo usuário de teste se login falhar
      console.log('Tentando registrar novo usuário de teste...');
      try {
        const registerRes = await axios.post(`${BASE_URL}/auth/register`, {
          nomeUsuario: 'Teste Diagnostico',
          email: 'diagnostico@teste.com',
          password: '123456',
          confirmPassword: '123456',
          nomeEmpresa: 'Empresa Teste'
        });
        token = registerRes.data.accessToken;
        user = registerRes.data.user;
        console.log('✅ Registro OK.');
      } catch (regErr) {
        console.error('❌ Falha no registro:', regErr.response?.data || regErr.message);
        return;
      }
    }

    if (!token) {
      console.error('❌ Não foi possível obter token.');
      return;
    }

    console.log('\n--- Buscando Clientes ---');
    try {
      const clientesRes = await axios.get(`${BASE_URL}/clientes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Status:', clientesRes.status);
      console.log('Data:', JSON.stringify(clientesRes.data, null, 2));
      
      if (Array.isArray(clientesRes.data)) {
        console.log(`Total: ${clientesRes.data.length}`);
      } else {
        console.warn('⚠️ Resposta não é um array!');
      }

    } catch (getErr) {
      console.error('❌ Erro ao buscar clientes:', getErr.response?.data || getErr.message);
    }

  } catch (err) {
    console.error('Erro geral:', err);
  }
}

diagnoseClientes();
