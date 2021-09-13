import PrebuiltCall from '../components/PrebuiltCall';
import Header from '../components/Header';

export default function Home() {
  return (
    <>
      <PrebuiltCall />
      <style jsx>{`
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
      `}</style>
    </>
  );
}
