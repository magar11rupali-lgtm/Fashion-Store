import Image from "next/image";
import Header from './components/Header';
import Footer from './components/Footer';
import Hero from './components/Hero';
import BackToTop from './components/BackToTop';

export default function Home() {
  return (
    <div>
      <Header />   
      <Hero />
      <BackToTop />
      <Footer />
    </div>
  );
}
