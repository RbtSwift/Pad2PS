pkgname=pad2ps
pkgver=1.0.6
pkgrel=1
pkgdesc='Visual controller translator and diagnostic tool'
arch=('x86_64')
url='https://github.com/RbtSwift/Pad2PS'
license=('MIT')
depends=(
  'alsa-lib'
  'at-spi2-core'
  'cairo'
  'cups'
  'dbus'
  'expat'
  'gcc-libs'
  'glib2'
  'gtk3'
  'libdrm'
  'libx11'
  'libxcb'
  'libxcomposite'
  'libxdamage'
  'libxext'
  'libxfixes'
  'libxrandr'
  'libxrender'
  'libxss'
  'libxtst'
  'mesa'
  'nspr'
  'nss'
  'pango'
)
source=(
  "Pad2PS-${pkgver}-x86_64.tar.gz::https://github.com/RbtSwift/Pad2PS/releases/download/v${pkgver}/Pad2PS-${pkgver}-x86_64.tar.gz"
  "pad2ps.desktop::https://raw.githubusercontent.com/RbtSwift/Pad2PS/v${pkgver}/desktop/io.github.rbtswift.Pad2PS.desktop"
  "icon.png::https://raw.githubusercontent.com/RbtSwift/Pad2PS/v${pkgver}/desktop/icon.png"
)
sha256sums=(
  'a3d1e65204090647ca4d6a3560cb51af3dfec231f8c535898c149d926f3efef8'
  '738debfa4806ecf8e485c89a6c26b545c9e7e54c95820d92f7cc7f678065bca7'
  'c7a00744076ded68233a59c3a211b7440ef3bce3293eec4c9baf3d3e43786da6'
)

package() {
  install -d "$pkgdir/opt/Pad2PS"
  cp -a "$srcdir/linux-unpacked/." "$pkgdir/opt/Pad2PS/"

  install -Dm755 /dev/stdin "$pkgdir/usr/bin/pad2ps" <<'EOF'
#!/bin/sh
exec /opt/Pad2PS/pad2ps --no-sandbox "$@"
EOF
  install -Dm644 "$srcdir/pad2ps.desktop" "$pkgdir/usr/share/applications/io.github.rbtswift.Pad2PS.desktop"
  install -Dm644 "$srcdir/icon.png" "$pkgdir/usr/share/icons/hicolor/512x512/apps/io.github.rbtswift.Pad2PS.png"
}
