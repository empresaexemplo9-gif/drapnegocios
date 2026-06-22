"""Gera os ícones do app a partir da logo oficial (assets/logo.png).

Produz, sem dependências externas:
- icon.png          1024x1024, fundo branco opaco (iOS não aceita transparência).
- adaptive-icon.png 1024x1024, fundo branco, símbolo na zona segura (Android).
- favicon.png       48x48, fundo branco (web).
- public/icons/*    192/512 PWA, fundo branco.

Por padrão os ÍCONES usam apenas o SÍMBOLO (mapa do Brasil) — sem o texto
"viaje brasil" nem a borda do círculo, sobre fundo branco. A região do símbolo
é recortada da logo via frações configuráveis (env), pois a logo tem texto
embaixo. Ajuste fino com as variáveis de ambiente, conferindo o resultado:

    SIMBOLO=1 (padrão)         usa só o mapa nos ícones; SIMBOLO=0 usa a logo inteira
    SIMB_L / SIMB_T           canto superior-esquerdo do recorte (frações 0..1)
    SIMB_R / SIMB_B           canto inferior-direito do recorte (frações 0..1)
    SIMB_PAD                  margem ao redor do símbolo no ícone (fração; padrão 0.12)

A splash e a logo dentro do app continuam usando a logo.png inteira.
"""

import math
import os
import struct
import zlib

# Recorte padrão do símbolo (mapa) dentro da logo circular. Estimativa para a
# arte com o mapa em cima e o texto embaixo; afine pelos envs SIMB_* e confira.
SIMBOLO = os.environ.get("SIMBOLO", "1") != "0"
SIMB_L = float(os.environ.get("SIMB_L", "0.27"))
SIMB_T = float(os.environ.get("SIMB_T", "0.15"))
SIMB_R = float(os.environ.get("SIMB_R", "0.74"))
SIMB_B = float(os.environ.get("SIMB_B", "0.60"))
SIMB_PAD = float(os.environ.get("SIMB_PAD", "0.12"))


# ---------- decodificação ----------
def ler_png_rgba(caminho):
    with open(caminho, "rb") as f:
        dados = f.read()
    assert dados[:8] == b"\x89PNG\r\n\x1a\n", "não é PNG"
    pos = 8
    largura = altura = bitdepth = colortype = None
    idat = bytearray()
    while pos < len(dados):
        (tam,) = struct.unpack(">I", dados[pos : pos + 4])
        tipo = dados[pos + 4 : pos + 8]
        corpo = dados[pos + 8 : pos + 8 + tam]
        if tipo == b"IHDR":
            largura, altura, bitdepth, colortype = struct.unpack(">IIBB", corpo[:10])
        elif tipo == b"IDAT":
            idat += corpo
        elif tipo == b"IEND":
            break
        pos += 12 + tam
    assert bitdepth == 8 and colortype == 6, f"esperado RGBA 8-bit, veio {bitdepth}/{colortype}"

    bruto = zlib.decompress(bytes(idat))
    bpp, stride = 4, largura * 4
    recon = bytearray()
    prev = bytearray(stride)
    p = 0

    def paeth(a, b, c):
        pp = a + b - c
        pa, pb, pc = abs(pp - a), abs(pp - b), abs(pp - c)
        return a if pa <= pb and pa <= pc else (b if pb <= pc else c)

    for _ in range(altura):
        ft = bruto[p]
        p += 1
        linha = bytearray(bruto[p : p + stride])
        p += stride
        if ft == 1:
            for i in range(stride):
                linha[i] = (linha[i] + (linha[i - bpp] if i >= bpp else 0)) & 255
        elif ft == 2:
            for i in range(stride):
                linha[i] = (linha[i] + prev[i]) & 255
        elif ft == 3:
            for i in range(stride):
                a = linha[i - bpp] if i >= bpp else 0
                linha[i] = (linha[i] + ((a + prev[i]) >> 1)) & 255
        elif ft == 4:
            for i in range(stride):
                a = linha[i - bpp] if i >= bpp else 0
                c = prev[i - bpp] if i >= bpp else 0
                linha[i] = (linha[i] + paeth(a, prev[i], c)) & 255
        recon += linha
        prev = linha
    return largura, altura, recon


# ---------- operações ----------
def redimensionar(px, sw, sh, dw, dh):
    """Reamostragem bilinear de RGBA."""
    out = bytearray(dw * dh * 4)
    ex = (sw - 1) / max(1, dw - 1)
    ey = (sh - 1) / max(1, dh - 1)
    for y in range(dh):
        fy = y * ey
        y0 = int(fy)
        y1 = min(y0 + 1, sh - 1)
        wy = fy - y0
        for x in range(dw):
            fx = x * ex
            x0 = int(fx)
            x1 = min(x0 + 1, sw - 1)
            wx = fx - x0
            i00 = (y0 * sw + x0) * 4
            i01 = (y0 * sw + x1) * 4
            i10 = (y1 * sw + x0) * 4
            i11 = (y1 * sw + x1) * 4
            o = (y * dw + x) * 4
            for c in range(4):
                top = px[i00 + c] * (1 - wx) + px[i01 + c] * wx
                bot = px[i10 + c] * (1 - wx) + px[i11 + c] * wx
                out[o + c] = int(top * (1 - wy) + bot * wy + 0.5)
    return out


def canvas(w, h, rgba):
    buf = bytearray(w * h * 4)
    for i in range(0, len(buf), 4):
        buf[i : i + 4] = bytes(rgba)
    return buf


def colar(base, bw, img, iw, ih, ox, oy):
    """Compõe `img` (RGBA) sobre `base` na posição (ox, oy), com alpha."""
    for y in range(ih):
        for x in range(iw):
            s = (y * iw + x) * 4
            a = img[s + 3]
            if a == 0:
                continue
            d = ((oy + y) * bw + (ox + x)) * 4
            ia = 255 - a
            for c in range(3):
                base[d + c] = (img[s + c] * a + base[d + c] * ia) // 255
            base[d + 3] = min(255, a + base[d + 3] * ia // 255)
    return base


def escrever_png_rgba(caminho, w, h, px):
    stride = w * 4
    bruto = bytearray()
    for y in range(h):
        bruto.append(0)
        bruto += px[y * stride : (y + 1) * stride]

    def chunk(tipo, corpo):
        c = tipo + corpo
        return struct.pack(">I", len(corpo)) + c + struct.pack(">I", zlib.crc32(c))

    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(bytes(bruto), 9))
        + chunk(b"IEND", b"")
    )
    with open(caminho, "wb") as f:
        f.write(png)
    print(f"gerado {os.path.basename(caminho)} ({w}x{h})")


def aspecto(sw, sh, alvo):
    """Dimensões que cabem `alvo` mantendo proporção."""
    if sw >= sh:
        return alvo, max(1, round(sh / sw * alvo))
    return max(1, round(sw / sh * alvo)), alvo


def recortar_frac(px, sw, sh, l, t, r, b):
    """Recorta a região [l,t,r,b] (frações 0..1) e retorna (w, h, pixels)."""
    x0, y0 = max(0, int(l * sw)), max(0, int(t * sh))
    x1, y1 = min(sw, int(r * sw)), min(sh, int(b * sh))
    cw, ch = max(1, x1 - x0), max(1, y1 - y0)
    out = bytearray(cw * ch * 4)
    for y in range(ch):
        src = ((y0 + y) * sw + x0) * 4
        out[y * cw * 4 : (y + 1) * cw * 4] = px[src : src + cw * 4]
    return cw, ch, out


def achatar_branco(px):
    """Compõe sobre branco (remove transparência) — cantos do círculo viram branco."""
    out = bytearray(px)
    for i in range(0, len(out), 4):
        a = out[i + 3]
        if a < 255:
            ia = 255 - a
            for c in range(3):
                out[i + c] = (out[i + c] * a + 255 * ia) // 255
            out[i + 3] = 255
    return out


def icone_branco(fonte, fw, fh, tam, pad):
    """Coloca `fonte` (RGBA) centralizada num quadrado branco `tam`, com margem `pad`."""
    util = max(1, int(tam * (1 - 2 * pad)))
    dw, dh = aspecto(fw, fh, util)
    redim = redimensionar(fonte, fw, fh, dw, dh)
    cv = canvas(tam, tam, (255, 255, 255, 255))
    colar(cv, tam, redim, dw, dh, (tam - dw) // 2, (tam - dh) // 2)
    return cv


if __name__ == "__main__":
    base_dir = os.path.join(os.path.dirname(__file__), "..", "assets")
    sw, sh, logo = ler_png_rgba(os.path.join(base_dir, "logo.png"))

    BRANCO = (255, 255, 255, 255)
    VAZIO = (255, 255, 255, 0)

    # Fonte dos ícones: só o SÍMBOLO (mapa) recortado e achatado sobre branco,
    # ou a logo inteira (SIMBOLO=0). Sempre sem transparência (fundo branco).
    if SIMBOLO:
        fw, fh, fonte = recortar_frac(logo, sw, sh, SIMB_L, SIMB_T, SIMB_R, SIMB_B)
        fonte = achatar_branco(fonte)
        print(f"símbolo recortado: {fw}x{fh} (de {sw}x{sh})")
    else:
        fw, fh, fonte = sw, sh, achatar_branco(logo)

    # 1) icon.png — 1024 fundo branco (iOS não aceita transparência)
    escrever_png_rgba(os.path.join(base_dir, "icon.png"), 1024, 1024, icone_branco(fonte, fw, fh, 1024, SIMB_PAD))

    # 2) adaptive-icon.png — 1024 fundo branco (Android, backgroundColor branco)
    escrever_png_rgba(os.path.join(base_dir, "adaptive-icon.png"), 1024, 1024, icone_branco(fonte, fw, fh, 1024, max(SIMB_PAD, 0.18)))

    # 3) favicon.png — 48 fundo branco
    escrever_png_rgba(os.path.join(base_dir, "favicon.png"), 48, 48, icone_branco(fonte, fw, fh, 48, SIMB_PAD))

    # 4) ícones do PWA (web instalável) em ../public/icons
    pub = os.path.join(base_dir, "..", "public", "icons")
    os.makedirs(pub, exist_ok=True)
    for tam in (192, 512):
        escrever_png_rgba(os.path.join(pub, f"icon-{tam}.png"), tam, tam, icone_branco(fonte, fw, fh, tam, SIMB_PAD))
