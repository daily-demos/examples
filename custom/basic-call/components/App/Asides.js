import React from 'react';
import { PeopleAside } from '@custom/shared/components/Aside/PeopleAside';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';

export const Asides = () => {
  const { asides } = useUIState();

  return (
    <>
      <PeopleAside />
      {asides.map((AsideComponent) => (
        <AsideComponent key={AsideComponent.name} />
      ))}
    </>
  );
};

export default Asides;
