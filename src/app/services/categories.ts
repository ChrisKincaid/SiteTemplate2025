import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Categories {

  constructor(private firestore: Firestore) {}

  loadData(): Observable<any[]> {
    const categoriesRef = collection(this.firestore, 'categories');
    return collectionData(categoriesRef, { idField: 'id' }).pipe(
      map(categories => {
        const mappedCategories = categories.map(category => ({
          id: category['id'],
          data: category
        }));
        return mappedCategories;
      })
    );
  }
}
