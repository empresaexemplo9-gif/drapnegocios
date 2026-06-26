'use client';

import { signOut } from 'next-auth/react';

export function SairBotao() {
  return (
    <button onClick={() => signOut({ callbackUrl: '/' })} className="btn-secundario !px-4 !py-2">
      Sair
    </button>
  );
}
