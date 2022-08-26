import React from 'react';
import styles from '@components/shared/profiles-page/profiles-page.module.scss';
import Avatar from 'boring-avatars';
import { useSelector } from '@libs/redux';
import { useForm, SubmitHandler } from 'react-hook-form';
import { InputCustom } from '@components/shared/input';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { IProfile } from '@types';
import TextArea from '@components/shared/profiles-page/input/textArea';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavButton } from '@components/shared';

function ProfilesEdit() {
  const { setModifyUser } = useEntitiesAction();
  const back = useLocation();
  const navigate = useNavigate();

  const profile = useSelector((state) => state.profile);

  const pkey = useSelector((state) => state.app.pkey);

  const initialState = {
    avatar: profile.user_avatar_ipfs_hash,
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
    register, handleSubmit, formState: { errors }
  } = useForm<IProfile>({
    defaultValues: initialState,
    mode: 'onChange'
  });

  const onCancel = () => navigate(-1);

  const onSubmit: SubmitHandler<IProfile> = (data) => {
    setModifyUser(data);
    onCancel();
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
            <Avatar size={160} />
          </div>
          <div className={styles.blockButtonLoad}>
            <NavButton name="Upload new photo" classes={styles.buttonUpload} />
            <NavButton name="Remove photo" classes={styles.buttonUpload} />
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
              label="NickName"
              {...register(
                'nickname',
                { setValueAs: (value) => (value.length ? `"${value}"` : value) }
              )}
            />
            <InputCustom
              label="Email"
              {...register(
                'email',
                { setValueAs: (value) => (value.length ? `"${value}"` : value) }
              )}
            />
            <TextArea
              label="Description"
              {...register(
                'description',
                { setValueAs: (value) => (value.length ? `"${value}"` : value) }
              )}
            />
            <fieldset className={styles.socialBlock}>
              <legend>Social networks</legend>
              <div className={styles.blockLeft}>
                <InputCustom
                  label="Web site"
                  {...register(
                    'website',
                    {
                      setValueAs: (value) => (value.length ? `"${value}"` : value)
                    }
                  )}
                />
                <InputCustom
                  label="Discord"
                  {...register(
                    'discord',
                    { setValueAs: (value) => (value.length ? `"${value}"` : value) }
                  )}
                />
                <InputCustom
                  label="Instagram"
                  {...register(
                    'instagram',
                    { setValueAs: (value) => (value.length ? `"${value}"` : value) }
                  )}
                />
              </div>
              <div className={styles.blockRight}>
                <InputCustom
                  label="Twitter"
                  {...register(
                    'twitter',
                    { setValueAs: (value) => (value.length ? `"${value}"` : value) }
                  )}
                />
                <InputCustom
                  label="LinkedIn"
                  {...register(
                    'linkedin',
                    { setValueAs: (value) => (value.length ? `"${value}"` : value) }
                  )}
                />
                <InputCustom
                  label="Telegram"
                  {...register(
                    'telegram',
                    { setValueAs: (value) => (value.length ? `"${value}"` : value) }
                  )}
                />
              </div>
            </fieldset>
            <div className={styles.blockButton}>
              <NavButton name="Cancel" onClick={onCancel} classes={styles.buttonCancel} />
              <NavButton name="Update info" type="submit" active classes={styles.button} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilesEdit;
