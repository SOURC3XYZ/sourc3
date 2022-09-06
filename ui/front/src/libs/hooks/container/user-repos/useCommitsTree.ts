import { useErrorBoundary } from '@components/context';
import { useSelector } from '@libs/redux';
import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { splitUrl } from './helpers';

type LocationState = {
  branchName: string;
};

type UseCommitsTreeProps = {
  goTo: (route: string) => void;
};

const useCommitsTree = ({ goTo }: UseCommitsTreeProps) => {
  const repoMap = useSelector((state) => state.repo.repoMap);
  const commitsMap = useSelector((state) => state.repo.commitsMap);
  const setError = useErrorBoundary();
  const location = useLocation();
  const { pathname } = location;
  const { branchName } = useParams<'branchName'>() as LocationState;

  const { params } = splitUrl(`commits/${branchName}`, pathname);

  const branchParsed = useMemo(() => branchName.replaceAll('-', '/'), [branchName]);

  const goToBranch = (newBranch: string) => goTo(`commits/${newBranch.replaceAll('/', '-')}`);

  const goToCommit = (hash: string) => goTo(`commit/tree/${hash}`);

  const loading = !!repoMap && !!commitsMap;

  return {
    params,
    branchName: branchParsed,
    loading,
    commitsMap,
    repoMap,
    setError,
    goToBranch,
    goToCommit
  };
};

export default useCommitsTree;
