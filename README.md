# 🏥 Sistema de Gerenciamento de Senhas para Painel de Atendimento

Sistema completo de senhas para clínicas, hospitais ou qualquer estabelecimento que precise de um painel de chamada de senhas com sincronização em tempo real via **Supabase**.

> ⚠️ **Nota:** Este repositório foi migrado do Firebase para o **Supabase** (PostgreSQL com Realtime). As credenciais do Supabase já estão embutidas nos arquivos `index.html` e `tv.html`. Para usar seu próprio projeto Supabase, siga as instruções abaixo.

---

## 📋 Estrutura do Projeto

```
📁 Guinchê/
├── index.html               # Tela 1: Painel do Atendente (Computador)
├── tv.html                  # Tela 2: Painel do Paciente (TV/APK)
├── supabase-client.js       # Cliente Supabase compartilhado
├── database.sql             # Schema SQL para criar as tabelas
├── package.json             # Dependências do projeto
└── README.md                # Este arquivo
```

---

## 🚀 Configuração Rápida

### Passo 1: Configurar o Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login/crie conta
2. Crie um **novo projeto**:
   - Escolha um nome (ex: `sistema-senhas`)
   - Defina uma senha forte para o banco
   - Escolha uma região próxima ao Brasil (ex: `South America (São Paulo) - sa-east-1`)
   - Aguarde a criação do projeto (leva ~2 minutos)
3. No menu lateral, vá em **"SQL Editor"**
4. Clique em **"New Query"**, cole o conteúdo do arquivo `database.sql` e execute
5. Vá em **"Project Settings" > "API"** para ver suas credenciais

> Pule esta etapa se quiser usar o projeto Supabase já configurado (as chaves estão nos arquivos).

### Passo 2: Atualizar as Credenciais (opcional)

Se quiser usar seu **próprio Supabase**, edite os valores nos arquivos:

**No `index.html`** (início do script):
```javascript
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui';
```

**No `tv.html`** (início do script):
```javascript
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'sua-chave-anon-aqui';
```

### Passo 3: Configurar o Vídeo do YouTube (opcional)

No `tv.html`, localize o iframe (linha ~130) e substitua o ID do vídeo:

```html
<iframe 
  src="https://www.youtube.com/embed/SEU_VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=SEU_VIDEO_ID&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1"
```

Para encontrar o VIDEO_ID: no YouTube, está na URL: `https://www.youtube.com/watch?v=**VIDEO_ID**`

### Passo 4: Abrir as Telas

Você pode usar qualquer servidor estático:

**Opção 1 - VS Code Live Server:**
- Instale a extensão "Live Server"
- Clique com direito no `index.html` > "Open with Live Server"

**Opção 2 - Node.js:**
```bash
npx serve .
```
- Painel do Atendente: http://localhost:3000/index.html
- Painel da TV: http://localhost:3000/tv.html

**Opção 3 - Python:**
```bash
python -m http.server 8080
```

---

## 🖥️ Funcionalidades

### Tela 1: Painel do Atendente (`index.html`)
- **Chamar Próxima Senha** (`Enter`): Gera números sequenciais automaticamente (S001, S002...)
- **Chamar Novamente** (`Espaço`): Reexibe a mesma senha com som/efeito na TV
- **Senha Manual**: Para casos preferenciais ou prioritários (ex: `P001`)
- **Seleção de Guichê**: Escolha entre guichês pré-definidos (1 a 5) ou digite personalizado
- **Indicador de Status**: Mostra o estado da conexão com o Supabase
- **Atalhos de Teclado**:
  - `Enter` → Chamar próxima senha
  - `Espaço` → Chamar novamente a senha atual

### Tela 2: Painel do Paciente / TV (`tv.html`)
- **Player de Vídeo YouTube**: 65% da tela com vídeo em loop (lado esquerdo)
- **Senha Atual**: Exibida em letras gigantes (até 18rem) com gradiente dourado (lado direito)
- **Guichê Atual**: Mostra para qual guichê/consultório se dirigir
- **Histórico**: Últimas 4 senhas chamadas com animação de entrada
- **Efeitos Visuais** (ao chamar senha):
  - 🔴 Número pisca em vermelho/amarelo por 3 segundos
  - 💡 Flash dourado na tela inteira
  - 📛 Badge "ATENÇÃO!" pulsante
  - 📱 Animação de entrada suave no histórico
- **Efeitos Sonoros** (Web Audio API - sem arquivos externos):
  - **Nova senha**: Gongo de 3 tons (harmônico e profissional)
  - **Chamar novamente**: Dois bips rápidos + tom longo
  - Funciona nativamente em qualquer navegador e WebView de APK
- **Otimizado para TV**:
  - Layout paisagem responsivo (4K / Full HD)
  - `cursor: none` e `user-select: none`
  - Iframe bloqueado (`pointer-events: none`)

---

## 🗄️ Estrutura do Banco de Dados (Supabase / PostgreSQL)

O schema SQL em `database.sql` cria estas tabelas:

### `senha_atual`
| Coluna     | Tipo      | Descrição                          |
|------------|-----------|------------------------------------|
| id         | integer   | Chave primária (fixo = 1)          |
| numero     | integer   | Número da senha atual              |
| guiche     | text      | Guichê/Consultório                 |
| timestamp  | bigint    | Timestamp Unix da última chamada   |
| senha_formatada | text | Ex: "S005"                      |

### `historico`
| Coluna     | Tipo      | Descrição                          |
|------------|-----------|------------------------------------|
| id         | bigint    | Chave primária (auto-incremento)   |
| numero     | integer   | Número da senha                    |
| guiche     | text      | Guichê/Consultório                 |
| timestamp  | bigint    | Timestamp Unix                     |
| senha_formatada | text | Ex: "S005"                      |

### `trigger_chamar`
| Coluna     | Tipo      | Descrição                          |
|------------|-----------|------------------------------------|
| id         | integer   | Chave primária (fixo = 1)          |
| timestamp  | bigint    | Timestamp do "chamar novamente"    |

### Função `incrementar_contador()`
Função PostgreSQL que:
1. Incrementa o contador de senhas
2. Atualiza `senha_atual` com o novo número
3. Insere a senha anterior no histórico
4. Remove itens do histórico se ultrapassar 20 registros

---

## 📱 Transformar em APK

Para usar o `tv.html` como aplicativo Android na TV:

### Opção 1 - PWA2APK (Recomendado)
1. Acesse https://appmaker.xyz/pwa-to-apk
2. Coloque a URL do seu `tv.html` hospedado
3. Gere o APK

### Opção 2 - Android Studio com WebView
1. Crie um app Android com WebView
2. Aponte para a URL do `tv.html`
3. Configure para fullscreen e landscape

### Opção 3 - Progressive Web App (PWA)
Adicione um `manifest.json` e service worker. O layout já está otimizado para isso.

---

## 🔄 Fluxo de Sincronização

```
┌─────────────────────┐          Supabase Realtime          ┌─────────────────────┐
│                     │  ──── UPDATE senha_atual ──────▶    │                     │
│   PAINEL DO         │  ──── UPDATE trigger_chamar ──▶    │   PAINEL DO         │
│   ATENDENTE         │  ──── INSERT historico ────────▶   │   PACIENTE (TV)     │
│   (index.html)      │  ◀─── (não escuta nada) ─────────  │   (tv.html)         │
└─────────────────────┘                                     └─────────────────────┘
```

- O **Atendente** escreve no banco (chama senha)
- A **TV** escuta e reage (reproduz som, pisca, atualiza tela)
- A comunicação é **unidirecional** (atendente → banco → TV)

---

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend/Database**: Supabase (PostgreSQL + Realtime)
- **Áudio**: Web Audio API (nativo do navegador)
- **Vídeo**: YouTube IFrame Player API
- **Sincronização**: Supabase Realtime (WebSocket)
- **Hospedagem**: GitHub Pages / Netlify / Vercel (ou qualquer servidor estático)

---

## ⚠️ Dicas Importantes

1. **Som não funciona no navegador?**
   - Toque na tela primeiro para ativar o AudioContext
   - Chrome e Safari exigem interação do usuário para áudio

2. **Supabase Gratuito?**
   - Free Plan: 2 projetos, 500 MB de banco, 5 GB de largura de banda
   - Realtime incluído no free (limitado a 2 simultâneos)
   - Suficiente para a maioria dos casos de uso

3. **Segurança**
   - As chaves `anon` são seguras para uso no frontend (RLS do Supabase)
   - Para produção, configure Row Level Security (RLS) nas tabelas
   - As regras no `database.sql` são permissivas para facilitar o setup

4. **GitHub Pages**
   - Você pode hospedar gratuitamente neste repositório
   - Vá em Settings > Pages > Source > GitHub Actions
   - Ou use Netlify/Vercel para deploy automático

---

## 🔧 Manutenção

### Resetar contagem de senhas (novo dia)
Execute no SQL Editor do Supabase:
```sql
UPDATE senha_atual SET numero = 0 WHERE id = 1;
DELETE FROM historico;
```

### Ver últimas senhas chamadas
```sql
SELECT * FROM historico ORDER BY timestamp DESC LIMIT 10;
```

---

## 🙏 Créditos

Sistema desenvolvido para atender a comunidade de capivari e região.

Contribuições são bem-vindas! Abra uma issue ou pull request.