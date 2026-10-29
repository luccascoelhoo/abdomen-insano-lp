import { redirect } from 'next/navigation';

/** A V.2 virou a home: quem tem o link antigo de revisão cai na página oficial. */
export default function V2() {
  redirect('/');
}
