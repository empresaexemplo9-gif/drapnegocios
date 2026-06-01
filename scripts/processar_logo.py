"""Recorta a logo da ViajeBrasil num círculo com cantos transparentes.

Lê o PNG enviado (RGBA, 8 bits) e zera o alfa fora do círculo inscrito,
com uma borda suavizada (anti-aliasing). Sem dependências externas.
"""

import math
import os
import struct
import zlib


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
    bpp = 4
    stride = largura * bpp
    recon = bytearray()
    prev = bytearray(stride)
    p = 0

    def paeth(a, b, c):
        pp = a + b - c
        pa, pb, pc = abs(pp - a), abs(pp - b), abs(pp - c)
        if pa <= pb and pa <= pc:
            return a
        return b if pb <= pc else c

    for _ in range(altura):
        ft = bruto[p]
        p += 1
        linha = bytearray(bruto[p : p + stride])
        p += stride
        if ft == 1:
            for i in range(stride):
                a = linha[i - bpp] if i >= bpp else 0
                linha[i] = (linha[i] + a) & 255
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


def recortar_circulo(largura, altura, pixels):
    cx, cy = largura / 2.0, altura / 2.0
    raio = min(largura, altura) / 2.0
    borda = 1.5  # suavização em px
    for y in range(altura):
        base = y * largura * 4
        for x in range(largura):
            d = math.hypot(x + 0.5 - cx, y + 0.5 - cy)
            idx = base + x * 4 + 3
            if d <= raio - borda:
                continue
            if d >= raio:
                pixels[idx] = 0
            else:
                fator = (raio - d) / borda
                pixels[idx] = int(pixels[idx] * max(0.0, min(1.0, fator)))
    return pixels


def escrever_png_rgba(caminho, largura, altura, pixels):
    stride = largura * 4
    bruto = bytearray()
    for y in range(altura):
        bruto.append(0)
        bruto += pixels[y * stride : (y + 1) * stride]

    def chunk(tipo, corpo):
        c = tipo + corpo
        return struct.pack(">I", len(corpo)) + c + struct.pack(">I", zlib.crc32(c))

    ihdr = struct.pack(">IIBBBBB", largura, altura, 8, 6, 0, 0, 0)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(bruto), 9))
        + chunk(b"IEND", b"")
    )
    with open(caminho, "wb") as f:
        f.write(png)


if __name__ == "__main__":
    base = os.path.join(os.path.dirname(__file__), "..", "assets")
    entrada = os.environ.get("LOGO_IN", "/tmp/logo_upload.png")
    saida = os.path.join(base, "logo.png")
    w, h, px = ler_png_rgba(entrada)
    px = recortar_circulo(w, h, px)
    escrever_png_rgba(saida, w, h, px)
    print(f"gerado {saida} ({w}x{h}) com cantos transparentes")
