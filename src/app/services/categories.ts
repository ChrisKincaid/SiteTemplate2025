import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData } from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Categories {
  constructor(private firestore: Firestore) {}

  loadData(): Observable<any[]> {
    console.log('Categories service loadData() called');
    // Modern Firebase v9+ syntax for loading collection data
    const categoriesRef = collection(this.firestore, 'categories');
    console.log('Categories collection reference created');
    return collectionData(categoriesRef, { idField: 'id' }).pipe(
      map(categories => {
        console.log('Raw categories from Firebase:', categories);
        const mappedCategories = categories.map(category => ({
          id: category['id'],
          data: category
        }));
        console.log('Mapped categories:', mappedCategories);
        return mappedCategories;
      })
    );
  }
}
