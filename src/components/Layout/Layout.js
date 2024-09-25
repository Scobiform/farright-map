import Head from 'next/head';

import Header from '@components/Header';
import Footer from '@components/Footer';

import styles from './Layout.module.scss';

const Layout = ({ children, className, ...rest }) => {
  return (
    <div className={styles.layout}>
      <Head>
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <Header />
      <main className={styles.main}>{children}</main>
    </div>
  );
};

export default Layout;
