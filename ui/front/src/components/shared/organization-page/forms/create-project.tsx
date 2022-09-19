import { EditOrgForm } from '@components/shared/add-org';
import { useEntitiesAction } from '@libs/hooks/thunk';
import React, { useCallback } from 'react';

type CreateProjectProps = {
  pkey: string;
  orgId: number;
  goBack: () => void;
};

function CreateProject({ pkey, orgId, goBack }:CreateProjectProps) {
  const { createProject } = useEntitiesAction();

  const orgFields = {
    organization_id: orgId,
    name: '',
    short_title: '',
    telegram: '',
    discord: '',
    website: '',
    instagram: '',
    logo_addr: '',
    twitter: '',
    linkedin: ''
  };

  const handleCreateProject = useCallback((state: typeof orgFields) => createProject(state), []);

  const labels = {
    title: 'Create Project',
    nameLabel: 'Project name',
    namePlaceholder: 'Enter project name',
    shortDescPlaceholder: 'Project short description',
    longDescPlaceholder: 'Project description'
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

export default React.memo(CreateProject);
