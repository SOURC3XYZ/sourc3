import { EditOrgForm } from '@components/shared/add-org';
import { useEntitiesAction } from '@libs/hooks/thunk';
import { Project } from '@types';
import React, { useCallback } from 'react';

type CreateProjectProps = {
  pkey: string;
  project: Project;
  goBack: () => void;
};

function ModifyProject({
  project, pkey, goBack
}:CreateProjectProps) {
  const { setModifyProject } = useEntitiesAction();

  const projectFields = {
    organization_name: project.organization_name,
    project_name: project.project_name,
    name: project.project_name,
    short_title: project.project_description,
    telegram: project.project_telegram,
    discord: project.project_discord,
    website: project.project_website,
    instagram: project.project_instagram,
    logo_addr: project.project_logo_ipfs_hash,
    twitter: project.project_twitter,
    linkedin: project.project_linkedin
  };
  const handleCreateProject = useCallback((state: typeof projectFields) => {
    setModifyProject(state);
  }, []);

  const labels = {
    title: 'Modify Project',
    nameLabel: 'Project name',
    namePlaceholder: 'Enter Project name',
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
      {...projectFields}
    />
  );
}

export default React.memo(ModifyProject);
