import React from 'react';
import Button from '@custom/shared/components/Button';
import { Card, CardBody, CardHeader } from '@custom/shared/components/Card';
import { TextInput } from '@custom/shared/components/Input';
import Tile from '@custom/shared/components/Tile';
import VideoContainer from '@custom/shared/components/VideoContainer';
import { DEFAULT_ASPECT_RATIO } from '@custom/shared/constants';
import { useParticipants } from '@custom/shared/contexts/ParticipantsProvider';
import Container from './Container';
import Header from './Header';

export const InviteOthers = () => {
  const { localParticipant } = useParticipants();

  return (
    <Container>
      <Header />
      <VideoContainer>
        <div className="invite-wrapper">
          <div className="invite-others">
            <Card variant="dark">
              <CardHeader>Waiting for others to join?</CardHeader>
              <CardBody>
                <h3>Copy the link and invite them to the call!</h3>
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
            }
            
            .invite-others {
              margin: auto;
              text-align: center;
            }
            
            .link {
              display: flex;
              justify-content: center;
              gap: 10px;
            }
            
            .preview {
              position: absolute;
              bottom: 0;
              width: 186px;
            }
            
            :global(.invite-others .card) {
              border: 0!important;
              width: 40vw;
            }
            
            :global(.invite-others .card input) {
              width: 15vw;
            }
          `}</style>
        </div>
      </VideoContainer>
    </Container>
  )
}

export default InviteOthers;