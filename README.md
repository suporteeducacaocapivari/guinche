# 🏥 Sistema de Gerenciamento de Senhas para Painel de Atendimento

Sistema completo de senhas para clínicas, hospitais ou qualquer estabelecimento que precise de um painel de chamada de senhas com sincronização em tempo real.

## 📋 Estrutura do Projeto

```
📁 Guinchê/
├── index.html           # Tela 1: Painel do Atendente (Computador)
├── tv.html              # Tela 2: Painel do Paciente (TV/APK)
├── firebase-config.js   # Configuração e serviço do Firebase
├── package.json         # Dependências do projeto
└── README.md            # Este arquivo
```

## 🚀 Como Usar

### 1. Configurar o Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Crie um **novo projeto** (ou use um existente)
3. No menu lateral, vá em **"Build" > "Realtime Database"**
4. Clique em **"Criar banco de dados"**
   - Escolha uma região próxima (ex: `us-central1`)
   - Inicie em **"modo de teste"** (para desenvolvimento)
5. Copie as regras de segurança abaixo e cole no Firebase:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

6. No menu **"Configurações do Projeto" > "Geral"**, role até **"Seus apps"**
7. Clique em **"Adicionar app"** > **"Web"** (ícone `</>`)
8. Copie as credenciais (`apiKey`, `authDomain`, `databaseURL`, etc.)

### 2. Configurar as Credenciais

**ATENÇÃO:** Você precisa colocar as credenciais do Firebase nos arquivos `index.html` e `tv.html`:

**No `index.html`** (linha ~138):
```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  databaseURL: "https://seu-projeto-default-rtdb.firebaseio.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "SEU_SENDER_ID",
  appId: "SEU_APP_ID"
};
```

**No `tv.html`** (linha ~182):
```javascript
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  // ... mesmas credenciais
};
```

Substitua `SUA_API_KEY_AQUI`, `seu-projeto`, etc. pelos valores do seu Firebase.

### 3. Configurar o Vídeo do YouTube (opcional)

No `tv.html`, localize o iframe (linha ~100) e substitua `VIDEO_ID` pelo ID do seu vídeo do YouTube:

```html
<iframe 
  src="https://www.youtube.com/embed/SEU_VIDEO_ID?autoplay=1&mute=1&loop=1&playlist=SEU_VIDEO_ID&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1"
```

Para encontrar o VIDEO_ID: no YouTube, ele está na URL: `https://www.youtube.com/watch?v=**VIDEO_ID**`

### 4. Abrir as Telas

Você pode usar qualquer servidor estático simples. Duas opções:

**Opção 1 - VS Code Live Server:**
- Instale a extensão "Live Server"
- Clique com direito no `index.html` > "Open with Live Server"

**Opção 2 - Node.js (npx serve):**
```bash
npx serve .
```
- Painel do Atendente: http://localhost:3000/index.html
- Painel da TV: http://localhost:3000/tv.html

## 🖥️ Funcionalidades

### Tela 1: Painel do Atendente (`index.html`)
- **Chamar Próxima Senha**: Gera números sequenciais automaticamente (S001, S002...)
- **Chamar Novamente**: Reexibe a mesma senha com som/efeito na TV
- **Senha Manual**: Para casos preferenciais ou prioritários
- **Seleção de Guichê**: Escolha entre guichês pré-definidos ou digite personalizado
- **Atalhos de Teclado**: `Enter` para próxima senha, `Espaço` para chamar novamente

### Tela 2: Painel do Paciente / TV (`tv.html`)
- **Player de Vídeo YouTube**: 65% da tela com vídeo em loop
- **Senha Atual**: Exibida em letras gigantes (clamp responsivo)
- **Guichê Atual**: Mostra para qual guichê/consultório ir
- **Histórico**: Últimas 4 senhas chamadas
- **Efeitos Visuais**:
  - 🔴 Número pisca em vermelho/amarelo por 3 segundos
  - 💡 Flash na tela ao chamar senha
  - 📱 Animação de entrada no histórico
- **Efeitos Sonoros** (Web Audio API):
  - Som de gongo/bip ao chamar nova senha
  - Som diferente ao "Chamar Novamente"
  - Funciona nativamente em APK/Web (sem arquivos externos)

## 📱 Transformar em APK

Para usar o `tv.html` como aplicativo Android na TV:

### Opção 1 - WebView APK (Recomendado para testes)
Use ferramentas como:
- **PWA2APK** (https://appmaker.xyz/pwa-to-apk)
- **Bubblewrap** (Google)
- **Android Studio** com WebView

### Opção 2 - PWA (Progressive Web App)
Adicione um `manifest.json` e service worker para instalar como app.

## 🔄 Estrutura do Banco de Dados (Firebase Realtime)

```
/
├── contador: number          # Contador sequencial de senhas
├── senha_atual: {
│   ├── numero: number        # Número da senha
│   ├── guiche: string        # Guichê/Consultório
│   ├── timestamp: number     # Timestamp Unix
│   └── senhaFormatada: string # Ex: "S005"
├── historico: {
│   ├── [key]: {              # Até 5 itens
│   │   ├── numero: number
│   │   ├── guiche: string
│   │   ├── timestamp: number
│   │   └── senhaFormatada: string
│   └── }
└── trigger_chamar: {
    ├── ativo: boolean
    └── timestamp: number
```

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend/Database**: Firebase Realtime Database
- **Áudio**: Web Audio API (nativo do navegador)
- **Vídeo**: YouTube IFrame Player API
- **Sincronização**: Firebase Realtime Listeners (on/off)

## ⚠️ Dicas Importantes

1. **Som não funciona no iPhone/Safari?**
   - Toque na tela primeiro para ativar o AudioContext (limitação da Apple)
   - A TV Panel precisa de interação inicial do usuário

2. **Firebase Gratuito?**
   - O Spark Plan (gratuito) tem limite de 100 conexões simultâneas e 1GB de download
   - Para uso em produção, considere o Blaze Plan (pay-as-you-go)

3. **Segurança**
   - As regras do Firebase acima são para desenvolvimento
   - Em produção, implemente autenticação e regras mais restritas

---

Desenvolvido para ♥️ servir a comunidade. Contribuições são bem-vindas!