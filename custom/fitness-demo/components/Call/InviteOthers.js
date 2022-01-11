import React from 'react';
import Button from '@custom/shared/components/Button';
import { Card, CardBody, CardHeader } from '@custom/shared/components/Card';
import { TextInput } from '@custom/shared/components/Input';
import Tile from '@custom/shared/components/Tile';
import { DEFAULT_ASPECT_RATIO } from '@custom/shared/constants';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';

export const InviteOthers = () => {
  const { localParticipant } = useParticipants();

  return (
    <div className="invite-wrapper">
      <div className="invite-others">
        <Card variant="dark">
          <CardHeader>
            Waiting for others to join!
          </CardHeader>
          <CardBody>
            <div className="link">
              <TextInput
                variant="border"
                value={window.location.href}
                disabled
              />
              <Button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
              >
                Copy link
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
      <div className="preview">
        <Tile participant={localParticipant} mirrored aspectRatio={DEFAULT_ASPECT_RATIO} />
      </div>
      <style jsx>{`
        .invite-wrapper {
          display: flex;
          height: 100%;
          width: 100%;
          position: relative;
        }
        
        .invite-others {
          width: 50%;
          margin: auto;
          text-align: center;
        }
        
        .link {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        
        .preview {
          width: 186px;
        }
      `}
      </style>
    </div>
  )
}

export default InviteOthers;