"""Gera os ícones do app a partir da logo oficial (assets/logo.png).

Produz, sem dependências externas:
- icon.png          1024x1024, fundo branco opaco (iOS não aceita transparência).
- adaptive-icon.png 1024x1024, transparente, logo na zona segura (Android).
- favicon.png       48x48, fundo branco (web).

A splash continua usando a logo.png (círculo com cantos transparentes).
"""

import math
import os
import struct
import zlib


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


if __name__ == "__main__":
    base_dir = os.path.join(os.path.dirname(__file__), "..", "assets")
    sw, sh, logo = ler_png_rgba(os.path.join(base_dir, "logo.png"))

    BRANCO = (255, 255, 255, 255)
    VAZIO = (255, 255, 255, 0)

    # 1) icon.png — 1024 fundo branco opaco (full bleed)
    iw, ih = aspecto(sw, sh, 1024)
    redim = redimensionar(logo, sw, sh, iw, ih)
    icone = canvas(1024, 1024, BRANCO)
    colar(icone, 1024, redim, iw, ih, (1024 - iw) // 2, (1024 - ih) // 2)
    escrever_png_rgba(os.path.join(base_dir, "icon.png"), 1024, 1024, icone)

    # 2) adaptive-icon.png — 1024 transparente, logo a ~66% (zona segura Android)
    aw, ah = aspecto(sw, sh, 680)
    redim2 = redimensionar(logo, sw, sh, aw, ah)
    adapt = canvas(1024, 1024, VAZIO)
    colar(adapt, 1024, redim2, aw, ah, (1024 - aw) // 2, (1024 - ah) // 2)
    escrever_png_rgba(os.path.join(base_dir, "adaptive-icon.png"), 1024, 1024, adapt)

    # 3) favicon.png — 48 fundo branco
    fw, fh = aspecto(sw, sh, 48)
    redim3 = redimensionar(logo, sw, sh, fw, fh)
    fav = canvas(48, 48, BRANCO)
    colar(fav, 48, redim3, fw, fh, (48 - fw) // 2, (48 - fh) // 2)
    escrever_png_rgba(os.path.join(base_dir, "favicon.png"), 48, 48, fav)

    # 4) ícones do PWA (web instalável) em ../public/icons
    pub = os.path.join(base_dir, "..", "public", "icons")
    os.makedirs(pub, exist_ok=True)
    for tam in (192, 512):
        pw, ph = aspecto(sw, sh, tam)
        r = redimensionar(logo, sw, sh, pw, ph)
        cv = canvas(tam, tam, BRANCO)
        colar(cv, tam, r, pw, ph, (tam - pw) // 2, (tam - ph) // 2)
        escrever_png_rgba(os.path.join(pub, f"icon-{tam}.png"), tam, tam, cv)
