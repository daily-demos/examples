import Index from '@dailyjs/basic-call/pages';
import getDemoProps from '@dailyjs/shared/lib/demoProps';

export async function getStaticProps() {
  const defaultProps = getDemoProps();

  // Pass through domain as prop
  return {
    props: defaultProps,
  };
}

export default Index;
