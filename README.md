# 🎮 Pad2PS (`v1.0.0`)

Tradutor visual em tempo real e suíte avançada de diagnóstico de controles para **Web**, **PC (Linux/Windows)** e **Android**.

---

## ✨ Recursos Principais

- **Múltiplos Layouts Interativos:** Suporte completo para **PS1**, **PS2**, **PS3**, **PSP**, **Xbox Series / PC** (botões coloridos `A/B/X/Y`, `LB/RB`, `LT/RT`, `View`, `Menu`, `Xbox`) e **Nintendo Switch Pro** (layout invertido `A/B/X/Y`, `L/R`, `ZL/ZR`, `-`, `+`, `Home`).
- **Suíte Avançada de Diagnóstico:**
  - **Drift & Circularidade:** Radar polar de precisão com cálculo em tempo real de erro de circularidade (%) e zona morta configurável.
  - **Teste de Vibração (Rumble):** Testes individuais para motor forte (esquerdo), motor fraco (direito), *dual-rumble* e pulso contínuo.
  - **Gatilhos, Polling Rate & Bouncing:** Linearidade `0%–100%` dos gatilhos, taxa de atualização em `Hz` / latência em `ms` e detecção de clique duplo involuntário (*bouncing* `< 65ms`).
  - **Inspetor Raw de Hardware:** Visualização bruta de `B0..B17`, `Axes`, nome do dispositivo e `VID:PID`.
- **Monitor de Bateria Integrado:** Leitura nativa do nível de bateria (%) e carregamento dos controles no **Linux** (`/sys/class/power_supply` e `upower`), **Windows** (Bluetooth/HID PnP) e **Android** (`InputDevice.getBatteryState()`).
- **Janela Flutuante (PiP) *Always-on-Top*:** No aplicativo Desktop, fixe o diagrama compacto sempre no topo sobre qualquer jogo ou emulador.
- **Sequência de Comandos, Treinador de Combos & Exportação PNG:** Grave sequências, exporte em PNG/TXT e baixe as logos oficiais do Pad2PS em alta resolução (`1024px`).

## Download

- [Adicionar Pad2PS ao Obtainium](https://apps.obtainium.imranr.dev/redirect.html?r=obtainium://add/https://github.com/RbtSwift/Pad2PS)
- [Ver releases do Pad2PS no GitHub](https://github.com/RbtSwift/Pad2PS/releases)

---

## 📁 Estrutura do Repositório

```text
Pad2PS/
├── src/ & public/          # Código-fonte Web principal (React 19 + Vite + Tailwind CSS v4)
├── desktop/                # App Desktop Electron (Linux & Windows) com leitura de bateria e PiP real
├── android/                # App Android Capacitor 6 com plugin nativo de bateria de controles
└── .github/workflows/      # Automação de Releases multiplataforma
```

---

## 📄 Créditos

Desenvolvido por **Pad2PS (Ravi Rosa)** — `<pad2ps@eusolravi.com.br>`  
Repositório oficial: [https://github.com/RbtSwift/Pad2PS](https://github.com/RbtSwift/Pad2PS)

## Website oficial

O domínio canônico do site é `https://www.pad2ps.com.br`; o domínio `pad2ps.vercel.app` continua disponível como endereço alternativo. As funções Vercel `/api/latest-release` consultam as releases mais recentes dos repositórios Pad2PS e Pad2PS Launcher e usam cache CDN por cinco minutos com revalidação em segundo plano.

O formulário de contato usa uma função Vercel e Web3Forms. Configure `WEB3FORMS_ACCESS_KEY` somente nas variáveis de ambiente do projeto Vercel, com uma chave Web3Forms que encaminhe as mensagens para `contato@pad2ps.com.br`. Sem essa variável, o formulário informa que o envio não está configurado e mantém as opções de copiar o e-mail e abrir o aplicativo de e-mail.
