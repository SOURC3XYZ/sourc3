import { useAllRepos } from '@libs/hooks/container/all-repos';
import { EntityList } from '../entity-list';
import EntityWrapper from '../entity-wrapper/entity-wrapper';

function AllRepos() {
  const containerProps = useAllRepos();

  const {
    pkey, type, path, page, searchText, items, setInputText, deleteRepo
  } = containerProps;

  const navItems = [
    {
      key: 'all',
      to: `${path}repos/all/1`,
      text: 'All Repository'
    },
    {
      key: 'my',
      to: `${path}repos/my/1`,
      text: 'My Repository'
    }
  ];

  return (
    <EntityWrapper
      title="Repositories"
      type={type}
      pkey={pkey}
      searchText={searchText}
      navItems={navItems}
      setInputText={setInputText}
    >
      <EntityList
        searchText={searchText}
        deleteRepos={deleteRepo}
        path={path}
        page={page}
        items={items}
        type={type}
      />
    </EntityWrapper>
  );
}

export default AllRepos;
