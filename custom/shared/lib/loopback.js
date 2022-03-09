const offerOptions = {
  offerVideo: true,
  offerAudio: true,
  offerToReceiveAudio: false,
  offerToReceiveVideo: false,
};

/**
 * WebAudio in Chrome does not provide any native echo cancellation.
 * This Loopback is used to create a workaround for the following Chromium issue:
 * https://bugs.chromium.org/p/chromium/issues/detail?id=687574
 *
 * Implementation based on https://gist.github.com/alexciarlillo/4b9f75516f93c10d7b39282d10cd17bc
 * as well as loopback examples here: https://webrtc.github.io/samples/
 */

export class Loopback {
  peer1;
  peer2;
  loopbackStream;
  offer;
  answer;

  async start(stream) {
    this.loopbackStream = new MediaStream();
    this.peer1 = new RTCPeerConnection();
    this.peer2 = new RTCPeerConnection();
    this.peer1.onicecandidate = (e) => this.onIceCandidate(this.peer1, e);
    this.peer2.onicecandidate = (e) => this.onIceCandidate(this.peer2, e);

    this.peer2.ontrack = (e) => {
      this.loopbackStream.addTrack(e.track);
    };
    stream.getAudioTracks().forEach((t) => {
      this.peer1.addTrack(t);
    });

    const offer = await this.peer1.createOffer(offerOptions);
    await this.peer1.setLocalDescription(offer);

    await this.peer2.setRemoteDescription(offer);
    const answer = await this.peer2.createAnswer();
    await this.peer2.setLocalDescription(answer);

    await this.peer1.setRemoteDescription(answer);
  }

  getLoopback() {
    return this.loopbackStream;
  }

  destroy() {
    this.peer1.close();
    this.peer2.close();
  }

  onIceCandidate(conn, event) {
    this.getOtherConn(conn).addIceCandidate(event.candidate);
  }

  getOtherConn(conn) {
    return conn === this.peer1 ? this.peer2 : this.peer1;
  }
}
