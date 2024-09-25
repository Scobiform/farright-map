import '../styles/globals.scss'
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
config.autoAddCss = false; // Tell FontAwesome to skip adding the CSS automatically since we did it manually


function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default MyApp
