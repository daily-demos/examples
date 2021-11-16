import React, { useState } from 'react';
import { CardBody } from '@custom/shared/components/Card';
import Modal from '@custom/shared/components/Modal';
import Well from '@custom/shared/components/Well';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import RangeSlider from './RangeSlider';

export const BACKGROUND_BLUR_MODAL = 'blur';

export const BackgroundBlurModal = () => {
  const [blur, setBlur] = useState(0);
  const { currentModals, closeModal } = useUIState();
  const { callObject, supportsVideoProcessing } = useCallState();

  const handleChange = (e) => {
    const value = e.target.valueAsNumber;
    setBlur(value);
    callObject.updateInputSettings({
      video: {
        processor: value === 0 ?
          {
            type: 'none',
            publish: true,
          } :
          {
            type: 'background-blur',
            config: { strength: value },
            publish: true,
          },
      },
    });
  }

  return (
    <Modal
      title="Background Blur"
      isOpen={currentModals[BACKGROUND_BLUR_MODAL]}
      onClose={() => closeModal(BACKGROUND_BLUR_MODAL)}
    >
      <CardBody>
        {!supportsVideoProcessing ? (
          <Well variant="error">
            Background blur is not enabled for this room (or your browser does not
            support it.) Please enable video processing ui when creating the room or via
            the Daily dashboard.
          </Well>
        ) : (
          <>
            <p>
              Experimental: Background blur may cause your fan to run louder and your battery to be depleted more quickly.
            </p>
            <RangeSlider
              min={0}
              max={1}
              step={0.1}
              value={blur}
              onChange={handleChange}
            />
          </>
        )}
      </CardBody>
    </Modal>
  );
};

export default BackgroundBlurModal;
