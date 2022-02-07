import Index from '@custom/basic-call/pages';
import getDemoProps from '@custom/shared/lib/demoProps';

export async function getStaticProps() {
  const defaultProps = getDemoProps();

  return {
    props: {
      ...defaultProps,
    },
  };
}

export default Index;
