type groupElement = [string, any];

export const logger = (groupName: string, items: groupElement[]) => {
  console.group(groupName);
  items.forEach((el) => console.log(el[0], el[1]));
  console.groupEnd();
};
