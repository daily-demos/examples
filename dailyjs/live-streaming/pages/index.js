import Index from '@dailyjs/basic-call/pages';

export async function getStaticProps() {
  // Check that both domain and key env vars are set
  const isConfigured =
    !!process.env.DAILY_DOMAIN && !!process.env.DAILY_API_KEY;

  // Pass through domain as prop
  return {
    props: {
      domain: process.env.DAILY_DOMAIN || null,
      isConfigured,
      forceFetchToken: true,
      forceOwner: true,
    },
  };
}

export default Index;
