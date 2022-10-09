import message from 'antd/lib/message';

export const copyRefLink = (id: string) => {
  const repoLink = `${window.location.origin}/?ref_by=${id}`;
  navigator.clipboard.writeText(repoLink);
  return message.info(`${repoLink} copied to clipboard!`);
};

export const formatDate = (dateString:string) => {
  const options:Intl.DateTimeFormatOptions = {
    year: 'numeric', month: 'long', day: 'numeric'
  };

  const date = new Date(dateString);

  const dayAndYear = date.toLocaleString('en', options);
  const time = date.toLocaleString('en', { timeStyle: 'short' });
  return `${dayAndYear} ${time}`;
};
