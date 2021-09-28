import React from 'react';
import { NetworkAside } from '@custom/shared/components/Aside';
import { PeopleAside } from '@custom/shared/components/Aside';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';

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
