// Configuração do Cliente Supabase
// ATENÇÃO: As chaves de API devem ser mantidas em segredo em um ambiente de produção.
// Como este é um aplicativo de front-end simples, e a chave é 'anon' pública,
// ela é usada diretamente no código.

const SUPABASE_URL = 'https://kbaltnbemvxsijntsqgf.supabase.co';
// SUBSTITUA O VALOR ABAIXO PELA SUA CHAVE COMPLETA
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiYWx0bmJlbXZ4c2lqbnRzcWdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU0MjM0NTYsImV4cCI6MTgyMTA3OTQ1Nn0.VABWaR_image.png'; 

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY );

// Exporta o cliente Supabase para ser usado em outros arquivos JS
export { supabase };
