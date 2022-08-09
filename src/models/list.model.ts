import { v4 as UUID } from "uuid";

export interface IProps {
  id?: string;
  name: string;
}

export interface IListInterface extends IProps {
  timestamp: number;
}

export default class ListModel {
  private readonly _id: string;
  private _name: string;

  constructor({ id = undefined, name = "" }: IProps) {
    this._id = id ?? UUID();
    this._name = name;
  }

  get id(): string {
    return this._id;
  }

  set name(value: string) {
    this._name = value;
  }

  get name(): string {
    return this._name;
  }

  toEntityMappings(): IListInterface {
    return {
      id: this.id,
      name: this.name,
      timestamp: new Date().getTime(),
    };
  }
}
