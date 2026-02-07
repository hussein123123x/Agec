export type FirestoreOperator =
  | '=='
  | '!='
  | '<'
  | '<='
  | '>'
  | '>='
  | 'array-contains'
  | 'in'
  | 'array-contains-any';

export interface FirestoreWhere {
  field: string;
  operator: FirestoreOperator;
  value: any;
}

export interface FirestoreOrderBy {
  field: string;
  direction?: 'asc' | 'desc';
}

export interface FirestoreQuery {
  where?: FirestoreWhere[];
  orderBy?: FirestoreOrderBy[];
  limit?: number;
}
