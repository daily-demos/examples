import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonCard, IonItem, IonLabel, IonButton, IonCardContent, IonRow } from '@ionic/react';
import { Browser } from '@capacitor/browser';
import './Home.css';

const Home: React.FC = () => {

  const onClick = async () => {
    const callUrl = 'PLACE URL HERE';
    await Browser.open({ url: callUrl });
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Daily Webview</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent class="ion-padding">
        <IonCard>
          <IonItem>
            <IonLabel>Welcome to Daily 👋</IonLabel>
          </IonItem>
          <IonCardContent>
            Here's an example of the Daily prebuilt webview using Ionic that can be opened in the native app.
          </IonCardContent>
        </IonCard>
        <IonButton expand="block" color="primary" onClick={onClick}>Join Call</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
