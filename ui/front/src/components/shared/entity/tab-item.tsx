type TabItemProps = {
  title: string,
  count: number
};

function TabItem({ title, count }:TabItemProps) {
  return (
    <>
      <span>{title}</span>
      <span>{count}</span>
    </>
  );
}

export default TabItem;
