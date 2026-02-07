import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc
} from '@angular/fire/firestore';

import { FirestoreQuery } from '../model/firestore-query.model';

@Injectable({
  providedIn: 'root'
})
export class FirestoreGenericService<T> {

  constructor(private firestore: Firestore) {}

  // ================= BASIC =================

  async getDocs(
    collectionName: string,
    q?: FirestoreQuery
  ): Promise<T[]> {

    const ref = collection(this.firestore, collectionName);
    const queryRef = this.buildQuery(ref, q);

    const snap = await getDocs(queryRef);
    return snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as Record<string, any>)
    })) as T[];
  }

  async getDocById(
    collectionName: string,
    id: string
  ): Promise<T | null> {
    const ref = doc(this.firestore, `${collectionName}/${id}`);
    const snap = await getDoc(ref);
    return snap.exists()
      ? ({ id: snap.id, ...snap.data() } as T)
      : null;
  }

  async createDoc(
    collectionName: string,
    data: T
  ) {
    return addDoc(collection(this.firestore, collectionName), data as any);
  }

  async updateDocById(
    collectionName: string,
    id: any,
    data: Partial<T>
  ) {
    return updateDoc(
      doc(this.firestore, `${collectionName}/${id}`),
      data
    );
  }

  async deleteDocById(
    collectionName: string,
    id: string
  ) {
    return deleteDoc(
      doc(this.firestore, `${collectionName}/${id}`)
    );
  }

  // ================= QUERY BASED =================

  async getDocByQuery(collectionName: string, q: FirestoreQuery): Promise<T | null> {
    const docs = await this.getDocs(collectionName, q);

    if (!docs.length) return null;

    return docs[0];
  }

  async updateDocByQuery(
  collectionName: string,
  q: FirestoreQuery,
  data: Partial<T>
) {
  const ref = collection(this.firestore, collectionName);
  const queryRef = this.buildQuery(ref, q);
  const snap = await getDocs(queryRef);

  if (snap.empty) return null;

  const updates = snap.docs.map(d =>
    updateDoc(d.ref, data) // هنا نستخدم d.ref مباشرة
  );

  return Promise.all(updates);
}

  async deleteDocByQuery(
    collectionName: string,
    q: FirestoreQuery
  ) {
    const docs = await this.getDocs(collectionName, q);

    const deletes = docs.map((d: any) =>
      deleteDoc(
        doc(this.firestore, `${collectionName}/${d.id}`)
      )
    );

    return Promise.all(deletes);
  }

  // ================= INTERNAL =================

  private buildQuery(ref: any, q?: FirestoreQuery) {
    if (!q) return ref;

    let constraints: any[] = [];

    q.where?.forEach(w =>
      constraints.push(where(w.field, w.operator, w.value))
    );

    q.orderBy?.forEach(o =>
      constraints.push(orderBy(o.field, o.direction || 'asc'))
    );

    if (q.limit) {
      constraints.push(limit(q.limit));
    }

    return query(ref, ...constraints);
  }
}
