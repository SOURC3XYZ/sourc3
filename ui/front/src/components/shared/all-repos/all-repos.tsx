import { useAllRepos } from '@libs/hooks/container/all-repos';
import { EntityList, EntityWrapper } from '@components/shared';
import RepoItem from './repo-item';

const placeholder = 'type your repo name or ID';

function AllRepos() {
  const containerProps = useAllRepos(true);

  const {
    pkey,
    type,
    path,
    page,
    searchText,
    items,
    setInputText,
    deleteRepo
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

  const listItem = (item: typeof items[number]) => (
    <RepoItem
      item={item}
      path={path}
      searchText={searchText}
      deleteRepo={deleteRepo}
    />
  );

  return (
    <EntityWrapper
      title="Repositories"
      placeholder={placeholder}
      type={type}
      pkey={pkey}
      searchText={searchText}
      navItems={navItems}
      setInputText={setInputText}
    >
      <EntityList
        searchText={searchText}
        renderItem={listItem}
        path={path}
        page={page}
        items={items}
        type={type}
      />
    </EntityWrapper>
  );
}

export default AllRepos;
