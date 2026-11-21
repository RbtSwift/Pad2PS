# Arquitetura e manutenção do Pad2PS

Este guia descreve o código de `RbtSwift/Pad2PS` e os limites entre o Pad2PS e o Pad2PS-Launcher. As referências a permissões e lojas refletem os arquivos deste repositório; configuração externa de contas e segredos não pode ser inferida do código.

## Visão geral

O Pad2PS tem uma aplicação principal em React/TypeScript, compilada pelo Vite para `dist/`. Essa mesma interface é empacotada para Desktop pelo Electron e para Android pelo Capacitor:

```text
src/main.tsx → src/App.tsx → hooks, componentes e dados
                     ├── Web/PWA: Vite + public/
                     ├── Desktop: Electron + desktop/dist/
                     └── Android: Capacitor + android/android/ (Gradle)
```

`src/main.tsx` registra o service worker quando o contexto suporta isso e monta a aplicação dentro de `ErrorBoundary`. `src/App.tsx` organiza as telas e recursos; a lógica de controles fica principalmente em `src/hooks/useGamepad.ts` e `src/data/`.

## Arquivos principais

| Caminho | Responsabilidade |
|---|---|
| `src/main.tsx`, `src/App.tsx` | Entrada e composição da interface React |
| `src/hooks/useGamepad.ts` | Detecta conexão/desconexão e consulta `navigator.getGamepads()` em ciclos de `requestAnimationFrame`; calcula estados, eventos e métricas dos controles |
| `src/data/ps2Mapping.ts` | Mapeia entradas físicas para os layouts e botões apresentados pelo app |
| `src/utils/controllerDb.ts` | Identifica controles com o banco SDL GameControllerDB incluído no app |
| `src/utils/nativeBridge.ts` | Seleciona o caminho nativo de bateria para Electron/Android e o fallback Web |
| `desktop/electron-main.cjs` | Janela Electron, bateria por plataforma, PiP e handlers IPC do processo principal |
| `desktop/electron-preload.cjs` | Expõe uma API pequena e tipada ao renderer usando `contextBridge` |
| `desktop/package.json` | Identidade do app, arquivos empacotados e alvos do electron-builder |
| `desktop/pad2ps-bin.sh`, `desktop/pad2ps-flatpak.sh` | Launchers do pacote Linux e do Flatpak |
| `desktop/io.github.rbtswift.Pad2PS.yml` | Manifesto Flatpak, runtime/SDK, permissões e origem do módulo |
| `desktop/io.github.rbtswift.Pad2PS.metainfo.xml`, `desktop/io.github.rbtswift.Pad2PS.desktop` | Metadados AppStream e entrada de menu Linux |
| `android/capacitor.config.json` | Identidade Capacitor, `webDir` e configuração de captura de entrada |
| `android/android/app/src/main/java/io/github/rbtswift/Pad2PS/MainActivity.java` | Registra o plugin nativo e configura a experiência imersiva Android |
| `android/android/app/src/main/java/io/github/rbtswift/Pad2PS/Pad2PSNativePlugin.java` | Plugin Capacitor `Pad2PSNative` para consultar bateria |
| `android/android/app/src/main/AndroidManifest.xml` | Manifesto Android; atualmente declara a permissão `INTERNET` |
| `api/latest-release.ts` | Endpoint do site que consulta as releases GitHub permitidas |
| `src/utils/updateChecker.ts` | Consulta a release mais recente e escolhe um asset conforme a plataforma |
| `.github/workflows/release.yml` | Builds, GitHub Releases e índices APT |

O hook de controle usa a API Gamepad padrão do navegador/Chromium, não lê diretamente `/dev/input` nem implementa um protocolo próprio para HID. Para a bateria, o Electron consulta `/sys/class/power_supply` e `upower` no Linux e propriedades PnP via PowerShell no Windows. No Android, o plugin consulta `InputDevice.getBatteryState()` em Android 12 ou superior e usa a bateria do aparelho como fallback quando nenhum controle informa a própria bateria. O fallback Web usa `navigator.getBattery()` quando disponível.

## Comunicação entre Pad2PS e Pad2PS-Launcher

**Não há protocolo de comunicação em tempo de execução entre os dois aplicativos no código verificado.** Não foram encontrados esquema URI próprio (`pad2ps://`), registro de protocolo, IPC cruzado ou regra udev. Os projetos têm repositórios e versões independentes.

Há integração de ecossistema por links e consulta de releases:

- `src/data/installers.ts` lista os repositórios GitHub dos dois produtos.
- `api/latest-release.ts` aceita somente `RbtSwift/Pad2PS` e `RbtSwift/Pad2PS-Launcher` e busca as releases no GitHub para o site.
- `src/components/InstallAppModal.tsx` oferece instruções e links de instalação, incluindo o Launcher.
- No Launcher, `desktop/src/components/ControllerTestModal.tsx` oferece um link para a release do Pad2PS para os recursos avançados de overlay, bateria e diagnóstico.

Esses links não trocam estado, controles ou mensagens entre processos. O IPC encontrado no Pad2PS é **interno ao próprio Electron**: `desktop/electron-preload.cjs` expõe `pad2ps:get-battery-devices`, `pad2ps:set-always-on-top` e `pad2ps:set-pip-mode`, atendidos por `ipcMain.handle` em `desktop/electron-main.cjs`. A janela PiP do app também sincroniza estado entre janelas do próprio Pad2PS pelo `BroadcastChannel` chamado `pad2ps-pip-sync`; isso não é integração com o Launcher.

## Controles, permissões e udev

Não há arquivos `*.rules`, regras udev, referências `ID_INPUT`/`MODE=` ou regras de permissões de dispositivo nos repositórios verificados. Não crie uma regra ampla de acesso (por exemplo, permissões globais de escrita) sem um problema reproduzível e uma regra específica devidamente testada. O app usa a API Gamepad do navegador; a visibilidade do controle depende do sistema operacional e do ambiente Chromium/Electron.

O manifesto Flatpak `desktop/io.github.rbtswift.Pad2PS.yml` declara:

- `--device=all` para acesso a dispositivos;
- `--filesystem=/sys:ro` para a leitura de informações de bateria no Linux;
- `--talk-name=org.freedesktop.UPower` para consultar o serviço UPower;
- sockets gráficos/áudio, IPC e rede necessários à interface e aos recursos do app.

Não remova essas permissões sem testar em Flatpak tanto a detecção de controles quanto a bateria. O `AndroidManifest.xml` declara `INTERNET`; a leitura de bateria nativa é feita pelo plugin Capacitor, sem uma permissão Android de udev. `android/capacitor.config.json` mantém `captureInput: true`.

## Invariantes e armadilhas técnicas já resolvidas

1. **Preserve o fluxo do código web.** A release compila o projeto da raiz e `desktop/package.json` copia `../dist` para `desktop/dist` pelo script `prepare-web`. Arquivos novos usados em runtime precisam estar incluídos na lista `build.files` do electron-builder.
2. **O tarball é parte do contrato de empacotamento.** O Flatpak, Snap e AUR consomem `Pad2PS-<versão>-x86_64.tar.gz`, que contém `linux-unpacked/`. Para Flatpak, o manifesto usa `type: archive`, URL, SHA-256, `dest: linux-unpacked` e `x-checker-data`; não volte a usar a origem `type: dir` de uma saída ignorada ou ausente.
3. **A URL e o SHA precisam descrever os mesmos bytes.** Atualize o checksum somente depois de gerar/publicar o tarball final. O manifesto versionado atualmente aponta para `v1.0.6`, com o SHA-256 registrado nele; o workflow normal troca URL e checksum em um manifesto temporário para usar o tarball recém-gerado.
4. **Build Flatpak não é publicação no Flathub.** `flatpak build-bundle` produz um bundle que pode ser anexado à GitHub Release; não cria nem atualiza a listagem do Flathub.
5. **`flatpak build-bundle` não aceita `--user`.** A opção deve permanecer nos comandos que a suportam, como `flatpak remote-add`, `flatpak install` e `flatpak-builder`; não a acrescente a `flatpak build-bundle`. A correção está no workflow de `main` (commit `b700b71`).
6. **Dispatch de release existente não deve reconstruir os demais assets.** Em `workflow_dispatch`, o job específico faz checkout de `main`, verifica a URL do tarball para a tag informada e a presença do SHA-256 no manifesto, constrói e anexa somente o `.flatpak`. Os jobs completos de Linux/Windows/Android e publicação APT continuam no caminho de push de tags. Isso evita substituir o tarball cuja origem está fixada nem republicar os demais artefatos ao reparar uma release antiga.
7. **Assinatura Android não é garantida pelo nome do build.** `android/android/app/build.gradle` seleciona a chave debug se o keystore ou qualquer variável de senha/alias estiver ausente. Não distribua um APK/AAB como release oficial sem conferir o certificado; mantenha a mesma chave de atualização e incremente `versionCode` a cada submissão à Play.
8. **PiP é recurso Desktop.** O caminho Electron cria a janela e sincroniza o estado; a versão Android não deve ser tratada como se oferecesse esse recurso.

O `MANUAL_EMPACOTAMENTO.md` contém instruções anteriores ao fluxo de dispatch dedicado e ainda mostra `--user` na chamada `flatpak build-bundle`. Para builds atuais, siga o workflow de `main` e a regra acima, não copie esse argumento do exemplo antigo.

## Rotina de manutenção

- Antes de uma release, alinhe as versões nos manifests relevantes e em `android/android/app/build.gradle`; não faça substituição global de números de versão em lockfiles.
- Compile/teste cada plataforma em seu ambiente, valide assinaturas e confira nome, conteúdo e SHA-256 dos assets.
- Atualize `desktop/io.github.rbtswift.Pad2PS.metainfo.xml`, `RELEASE_NOTES.md`, os changelogs Fastlane e os metadados externos necessários.
- Para mudar o empacotamento Linux/Flatpak, teste o tarball real e as permissões do manifesto; não confunda bundle Flatpak com publicação em loja.
- Para detalhes operacionais de canais, credenciais necessárias (somente os nomes), estado confirmado e procedimento de release, consulte [`GUIA_LOJAS_E_PENDENCIAS.md`](GUIA_LOJAS_E_PENDENCIAS.md).
