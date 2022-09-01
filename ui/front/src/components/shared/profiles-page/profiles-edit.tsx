import React, { useMemo, useRef, useState
} from 'react';
import styles from '@components/shared/profiles-page/profiles-page.module.scss';
import { useSelector } from '@libs/redux';
import { useForm, SubmitHandler } from 'react-hook-form';
import { InputCustom } from '@components/shared/input';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { IProfile } from '@types';
import TextArea from '@components/shared/profiles-page/input/textArea';
import { useNavigate } from 'react-router-dom';
import { NavButton } from '@components/shared';
import DefaultAvatar from 'boring-avatars';
import { useUpload } from '@libs/hooks/shared';
import Avatar from './avatar/avatar';

function ProfilesEdit() {
  const { setModifyUser } = useEntitiesAction();

  const navigate = useNavigate();

  const profile = useSelector((state) => state.profile);

  const pkey = useSelector((state) => state.app.pkey);

  const initialState = {
    avatar_addr: profile.user_avatar_ipfs_hash,
    id: pkey,
    names: profile.user_name,
    nickname: profile.user_nickname,
    email: profile.user_email,
    description: profile.user_description,
    website: profile.user_website,
    twitter: profile.user_twitter,
    instagram: profile.user_instagram,
    telegram: profile.user_telegram,
    linkedin: profile.user_linkedin,
    discord: profile.user_discord
  };

  const {
    register, handleSubmit, formState: { errors, isValid }, setValue
  } = useForm<IProfile>({
    defaultValues: initialState,
    mode: 'onChange'
  });

  const onCancel = () => navigate(-1);
  const [src, setSrc] = useState<string | null>(null);
  const { uploadToIpfs, getImgUrlFromIpfs } = useUpload();
  const inputFileRef = useRef(null);
  const handleChangeFile = async (e: any) => {
    try {
      const files = e.target.files[0];
      const data = await uploadToIpfs(files);
      const image = await getImgUrlFromIpfs(data.hash);
      if (image) {
        setSrc(image);
        setValue('avatar_addr', data.hash);
      }
    } catch (error) {
      console.log('error upload image', error);
    }
  };

  useMemo(async () => {
    const image = await getImgUrlFromIpfs(profile.user_avatar_ipfs_hash);
    setSrc(image);
  }, [profile.user_avatar_ipfs_hash]);

  const onSubmit: SubmitHandler<IProfile> = (data) => {
    setModifyUser(data);
    onCancel();
  };

  const checkUrl = (type:string, value:string) => {
    const pattern = new RegExp('((http|ftp|https):\\/\\/)?(([\\w.-]*)\\.([\\w]*))');

    if (!pattern.test(value)) {
      value = `https://${type}/${value}`;
    }
    return `${value}`;
  };

  const removePhoto = () => {
    setSrc('');
    setValue('avatar_addr', '');
  };
  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs} />
        <div className={styles.title}>
          <h3>Edit profile</h3>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.side}>
          <div className={styles.avatar}>
            {!profile.user_avatar_ipfs_hash
            || !src ? (<DefaultAvatar size={160} />)
              : (<Avatar url={src} />)}
          </div>
          <div className={styles.blockButtonLoad}>
            <NavButton
              onClick={() => (inputFileRef.current.click())}
              name="Upload new photo"
              classes={styles.buttonUpload}
            />
            <input ref={inputFileRef} type="file" onChange={handleChangeFile} hidden />
            <NavButton name="Remove photo" onClick={removePhoto} classes={styles.buttonUpload} />
            <div />
          </div>
        </div>
        <div className={styles.main}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <InputCustom
              label={errors.names?.message ? errors.names?.message : 'Name'}
              {...register(
                'names',
                {
                  setValueAs: (value) => (value.length ? `"${value}"` : value),
                  required: 'The field must be filled in '
                }
              )}
              placeholder="Name"
              valid={!errors.names?.message?.length}
            />
            <InputCustom
              label="Nickname"
              {...register(
                'nickname',
                { setValueAs: (value) => (value.length ? `"${value}"` : value) }
              )}
              placeholder="Nickname"
            />
            <InputCustom
              label={errors.email?.message || 'Email'}
              {...register(
                'email',
                {
                  pattern: {
                    value: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                    message: 'Please enter valid email'
                  }
                }
              )}
              // placeholder="name@domain"
              valid={!errors.email?.message?.length}
            />
            <TextArea
              label="Description"
              {...register(
                'description',
                { setValueAs: (value) => (value.length ? `"${value}"` : value) }
              )}
              placeholder="Tell us a little bit about yourself"
            />
            <fieldset className={styles.socialBlock}>
              <legend>Social networks</legend>
              <div className={styles.blockLeft}>
                <InputCustom
                  label={errors.website?.message || 'Web site'}
                  {...register(
                    'website',
                    {
                      pattern: {
                        value: /^(?:([A-Za-z]+):)?(\/{0,3})([0-9.\-A-Za-z]+)(?::(\d+))?(?:\/([^?#]*))?(?:\?([^#]*))?(?:#(.*))?$/,
                        message: 'Please enter correct url'
                      }
                    }
                  )}
                  placeholder="https://website.name/"
                  valid={!errors.website?.message?.length}
                  icon="website"
                />

                <InputCustom
                  label="LinkedIn"
                  {...register(
                    'linkedin',
                    {
                      setValueAs: (value) => (
                        (value ? checkUrl('linkedin.com/in', value) : value
                        ))
                    }
                  )}
                  placeholder="@nickname"
                  icon="linkedin"
                />
                <InputCustom
                  label={errors.telegram?.message || 'Telegram'}
                  {...register(
                    'telegram',
                    {
                      setValueAs: (value) => (
                        (value ? checkUrl('t.me', value) : value
                        ))
                    }
                  )}
                  placeholder="@nickname"
                  icon="telegram"
                />
              </div>

              <div className={styles.blockRight}>
                <InputCustom
                  label="Twitter"
                  {...register('twitter', {
                    setValueAs: (value) => (
                      (value ? checkUrl('twitter.com', value) : value
                      ))
                  })}
                  placeholder="@nickname"
                  icon="twitter"

                />
                <InputCustom
                  label="Instagram"
                  {...register(
                    'instagram',
                    {
                      setValueAs: (value) => (
                        (value ? checkUrl('instagram.com', value) : value
                        ))
                    }
                  )}
                  placeholder="@nickname"
                  icon="instagram"
                />

                <InputCustom
                  label="Discord"
                  {...register(
                    'discord',
                    {
                      setValueAs: (value) => (
                        (value ? checkUrl('discord.com', value) : value
                        ))
                    }
                  )}
                  placeholder="login#0000"
                  icon="discord"
                />

              </div>
            </fieldset>
            <div className={styles.blockButton}>
              <NavButton name="Cancel" onClick={onCancel} classes={styles.buttonCancel} />
              <NavButton name="Update info" type="submit" active classes={styles.button} isDisabled={!isValid} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilesEdit;
