/* eslint-disable max-len */
export const regExes = {
  name: /(.|\s)*\S(.|\s)*/,
  website: /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/,
  telegram: /.*\B@(?=\w{5,32}\b)[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)*.*/,
  discord: /^.{3,32}#[0-9]{4}$/,
  linkedin: /(in|pub)\/[A-z0-9_-]+\/?/,
  instagram: /^[a-zA-Z0-9._]+$/,
  twitter: /^[a-zA-Z0-9_]{1,15}$/
};
