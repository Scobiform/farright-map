import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('./DynamicMap'), {
  ssr: false
});

const Map = (props) => {
  return (
      <DynamicMap {...props} />
  )
}

export default Map;