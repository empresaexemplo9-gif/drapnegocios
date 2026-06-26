import { Suspense } from 'react';
import { Formulario } from './Formulario';

export const metadata = { title: 'Entrar' };

export default function EntrarPage() {
  return (
    <Suspense>
      <Formulario />
    </Suspense>
  );
}
