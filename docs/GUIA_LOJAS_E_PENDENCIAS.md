# Lojas, distribuição e pendências do Pad2PS

**Escopo e data da verificação:** repositório `RbtSwift/Pad2PS`, versão de código/release `1.0.6`, consulta em 21/11/2026. A presença de arquivos neste repositório comprova preparação local, não uma publicação em loja. Estado de contas, credenciais e aprovação de lojas é externo.

## Estado resumido dos canais

| Canal | Estado verificado | Metadados e assets no repositório | Pendências principais |
|---|---|---|---|
| Google Play / Fastlane | Textos e ícones preparados, mas sem automação de upload. A página pública do pacote `io.github.rbtswift.Pad2PS` retornou 404 na consulta. | `fastlane/metadata/android/{pt-BR,en-US}/`: título, descrição curta/completa, changelog `7.txt` e `images/icon.png`; `store-assets/STORE_LISTING.md`, `icon-512x512.png` e `feature-banner-1024x500.png`. | Criar/confirmar a ficha no Play Console, fornecer screenshots reais, configurar assinatura e envio; não existe `Fastfile` nem job de publicação Play. |
| Flathub | Manifesto e metadados AppStream existem; não há submissão ou publicação automatizada. A URL pública da aplicação retornou 404 na consulta. | `desktop/io.github.rbtswift.Pad2PS.yml`, `desktop/io.github.rbtswift.Pad2PS.metainfo.xml`, `desktop/io.github.rbtswift.Pad2PS.desktop`, `desktop/icon.png` e `desktop/icon-256.png`. | Criar/submeter a receita ao Flathub e acompanhar revisão; manter URL/SHA do tarball e metadados atualizados. |
| Snap Store | Manifesto e workflow de build/publicação existem. `https://snapcraft.io/pad2ps` retornou 404 na consulta; portanto a listagem pública não foi localizada. | `snap/snapcraft.yaml`, `snap/launch`, `.github/workflows/publish-stores.yml`. | Criar/confirmar a aplicação na Snap Store e configurar `SNAPCRAFT_STORE_CREDENTIALS`; acompanhar a publicação no canal `stable`. |
| AUR | `PKGBUILD`, `.SRCINFO` e automação existem. A consulta RPC do AUR para `pad2ps` retornou zero resultados. | `PKGBUILD`, `.SRCINFO`, `.github/workflows/publish-stores.yml`. | Criar o pacote inicial no AUR; configurar `AUR_SSH_PRIVATE_KEY` e `AUR_KNOWN_HOSTS`; depois validar os pushes automáticos. |
| Obtainium | O README e o rodapé do site oferecem link para adicionar o repositório GitHub. Não há workflow nem manifesto específico do Obtainium. | Link no `README.md` e em `src/components/SiteFooter.tsx`; fonte de atualização: GitHub Releases `RbtSwift/Pad2PS`. | Em cada release, anexar APK de release assinado e confirmar que o Obtainium reconhece o asset/tag. |
| Site oficial | `https://www.pad2ps.com.br` respondeu e é o domínio canônico declarado pelo projeto. A API do site obtém as releases dos dois repositórios GitHub. | `api/latest-release.ts`, `src/data/installers.ts`, `src/components/InstallAppModal.tsx`, `src/components/SiteFooter.tsx`, `src/utils/updateChecker.ts`, `vercel.json`. | Confirmar a publicação Vercel após mudanças de conteúdo/código; validar os links e os assets da release. O deploy e as credenciais do projeto são externos a este repositório. |

As consultas às páginas públicas do Google Play, Flathub e Snap e à API do AUR foram feitas em 21/11/2026. Uma resposta 404/ausência de resultado é o estado observado nessa data, não uma garantia de que o serviço nunca tenha tido ou não venha a ter uma listagem.

## Google Play e Fastlane

Os arquivos sob `fastlane/metadata/android/pt-BR/` e `en-US/` contêm `title.txt`, `short_description.txt`, `full_description.txt`, `changelogs/7.txt` e `images/icon.png`. As pastas `images/phoneScreenshots/` contêm somente `.gitkeep`: não há capturas reais para a ficha. Não há `Fastfile` e nenhum workflow envia AAB/APK à Play Console.

O job Android de `.github/workflows/release.yml` só executa quando a variável `ANDROID_SIGNING_ENABLED` é exatamente `true`; ele gera APK/AAB, mas não publica na Play. O build requer `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS` e `ANDROID_KEY_PASSWORD` para usar a chave de release. Sem todos os dados, o Gradle usa assinatura debug. `versionCode` atual: `7`; ele deve aumentar em cada atualização publicada na Play.

**Para preparar uma submissão:**

1. Atualize os textos e o changelog em ambos os idiomas; gere e revise screenshots autênticos para os tamanhos exigidos pela Play.
2. Incremente `versionCode` em `android/android/app/build.gradle`; valide `versionName`, package ID e política de assinatura.
3. Gere o AAB assinado com a chave de release permanente e confira o certificado/validação antes de enviar.
4. Envie os materiais e o AAB pela Play Console. Automatizar esse envio exigiria uma etapa Fastlane/Play Console e credenciais próprias, inexistentes neste repositório.

`store-assets/STORE_LISTING.md` é material auxiliar para listagens; não substitui os campos finais, screenshots nem aprovação na Play Console.

## Flathub

O manifesto `desktop/io.github.rbtswift.Pad2PS.yml` usa `type: archive`, URL e SHA-256 do tarball da release `v1.0.6`, destino `linux-unpacked` e `x-checker-data` do GitHub. O metainfo AppStream e a entrada `.desktop` ficam em `desktop/`.

O workflow de release gera um arquivo `.flatpak` e o anexa à GitHub Release; isso **não** publica o app no Flathub. Não foi encontrada uma submissão/receita do Flathub no repositório, e a página pública do ID `io.github.rbtswift.Pad2PS` não foi localizada na consulta. A publicação exige preparar e submeter a receita ao processo oficial do Flathub, acompanhar a revisão e manter sua URL/checksum e metadados sincronizados.

**Para uma nova versão:** publique primeiro o tarball final; copie seu SHA-256 para o manifesto/receita do Flathub, atualize as informações de release no AppStream e valide o build e as permissões com a origem real. Abra/atualize a submissão no repositório de packaging do Flathub. Não trate o bundle anexado à GitHub Release como confirmação de publicação no catálogo.

## Snap Store

`snap/snapcraft.yaml` define o pacote e sua origem tarball; `snap/launch` é o launcher. No workflow `.github/workflows/publish-stores.yml`, o job Snap baixa o tarball da tag, calcula o SHA-256, atualiza versão/URL/checksum em memória, compila com `snapcore/action-build` e publica em `stable` via `snapcore/action-publish`.

O job é disparado pelo evento `release.published` e também pelo `workflow_dispatch` com input `tag`. Requer o secret `SNAPCRAFT_STORE_CREDENTIALS`. O workflow não grava a atualização do manifesto de volta no repositório Pad2PS. A página pública `snapcraft.io/pad2ps` retornou 404 na consulta; o workflow, por si só, não prova que o pacote inicial esteja criado ou publicado.

Depois de criar/confirmar o pacote e configurar as credenciais no repositório, uma release publicada inicia a publicação automaticamente. Um despacho manual também é possível:

```bash
gh workflow run publish-stores.yml -R RbtSwift/Pad2PS --ref main -f tag=vX.Y.Z
```

**Atenção:** esse workflow executa tanto o job Snap quanto o AUR. Não o use como teste sem intenção de publicar nos dois canais.

## AUR

`PKGBUILD` e `.SRCINFO` descrevem o pacote atual, com versão `1.0.6`, tarball, ícone, arquivo `.desktop` e checksums. O job AUR de `.github/workflows/publish-stores.yml` baixa os arquivos da release, atualiza esses metadados em memória, clona `ssh://aur@aur.archlinux.org/pad2ps.git` e envia os arquivos ao branch AUR. Essa automação pressupõe que o pacote inicial já exista. A API RPC do AUR retornou `resultcount: 0` para `pad2ps` em 21/11/2026.

O push para o branch `master` exige `AUR_SSH_PRIVATE_KEY` e `AUR_KNOWN_HOSTS` configurados como secrets. Após criar o pacote inicial e validar `PKGBUILD`/`.SRCINFO` no ambiente Arch, releases publicadas executam o job automaticamente. O workflow manual de Snap/AUR é compartilhado e também publica no Snap Store.

## Obtainium

O link de inclusão está no `README.md` e no `src/components/SiteFooter.tsx`; ele aponta o Obtainium para `https://github.com/RbtSwift/Pad2PS`. Não há configuração de loja nem etapa de publicação do Obtainium. A atualização depende da GitHub Release conter um APK instalável e assinado com a chave de distribuição compatível com versões anteriores.

**Para atualizar:** publique a release com o APK assinado, confirme no GitHub que o asset correto está anexado e teste a detecção da nova tag/versão no Obtainium. Não use AAB como substituto do APK para instalação direta.

## Site oficial e links de download

O domínio canônico declarado no README é `https://www.pad2ps.com.br`; `pad2ps.vercel.app` é citado como endereço alternativo. `api/latest-release.ts` consulta, por allowlist, as releases mais recentes de Pad2PS e Pad2PS-Launcher e aplica cache CDN de 300 segundos com revalidação em segundo plano. `src/data/installers.ts` fornece os dois projetos à interface, enquanto `src/utils/updateChecker.ts` consulta a API do GitHub e seleciona assets para Android, Windows e Linux.

Uma nova GitHub Release atualiza os dados obtidos dinamicamente pelo site; não há uma publicação manual de “asset do site” no workflow de release. Mudanças na interface/site dependem do deploy Vercel, cuja configuração de projeto e segredos é externa. Depois de uma release, confira a página, links para os dois repositórios e assets exibidos/baixados.

## Releases, bundle Flatpak e publicação de lojas

O fluxo normal de `.github/workflows/release.yml` é acionado pelo push de uma tag `v*`: build Linux, build Windows, Android condicionado à variável `ANDROID_SIGNING_ENABLED`, anexação dos assets à GitHub Release e atualização de índices APT. Para uma release publicada, `.github/workflows/publish-stores.yml` e `.github/workflows/discord-changelog.yml` recebem o evento `release.published`.

Para acrescentar **somente** um Flatpak a uma release existente, use o `workflow_dispatch` de `release.yml` em `main` com o input `tag`:

```bash
gh workflow run release.yml -R RbtSwift/Pad2PS --ref main -f tag=vX.Y.Z
```

Esse caminho faz checkout do manifesto de `main`, verifica a URL correspondente à tag e a presença de SHA-256, constrói o bundle e anexa somente o `.flatpak` (substituindo apenas esse asset se já existir). Ele não reconstrói o tarball/APK/EXE nem atualiza APT. Anexar um asset a uma release já publicada não dispara novamente `release.published`; se for necessário anunciar essa alteração no Discord, use o dispatch manual descrito abaixo.

Em 21/11/2026, `v1.0.6` do Pad2PS e `v1.0.19` do Launcher ainda não tinham asset `.flatpak`. Os dispatches anteriores (Pad2PS run `44872402865`, Launcher run `44872402414`) falharam em `flatpak build-bundle` por causa da opção não suportada `--user`. A opção foi removida do comando nos workflows de `main` (Pad2PS commit `b700b71`; Launcher commit `c27d4f0`), mas nenhum novo dispatch foi executado depois dessa correção. A presença do bundle nas duas releases continua pendente de uma execução bem-sucedida.

## Notificação obrigatória no Discord oficial

`.github/workflows/discord-changelog.yml` é acionado em `release.published` e também por `workflow_dispatch`. O nome do secret usado pelo job é `DISCORD_WEBHOOK`; seu valor deve existir somente em **Settings → Secrets and variables → Actions** e nunca deve ser copiado para arquivos, comandos, documentação ou logs.

O job envia um embed JSON com:

- título `🚀 Nova Atualização: <nome da release>`;
- descrição igual ao corpo da release, limitado a 3500 caracteres; se vazio, usa `Nova versão oficial publicada!`;
- URL da release;
- cor decimal `5793266`;
- rodapé `<nome do repositório> • Pad2PS Oficial`.

Uma execução bem-sucedida imprime `Discord aceitou a notificação (HTTP <status>)`. Em 20/11/2026, Pad2PS run `44692188351` e Launcher run `44694497814` terminaram com sucesso e registraram HTTP 204. Isso comprova o funcionamento do webhook nessas execuções; não comprova que toda release posterior tenha sido anunciada. Não foi localizado um run recente por evento `release` entre os cinco runs consultados.

**Verificação a cada nova release:** confira a execução `Discord release notification` no Actions, confirme o estado `success`, leia o log para o HTTP retornado e verifique visualmente a mensagem no canal oficial. Um `release.published` ausente ou falho exige verificar o secret e, quando apropriado, reenviar manualmente.

**Reenvio manual** para uma release já publicada:

```bash
gh workflow run discord-changelog.yml -R RbtSwift/Pad2PS --ref main \
  -f release_name='Pad2PS vX.Y.Z' \
  -f release_body='Notas da release em português e inglês.' \
  -f release_url='https://github.com/RbtSwift/Pad2PS/releases/tag/vX.Y.Z'
```

Consulte as execuções e o log sem mostrar o valor do secret:

```bash
gh run list --workflow discord-changelog.yml -R RbtSwift/Pad2PS --limit 10
gh run view <ID_DA_EXECUCAO> -R RbtSwift/Pad2PS --log
```

O recebimento HTTP 204 confirma que o endpoint aceitou o payload; a conferência no canal confirma que a mensagem está visível para a comunidade.

## Checklist de publicação e pendências

1. Atualize versões, `versionCode`, `RELEASE_NOTES.md`, changelogs Fastlane e metadados AppStream; valide assinatura e assets.
2. Gere e confira o tarball Linux final. Atualize o SHA do manifesto Flathub somente para esses bytes.
3. Faça commit/push do código e envie a tag `vX.Y.Z`; acompanhe `release.yml` até os assets esperados aparecerem na GitHub Release.
4. Confira as execuções de Snap/AUR e Discord disparadas por `release.published`; examine logs e status de cada job.
5. Submeta/atualize Flathub separadamente; complete Play Console com screenshots reais e AAB assinado; confirme listagens e credenciais Snap/AUR.
6. Confira o site oficial, o link Obtainium e cada download/assinatura. Para releases antigas, use o dispatch Flatpak isolado e o dispatch Discord se precisar de novo anúncio.

**Pendências confirmadas em 21/11/2026:** criar/submeter a ficha Play e screenshots reais; submeter o pacote ao Flathub; inicializar/confirmar as listagens Snap Store e AUR e credenciais externas; reexecutar os dois builds Flatpak após a correção de `build-bundle` e confirmar os assets nas releases. O site oficial está acessível e o link Obtainium está presente, mas cada nova release ainda precisa ser verificada. Não trate metadados versionados ou workflows configurados como prova de publicação/aprovação em uma loja.
