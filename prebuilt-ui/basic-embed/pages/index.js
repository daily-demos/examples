import PrebuiltCall from '../components/PrebuiltCall';
import getDemoProps from '@dailyjs/shared/lib/demoProps';

export default function Index({ isConfigured = false }) {
  return (
    <>
      <PrebuiltCall configured={isConfigured} />
      <style jsx>{`
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100vh;
      `}</style>
    </>
  );
}

export async function getStaticProps() {
  const defaultProps = getDemoProps();

  return {
    props: defaultProps,
  };
}
