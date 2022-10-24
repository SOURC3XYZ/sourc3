import { EditOrgForm } from '@components/shared/add-org';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { Organization } from '@types';
import React, { useCallback } from 'react';

type CreateProjectProps = {
  pkey: string;
  item: Organization;
  goBack: () => void;
};

function ModifyOrganization({
  item, pkey, goBack
}:CreateProjectProps) {
  const { setModifyOrg } = useEntitiesAction();

  const orgFields = {
    organization_name: item.organization_name,
    name: item.organization_name,
    short_title: item.organization_short_title,
    about: item.organization_about,
    telegram: item.organization_telegram,
    discord: item.organization_discord,
    website: item.organization_website,
    instagram: item.organization_instagram,
    logo_addr: item.organization_logo_ipfs_hash,
    twitter: item.organization_twitter,
    linkedin: item.organization_linkedin
  };

  const handleCreateProject = useCallback((state: typeof orgFields) => {
    setModifyOrg(state);
  }, []);

  const labels = {
    title: 'Modify Organization',
    nameLabel: 'Organization name',
    namePlaceholder: 'Enter organization name',
    shortDescPlaceholder: 'Organization short description',
    longDescPlaceholder: 'Organization description'
  };

  return (
    <EditOrgForm
      pkey={pkey}
      isDescription
      labels={labels}
      goBack={goBack}
      callback={handleCreateProject}
      {...orgFields}
    />
  );
}

export default React.memo(ModifyOrganization);
