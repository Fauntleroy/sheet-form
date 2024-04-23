import Image from 'next/image';

import css from './page.module.css';

import { Authorization } from '@/components/authorization';

export default function Home() {
  return (
    <main className={css.main}>
      <Image
        src="/sheet-form-logo.png"
        alt="A blue rectangle with a single form field named 'Name', covering a spreadsheet"
        width={125}
        height={125}
      />
      <h1>Sheet Form</h1>
      <Authorization />
    </main>
  );
}
