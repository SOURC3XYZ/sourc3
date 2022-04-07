import { RC } from '@libs/action-creators';
import { ObjectDataResp } from '@types';
import { hexParser } from '@libs/utils';
import AbstractParser from './abstract-parser';

export default class TreeBlobParser extends AbstractParser {
  public readonly parseBlob = async (oid: string) => {
    const output = this.isIpfsHash(oid)
      ? await this.getIpfsData<string>(oid)
      : await this.getDataFromBC(oid);
    debugger;
    return output;
  };

  private readonly getDataFromBC = async (oid: string) => {
    const output = await this.call<ObjectDataResp>(RC.getData(this.id, oid));
    if (output.error) throw new Error(output.error);
    const str = hexParser(output.object_data);
    return str;
  };
}
