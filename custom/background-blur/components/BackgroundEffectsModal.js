import React, { useState } from 'react';
import { CardBody } from '@custom/shared/components/Card';
import Field from '@custom/shared/components/Field';
import Modal from '@custom/shared/components/Modal';
import VerticalTab from '@custom/shared/components/VerticalTab';
import Well from '@custom/shared/components/Well';
import { useCallState } from '@custom/shared/contexts/CallProvider';
import { useUIState } from '@custom/shared/contexts/UIStateProvider';
import RangeSlider from './RangeSlider';

export const BACKGROUND_EFFECTS_MODAL = 'effects';

export const BackgroundEffectsModal = () => {
  const [blur, setBlur] = useState(0);
  const [image, setImage] = useState(null);
  const [activeTab, setActiveTab] = useState('background-blur');
  const { currentModals, closeModal } = useUIState();
  const { callObject, supportsVideoProcessing } = useCallState();

  const tabs = [
    { name: 'background-blur', label: 'Blur'},
    { name: 'background-image', label: 'Image'}
  ];

  const handleChange = (e) => {
    if (activeTab === 'background-blur') {
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
    } else {
      setImage(e.target.files[0]);
      callObject.updateInputSettings({
        video: {
          processor: {
            type: 'background-image',
            config: { url: URL.createObjectURL(e.target.files[0]) },
            publish: true,
          },
        },
      });
    }
  }

  return (
    <Modal
      title="Background Effects"
      isOpen={currentModals[BACKGROUND_EFFECTS_MODAL]}
      onClose={() => closeModal(BACKGROUND_EFFECTS_MODAL)}
    >
      <CardBody>
        {!supportsVideoProcessing ? (
          <Well variant="error">
            Background effects are not enabled for this room (or your browser does not
            support it.) Please enable video processing ui when creating the room or via
            the Daily dashboard.
          </Well>
        ) : <p>Experimental: Background effects may cause your fan to run louder and your battery to be depleted more
          quickly.</p>
        }
        {supportsVideoProcessing && (
          <div className="effects">
            <VerticalTab tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab}>
              {activeTab === 'background-blur' ? (
                <Field label="Background blur">
                  <RangeSlider
                    min={0}
                    max={1}
                    step={0.1}
                    value={blur}
                    onChange={handleChange}
                  />
                </Field>
              ): (
                <Field label="Background image">
                  <input type="file" onChange={handleChange} />
                </Field>
              )}
            </VerticalTab>
          </div>
        )}
      </CardBody>
    </Modal>
  );
};

export default BackgroundEffectsModal;
