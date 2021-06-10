export const parseJWT = (token) => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
};

const keyMap = {
  ao: 'start_audio_off',
  ctoe: 'close_tab_on_exit',
  d: 'domainId',
  eje: 'eject_after_elapsed',
  ejt: 'eject_at_token_exp',
  er: 'enable_recording',
  exp: 'exp',
  iat: 'createdAt',
  nbf: 'nbf',
  o: 'isOwner',
  r: 'room',
  rome: 'redirect_on_meeting_exit',
  sr: 'start_cloud_recording',
  ss: 'enable_screenshare',
  u: 'username',
  ud: 'id',
  uil: 'lang',
  vo: 'start_video_off',
};

export const parseMeetingToken = (token) => {
  const parsed = parseJWT(token);
  const result = {};
  for (const [key, val] of Object.entries(parsed)) {
    result[keyMap[key]] = val;
  }
  return result;
};
