import { RC } from '@libs/action-creators';
import { IDataNodeCustom, RepoTreeResp, TreeElement } from '@types';
import { DataNode } from 'antd/lib/tree';
import AbstractParser, { ParserProps } from './abstract-parser';

export enum FileCodes {
  FOLDER = 16384,
  LEAF = 33188
}

type TreeListObj = {
  key?: React.Key
};

export default class TreeListParser extends AbstractParser {
  children:IDataNodeCustom[] | null = null;

  key?: React.Key;

  constructor(
    parserProps: ParserProps & TreeListObj
  ) {
    super(parserProps);
    this.key = parserProps.key;
  }

  public getTree = async (oid: string, tree: DataNode[] | null) => {
    const output = this.isIpfsHash(oid)
      ? await this.getIpfsData<RepoTreeResp>(oid)
      : await this.call<RepoTreeResp>(RC.repoGetTree(this.id, oid));
    this.children = this.treeDataMaker(output.tree.entries || []);
    return this.updateTreeData(tree);
  };

  public readonly updateTreeData = (
    list: DataNode[] | null
  ): DataNode[] | null => {
    const { children } = this;
    if (this.key === undefined) return children;
    if (!list) return null;
    const newList = list.map((node) => {
      if (node.key === this.key) return { ...node, children };
      if (node.children) {
        return {
          ...node,
          children: this.updateTreeData(node.children)
        };
      }
      return node;
    });
    return newList as DataNode[];
  };

  private readonly treeDataMaker = (
    tree: TreeElement[] = []
  ):IDataNodeCustom[] => {
    const newTree = tree.sort(this.fileSorter).map((el, i) => ({
      title: el.filename,
      key: this.key !== undefined ? [this.key, i].join('-') : i,
      isLeaf: this.extCheck(el.attributes),
      dataRef: el
    }));
    return newTree;
  };

  private readonly extCheck = (attr:number):boolean => attr === FileCodes.LEAF;

  private readonly fileSorter = (a:TreeElement, b:TreeElement) => {
    const aLow = a.filename.toLocaleLowerCase();
    const bLow = b.filename.toLocaleLowerCase();
    const aExt = this.extCheck(a.attributes);
    const bExt = this.extCheck(b.attributes);
    if (aExt < bExt || aLow < bLow) { return -1; }
    if (aExt > bExt || aLow > bLow) { return 1; }
    return 0;
  };
}
