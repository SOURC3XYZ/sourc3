import { useAsyncError } from '@libs/hooks/shared';
import { useSelector } from '@libs/redux';
import { useLocation, useParams } from 'react-router-dom';

type LocationState = {
  branchName: string;
};

type UseCommitsTreeProps = {
  goTo: (route: string) => void;
};

const useCommitsTree = ({ goTo }: UseCommitsTreeProps) => {
  const repoMap = useSelector((state) => state.repo.repoMap);
  const commitsMap = useSelector((state) => state.repo.commitsMap);
  const setError = useAsyncError();
  const location = useLocation();
  const { pathname } = location;
  const { branchName } = useParams<'branchName'>() as LocationState;

  const goToBranch = (newBranch: string) => goTo(`commits/${newBranch}`);

  const goToCommit = (hash: string) => goTo(`commit/tree/${hash}`);

  const loading = !!repoMap && !!commitsMap;

  return {
    pathname,
    branchName,
    loading,
    commitsMap,
    repoMap,
    setError,
    goToBranch,
    goToCommit
  };
};

export default useCommitsTree;
