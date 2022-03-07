import React from 'react';
import { NetworkAside } from '@custom/shared/components/Aside';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import { PeopleAside } from '../Call/PeopleAside';

export const Asides = () => {
  const { asides } = useUIState();

  return (
    <>
      <PeopleAside />
      <NetworkAside />
      {asides.map((AsideComponent) => (
        <AsideComponent key={AsideComponent.name} />
      ))}
    </>
  );
};

export default Asides;
