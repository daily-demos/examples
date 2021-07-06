import Index from '@dailyjs/basic-call/pages';
import getDemoProps from '@dailyjs/shared/lib/demoProps';

export async function getStaticProps() {
  const defaultProps = getDemoProps();

  return {
    props: {
      ...defaultProps,
      forceFetchToken: true,
      forceOwner: true,
    },
  };
}

export default Index;
