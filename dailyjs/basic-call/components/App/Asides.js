import React from 'react';
import { PeopleAside } from '@dailyjs/shared/components/Aside/PeopleAside';
import { useUIState } from '@dailyjs/shared/contexts/UIStateProvider';

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
