# Manual de empacotamento e publicação — Pad2PS

Este manual descreve o estado do repositório Pad2PS e seus procedimentos de release. Os comandos foram alinhados a `.github/workflows/release.yml` e `.github/workflows/publish-stores.yml`. **Build local**, **publicação automatizada** e **assinatura** são coisas distintas: uma etapa só é considerada configurada quando o workflow, os segredos e os metadados correspondentes estão presentes.

## 1. Projeto, arquitetura e versões

Pad2PS é uma aplicação React/Vite para web, empacotada para Desktop com Electron e para Android com Capacitor. O aplicativo web é compilado uma vez e copiado para os empacotadores nativos.

| Caminho | Função |
|---|---|
| `src/` | Aplicação React/TypeScript, componentes, hooks e lógica de controles |
| `public/` | Ativos web/PWA copiados pelo Vite |
| `api/` | Funções serverless do site |
| `desktop/` | Processo Electron, ícones, configuração do electron-builder e manifestos Linux |
| `android/` | Projeto Capacitor, dependências JS e, em `android/android/`, projeto nativo Gradle |
| `fastlane/metadata/android/` | Textos e changelogs localizados para uma eventual submissão à Google Play |
| `snap/` | Manifesto e launcher do Snap |
| `store-assets/` | Texto e imagens auxiliares de listagem |
| `.github/workflows/` | Build/release multiplataforma, publicação Snap/AUR e notificação Discord |
| `.github/scripts/generate_debian_changelog.py` | Gera changelog Debian a partir de `RELEASE_NOTES.md` |
| `io.github.rbtswift.Pad2PS.metainfo.xml` | Metadados AppStream na raiz, incluídos no `.deb` |

Versões declaradas atualmente nos manifests: Node.js 22 no CI; React 19, Vite 8, Tailwind CSS 4 e TypeScript 7 no app web; Electron 45 e electron-builder 26 no Desktop; Capacitor 6.2 no Android; JDK 17, Android Gradle Plugin 8.2.1 e Gradle 8.2.1 no build Android. O Android declara `minSdkVersion 22`, `compileSdkVersion 34` e `targetSdkVersion 34`. Consulte `package.json`, `desktop/package.json`, `android/package.json`, `android/android/build.gradle`, `android/android/variables.gradle` e `android/android/gradle/wrapper/gradle-wrapper.properties` para os valores e intervalos exatos.

A versão da release neste checkout é `1.0.6`; o `versionCode` Android é `7`. Os lockfiles fixam a resolução das dependências; não substitua indiscriminadamente toda ocorrência de `1.0.6`, pois também pode ser versão de dependência.

## 2. Pré-requisitos e build local

Use uma cópia limpa do repositório e os comandos a partir da raiz. Para builds locais, instale Node.js 22 e npm. Os passos Linux precisam de ferramentas de empacotamento; os Android, JDK 17 e Android SDK; builds Windows devem ser executados em Windows.

### 2.1 Linux: AppImage, `.deb`, `.rpm` e `.tar.gz`

Em Ubuntu/Debian, instale os utilitários ausentes (`rpm` é necessário para gerar RPM):

```bash
sudo apt-get update
sudo apt-get install -y rpm
```

Compile o site e empacote o Desktop:

```bash
npm ci
npm run build
cd desktop
npm ci
npm run prepare-web
npx electron-builder --linux AppImage deb rpm --publish never
```

O Electron Builder grava os resultados em `desktop/release/`. Para produzir os nomes de artefatos usados pela release e o tarball AUR/Snap/Flatpak, ainda na pasta `desktop/`:

```bash
VERSION="$(node -p "require('./package.json').version")"
mkdir -p artifacts
cp release/*.AppImage "artifacts/Pad2PS-${VERSION}-x86_64.AppImage"
chmod +x "artifacts/Pad2PS-${VERSION}-x86_64.AppImage"
tar -czf "artifacts/Pad2PS-${VERSION}-x86_64.tar.gz" -C release linux-unpacked
cp release/*.deb "artifacts/Pad2PS-${VERSION}-amd64.deb"
cp release/*.rpm "artifacts/Pad2PS-${VERSION}-x86_64.rpm"
```

Artefatos esperados:

* `Pad2PS-<versão>-x86_64.AppImage`
* `Pad2PS-<versão>-amd64.deb`
* `Pad2PS-<versão>-x86_64.rpm`
* `Pad2PS-<versão>-x86_64.tar.gz` (contém `linux-unpacked/`)

Valide antes de distribuir:

```bash
file artifacts/*
sha256sum artifacts/*
dpkg-deb --info artifacts/Pad2PS-*-amd64.deb
rpm -qip artifacts/Pad2PS-*.rpm
tar -tzf artifacts/Pad2PS-*.tar.gz | head
```

Teste o AppImage em uma máquina Linux compatível:

```bash
chmod +x artifacts/Pad2PS-*.AppImage
./artifacts/Pad2PS-*.AppImage
```

O comando `npm run pack:linux` existe, mas só solicita o alvo `AppImage`; para gerar também `.deb` e `.rpm`, use o comando `npx electron-builder` acima.

### 2.2 Linux: bundle `.flatpak`

O workflow gera um **bundle Flatpak** a partir do tarball `linux-unpacked`, não um repositório Flathub. Requer `flatpak`, `flatpak-builder`, Python 3 e os runtimes do manifesto:

```bash
sudo apt-get install -y flatpak flatpak-builder
flatpak remote-add --user --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
flatpak install --user --noninteractive flathub \
  org.freedesktop.Platform//25.08 org.freedesktop.Sdk//25.08
```

Depois de gerar `artifacts/Pad2PS-<versão>-x86_64.tar.gz` na seção anterior, execute na pasta `desktop/`. A preparação abaixo segue a substituição de URL/checksum feita no workflow:

```bash
VERSION="$(node -p "require('./package.json').version")"
SOURCE="Pad2PS-${VERSION}-x86_64.tar.gz"
SOURCE_SHA="$(sha256sum "artifacts/${SOURCE}" | cut -d' ' -f1)"
cp io.github.rbtswift.Pad2PS.yml flatpak-ci.yml
python3 - "$SOURCE" "$SOURCE_SHA" <<'PY'
import pathlib, re, sys
source, checksum = sys.argv[1:]
manifest = pathlib.Path("flatpak-ci.yml")
content = manifest.read_text()
content, url_count = re.subn(
    r"(?m)^(\s*url:\s*).+Pad2PS-[^\s]+-x86_64\.tar\.gz\s*$",
    rf"\g<1>file://{pathlib.Path('artifacts', source).resolve()}",
    content, count=1)
content, checksum_count = re.subn(
    r"(?m)^(\s*sha256:\s*)[0-9a-f]{64}\s*$",
    rf"\g<1>{checksum}", content, count=1)
if url_count != 1 or checksum_count != 1:
    raise SystemExit("Não foi possível preparar o manifesto Flatpak")
manifest.write_text(content)
PY
flatpak-builder --user --force-clean --default-branch=stable \
  --repo=flatpak_repo flatpak_build flatpak-ci.yml
flatpak build-bundle --user --arch=x86_64 flatpak_repo \
  "artifacts/Pad2PS-${VERSION}-x86_64.flatpak" \
  io.github.rbtswift.Pad2PS stable
rm flatpak-ci.yml
```

Para validar/instalar localmente:

```bash
flatpak install --user --bundle "artifacts/Pad2PS-${VERSION}-x86_64.flatpak"
flatpak run io.github.rbtswift.Pad2PS
```

O manifesto `desktop/io.github.rbtswift.Pad2PS.yml` declara runtime/SDK 25.08 e checksum do tarball da versão. O workflow cria um manifesto temporário e troca URL/checksum pelo tarball local; não atualiza nem publica o manifesto versionado no Flathub.

### 2.3 Windows: Setup e Portable `.exe`

Execute em Windows com Node.js 22:

```powershell
npm ci
npm run build
Set-Location desktop
npm ci
npm run prepare-web
npm run pack:win
```

Os executáveis ficam em `desktop/release/`, com nomes `Pad2PS-<versão>-Setup.exe` e `Pad2PS-<versão>-Portable.exe`. Para verificar assinatura Authenticode:

```powershell
Get-AuthenticodeSignature .\release\Pad2PS-*-Setup.exe
Get-AuthenticodeSignature .\release\Pad2PS-*-Portable.exe
```

O workflow fornece `CSC_LINK` e `CSC_KEY_PASSWORD` a partir dos secrets `WINDOWS_CERTIFICATE` e `WINDOWS_CERTIFICATE_PASSWORD`. A configuração define `publisherName`, mas isso **não comprova** que o certificado esteja configurado; sem certificado válido, os arquivos podem sair sem assinatura. Configure o certificado de assinatura e confira o resultado de `Get-AuthenticodeSignature` antes de distribuir.

### 2.4 Android: APK e AAB

O diretório Gradle é `android/android/`. O build precisa de JDK 17 e Android SDK instalado/configurado. Para gerar builds locais assinados, coloque o keystore de release em `android/android/app/signing.keystore` e defina as três variáveis usadas pelo Gradle:

```bash
export ANDROID_KEYSTORE_PASSWORD='...'
export ANDROID_KEY_ALIAS='...'
export ANDROID_KEY_PASSWORD='...'

npm ci
npm run build
cd android
npm ci
npx cap sync android
cd android
./gradlew assembleRelease bundleRelease
```

Saídas:

* APK: `android/android/app/build/outputs/apk/release/`
* AAB: `android/android/app/build/outputs/bundle/release/`

O APK é apropriado para instalação direta e pode ser referenciado pelo Obtainium quando anexado à GitHub Release. O AAB é o formato para enviar ao Google Play Console; não é instalável diretamente como APK.

Verifique a assinatura e a integridade antes de entregar:

```bash
apksigner verify --verbose --print-certs android/android/app/build/outputs/apk/release/*.apk
jarsigner -verify -verbose -certs android/android/app/build/outputs/bundle/release/*.aab
```

Compare o certificado do APK com o certificado permanente de distribuição. A chave precisa ser a mesma entre versões instaladas diretamente para permitir atualização in-place. Para Play, valide também o AAB no Play Console ou com `bundletool validate --bundle=<arquivo.aab>`.

**Limitação importante:** `android/android/app/build.gradle` seleciona a assinatura de debug quando o keystore ou qualquer variável de senha/alias não existe. Portanto, `assembleRelease` pode terminar com artefatos chamados `release` que estão assinados com chave de debug. Não distribua esses arquivos como release. `versionCode` precisa aumentar a cada nova submissão à Play; o código atual é `7`.

### 2.5 Assinaturas: o que o projeto configura

| Formato | Estado demonstrado pelo código atual |
|---|---|
| `.deb`, `.rpm`, `.AppImage`, `.tar.gz` | Não há assinatura individual configurada no build Linux |
| `.flatpak` | O bundle é criado sem opção de assinatura GPG |
| Índices APT | `Release.gpg` e `InRelease` são assinados **somente** se `GPG_PRIVATE_KEY` e `GPG_PASSPHRASE` forem configurados |
| `.exe` | Assinatura depende dos secrets de certificado Windows; valide Authenticode |
| `.apk` / `.aab` | Keystore de release é opcional no script, mas sem ele a saída usa assinatura debug e não serve como release oficial |

Não publique um artefato como “assinado” sem confirmar a assinatura usando a ferramenta de validação da plataforma.

## 3. GitHub Actions e publicação da GitHub Release

`.github/workflows/release.yml` dispara ao enviar uma tag `v*` ou manualmente por **Actions → Release Multiplataforma Pad2PS (Desktop & Android) → Run workflow**, informando a tag a reconstruir. O workflow:

1. Compila site e Desktop em Ubuntu 22, gera AppImage, `.deb`, `.rpm`, `.tar.gz` e `.flatpak`.
2. Compila Setup e Portable em Windows.
3. Só executa o job Android se a variável de repositório `ANDROID_SIGNING_ENABLED` for exatamente `true`.
4. Anexa os artefatos à GitHub Release e atualiza os índices APT no branch `gh-pages`.

O job de publicação requer que Linux e Windows terminem com sucesso. Android pode estar concluído ou `skipped`. A tag deve existir e apontar ao commit que contém todas as atualizações de versão.

Para release normal, depois de atualizar os arquivos e validar localmente:

```bash
git status --short
git add <arquivos-de-versão-e-notas>
git commit -m "Release vX.Y.Z"
git push origin main
git tag -a vX.Y.Z -m "Pad2PS vX.Y.Z"
git push origin vX.Y.Z
```

O push da tag dispara o build e a criação da GitHub Release. A execução manual do workflow apenas reconstrói/publica os artefatos da tag indicada; não substitui atualizar e enviar o código antes da tag. A publicação Snap/AUR inicia no evento `release.published`.

Segredos/variáveis esperados pelos workflows:

| Nome | Uso |
|---|---|
| `GPG_PRIVATE_KEY`, `GPG_PASSPHRASE` | Assinatura opcional de `Release.gpg` e `InRelease` do APT |
| `WINDOWS_CERTIFICATE`, `WINDOWS_CERTIFICATE_PASSWORD` | Assinatura do Windows (`CSC_LINK`, `CSC_KEY_PASSWORD`) |
| Variável `ANDROID_SIGNING_ENABLED=true` | Habilita o job Android |
| `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD` | Keystore/credenciais Android; configure todas para assinatura de release |
| `SNAPCRAFT_STORE_CREDENTIALS` | Upload à Snap Store |
| `AUR_SSH_PRIVATE_KEY`, `AUR_KNOWN_HOSTS` | Push autenticado para o AUR |
| `DISCORD_WEBHOOK` | Notificação opcional de release no Discord |

## 4. Repositório APT em GitHub Pages

O job `publish-release` baixa os artefatos Linux, instala `dpkg-dev` e `gnupg`, gera a partir dos `.deb`:

* `Packages`, por `dpkg-scanpackages -m . /dev/null`, com os nomes de arquivo relativos ao diretório dos artefatos;
* `Packages.gz`, comprimido com gzip;
* `Release`, com distribuição `stable`, arquitetura `amd64`, componente `main` e hashes SHA-256/tamanhos de `Packages` e `Packages.gz`;
* `Release.gpg`, assinatura destacada, e `InRelease`, assinatura *clear-signed* do `Release`, **apenas** quando a chave GPG e a passphrase estão disponíveis.

Os arquivos e o changelog Debian são copiados para `gh-pages:apt/` (changelog em `apt/changelogs/`) e o workflow faz commit/push para `gh-pages`. O script `.github/scripts/generate_debian_changelog.py` extrai os bullets em Português de `RELEASE_NOTES.md`.

Verificações manuais depois da publicação, usando os arquivos obtidos de `https://rbtswift.github.io/Pad2PS/apt/`:

```bash
gzip -t Packages.gz
gpg --verify InRelease
gpg --verify Release.gpg Release
```

Os dois últimos comandos exigem a chave pública confiável importada no GPG local. A assinatura do índice não equivale a assinatura individual do `.deb`.

**Pontos a corrigir/confirmar antes de recomendar instalação via APT:** `desktop/pad2ps.list` atualmente declara `deb [trusted=yes] https://github.com/RbtSwift/Pad2PS/releases/latest/download/ ./`, enquanto os índices são publicados em `https://rbtswift.github.io/Pad2PS/apt/`. Além de apontar para um local diferente do workflow, `[trusted=yes]` desabilita a validação normal de assinatura pelo APT. O repositório não configura importação/instalação de chave pública nem cliente APT verificando `InRelease`; a presença condicional de assinaturas no Pages, sozinha, não configura um canal APT autenticado.

## 5. Lojas e distribuição externa

| Canal | Arquivos e estado no repositório | Ação/limitação |
|---|---|---|
| Snap Store | `snap/snapcraft.yaml`, `snap/launch`; `publish-stores.yml` baixa tarball da release, substitui versão/URL/SHA-256, compila e publica no canal `stable` | Publicação automatizada quando a GitHub Release é publicada. Requer `SNAPCRAFT_STORE_CREDENTIALS` válido. O manifesto versionado não é atualizado pelo workflow. |
| AUR | `PKGBUILD`, `.SRCINFO`; workflow atualiza versão, fontes e checksums da release, clona `pad2ps` e envia os dois arquivos | Push automatizado após release com `AUR_SSH_PRIVATE_KEY` e `AUR_KNOWN_HOSTS`. O conteúdo gerado no job não é commitado de volta no Pad2PS. |
| Flathub | `desktop/io.github.rbtswift.Pad2PS.yml` é o manifesto de build; `desktop/io.github.rbtswift.Pad2PS.metainfo.xml` fornece AppStream | O workflow só produz o bundle `.flatpak`; não submete ao Flathub. Atualize URL/checksum do tarball e metadados e faça/acompanhe a submissão pelo processo do Flathub. |
| Google Play / Fastlane | `fastlane/metadata/android/{pt-BR,en-US}/` contém título, descrições, ícones e changelogs; `store-assets/STORE_LISTING.md` é material auxiliar | Não há `Fastfile` nem etapa de upload à Play no workflow. Configure manualmente a Play Console, assinatura/Play App Signing, imagens e submissão; atualize `versionCode` e changelog por código. A pasta `phoneScreenshots` contém apenas `.gitkeep`. |
| Obtainium | Link de inclusão no README e no rodapé do site aponta para o repositório GitHub | Não há workflow/manifesto específico do Obtainium. Publique APK assinado na GitHub Release e confirme que o padrão de asset/tag é reconhecido pelo app Obtainium. Sem o job Android habilitado, a release não terá APK/AAB. |
| GitHub Releases | `.github/workflows/release.yml` anexa artefatos Linux, Windows e, se habilitado, Android | É o fluxo automatizado principal. `workflow_dispatch` aceita tag existente para reconstrução. |
| Discord | `.github/workflows/discord-changelog.yml` | Notifica release publicada se `DISCORD_WEBHOOK` estiver configurado. |

## 6. Preparar e lançar uma nova versão

Antes de criar a tag, escolha uma versão sem o prefixo `v` para os manifests (ex.: `1.0.7`) e uma tag `v1.0.7`. Atualize de forma consistente:

1. **Versões npm e lockfiles:** `package.json`, `desktop/package.json`, `android/package.json`; regenere `package-lock.json`, `desktop/package-lock.json` e `android/package-lock.json` na respectiva pasta (`npm install --package-lock-only`).
2. **Android:** `android/android/app/build.gradle` (`versionName` e `versionCode`; sempre incremente o `versionCode`). Atualize os changelogs de `fastlane/metadata/android/{pt-BR,en-US}/changelogs/` usando o novo `versionCode` como nome do arquivo. O job Android também depende de `ANDROID_SIGNING_ENABLED=true` e dos quatro secrets Android.
3. **Versão visível e verificação de atualização web:** `src/utils/updateChecker.ts`, `src/App.tsx` e `src/components/SettingsPanel.tsx`.
4. **Metadados e material de release:** `io.github.rbtswift.Pad2PS.metainfo.xml`, `desktop/io.github.rbtswift.Pad2PS.metainfo.xml`, `RELEASE_NOTES.md`, `store-assets/STORE_LISTING.md` e conteúdo do novo changelog Fastlane. Atualize datas e release notes; preserve o histórico de versões nos metadados.
5. **Manifesto Flathub:** `desktop/io.github.rbtswift.Pad2PS.yml`: versão na URL e SHA-256 do novo `Pad2PS-<versão>-x86_64.tar.gz`. O checksum só pode ser calculado depois que o tarball final estiver publicado/gerado. Submeta a atualização ao Flathub separadamente.
6. **Manifestos mantidos neste repositório:** alinhe `snap/snapcraft.yaml`, `PKGBUILD` e `.SRCINFO` para que a árvore principal não fique desatualizada. O workflow de lojas atualiza Snap em memória e prepara PKGBUILD/.SRCINFO para o push AUR, mas não grava essas alterações neste repositório.
7. **Documentação:** o cabeçalho atual de `README.md` ainda cita `v1.0.0`; corrija a versão ao atualizar o README para não manter essa informação obsoleta.

Procure todas as referências antes de fechar o commit:

```bash
rg -n 'versionCode|versionName|1\.0\.[0-9]+' \
  package.json desktop android src README.md RELEASE_NOTES.md \
  io.github.rbtswift.Pad2PS.metainfo.xml store-assets fastlane snap PKGBUILD .SRCINFO
```

Não faça substituição global em lockfiles: além da versão do pacote na raiz de cada lock, a mesma sequência pode ser uma versão independente de dependência. Os workflows atualizam índices APT, Snap e AUR durante a publicação, mas não atualizam automaticamente os metadados versionados do Flathub, Android/Play, telas do app ou lockfiles.

Depois de atualizar:

```bash
npm ci && npm run lint && npm run build
```

Rode também o build correspondente à plataforma de distribuição. Revise as assinaturas Android/Windows e hashes; confira se o tarball final tem o nome e o conteúdo esperados. Faça commit e push do código para `main`, crie a tag anotada no commit de release e envie a tag. Monitore o workflow **Release Multiplataforma Pad2PS (Desktop & Android)**; depois da criação/publicação da release, acompanhe **Publish Snap Store and AUR** e **Discord release notification**. Uma falha de credenciais externas exige corrigir os secrets e reexecutar a publicação adequada.

## 7. Sincronizar artefatos finais

Após a GitHub Release de **Pad2PS** estar publicada com todos os assets e a release do **Pad2PS-Launcher** também estar disponível, execute o sincronizador fornecido fora deste repositório:

```bash
cd /home/eusolravi/Projetos/finalizados
./sync-releases.sh --check-only
./sync-releases.sh
```

O script requer `gh` autenticado, `jq`, `sha256sum`, `stat` e `diff`. Primeiro baixa releases de `RbtSwift/Pad2PS` e `RbtSwift/Pad2PS-Launcher`, confere o manifesto de assets, nomes, tamanhos e SHA-256 publicados pelo GitHub e faz preflight de conflitos. `--check-only` valida sem alterar as pastas de destino. A execução normal arquiva a versão atualmente em `Versao atual/` em `Versoes anteriores/`, organiza a nova versão por plataforma e atualiza `LEIA-ME.md`.

Para Pad2PS, os assets são separados em `Linux/`, `Linux/APT/`, `Windows/` e `Android/`; tipos não classificados (por exemplo imagens/textos) ficam na pasta da versão. O sincronizador espera que as releases de **ambos** os repositórios tenham assets, e aborta se o nome/tamanho/hash não corresponder ou se já houver conteúdo diferente no destino. Não remova nem substitua manualmente os diretórios conflitantes sem revisar a saída do preflight.

## 8. Limitações verificadas

* O job Android não roda por padrão; depende da variável de repositório `ANDROID_SIGNING_ENABLED=true`. Sem keystore/credenciais completas, o Gradle usa chave debug.
* A assinatura GPG dos índices APT é condicional; assinatura de artefatos Linux e Flatpak não está configurada nos comandos de build.
* `desktop/pad2ps.list` usa `[trusted=yes]` e aponta para o caminho de download da GitHub Release, diferente do diretório `apt/` em GitHub Pages onde o workflow grava índices. Não trate a configuração atual como instalação APT autenticada sem corrigir e testar esse caminho.
* A geração do bundle `.flatpak` não equivale à publicação no Flathub.
* O workflow não publica na Google Play; Fastlane contém metadados, mas não configuração de deploy. Imagens de screenshots ainda não estão fornecidas.
* Snap e AUR têm automação de publicação; credenciais e estado das contas nas lojas são externos ao repositório.
* O workflow de release constrói `.tar.gz` para empacotar `linux-unpacked`; não há um alvo `.tar.gz` nativo no electron-builder configurado no `desktop/package.json`.
* A publicação em AUR/Snap começa após `release.published`, portanto depende do sucesso e da disponibilidade do tarball da GitHub Release.
