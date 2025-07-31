import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, orderBy, limit, getDocs, Timestamp } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SearchFilters {
  searchTerm: string;
  author?: string;
  subcategory?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy: 'relevance' | 'mostPopular' | 'newest' | 'oldest';
  maxResults?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  subCategory?: string;
  author: string;
  views: number;
  createdAt: any;
  postImg: string;
  titleMatch: boolean; // Whether the search term was found in the title
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor(private firestore: Firestore) { }

  searchPosts(params: any): Observable<SearchResult[]> {
    const filters: SearchFilters = {
      searchTerm: params.searchTerm || '',
      author: params.author || '',
      subcategory: params.subcategory || '',
      sortBy: params.sortBy || 'relevance'
    };

    // Convert date strings to Date objects if provided
    if (params.dateStart && params.dateEnd) {
      filters.dateRange = {
        start: new Date(params.dateStart),
        end: new Date(params.dateEnd)
      };
    }

    return from(this.performSearch(filters));
  }

  private async performSearch(filters: SearchFilters): Promise<SearchResult[]> {
    const postsRef = collection(this.firestore, 'posts');
    let baseQuery = query(postsRef);

    // Add date range filter if specified
    if (filters.dateRange) {
      const startTimestamp = Timestamp.fromDate(filters.dateRange.start);
      const endTimestamp = Timestamp.fromDate(filters.dateRange.end);
      baseQuery = query(baseQuery, 
        where('createdAt', '>=', startTimestamp),
        where('createdAt', '<=', endTimestamp)
      );
    }

    // Add author filter if specified
    if (filters.author && filters.author.trim()) {
      baseQuery = query(baseQuery, where('author', '==', filters.author.trim()));
    }

    // Add sorting (except for relevance which we'll handle manually)
    if (filters.sortBy === 'mostPopular') {
      baseQuery = query(baseQuery, orderBy('views', 'desc'));
    } else if (filters.sortBy === 'newest') {
      baseQuery = query(baseQuery, orderBy('createdAt', 'desc'));
    } else if (filters.sortBy === 'oldest') {
      baseQuery = query(baseQuery, orderBy('createdAt', 'asc'));
    }

    // Add limit if specified
    if (filters.maxResults) {
      baseQuery = query(baseQuery, limit(filters.maxResults));
    }

    const snapshot = await getDocs(baseQuery);
    const allPosts = snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    })) as any[];

    // Filter by search term and determine relevance
    const searchTerm = filters.searchTerm.toLowerCase().trim();
    
    const matchingPosts = allPosts.filter(post => {
      // Text search (only if search term is provided)
      let textMatch = true; // Default to true if no search term
      if (searchTerm) {
        const titleMatch = post.data.title?.toLowerCase().includes(searchTerm);
        const contentMatch = post.data.content?.toLowerCase().includes(searchTerm);
        const excerptMatch = post.data.excerpt?.toLowerCase().includes(searchTerm);
        textMatch = titleMatch || contentMatch || excerptMatch;
      }
      
      // Filter by subcategory if specified
      let subcategoryMatch = true;
      if (filters.subcategory && filters.subcategory.trim()) {
        subcategoryMatch = post.data.subcategories && 
                          Array.isArray(post.data.subcategories) && 
                          post.data.subcategories.includes(filters.subcategory.trim());
      }
      
      return textMatch && subcategoryMatch;
    }).map(post => ({
      ...post,
      titleMatch: searchTerm ? post.data.title?.toLowerCase().includes(searchTerm) : false
    }));

    // Sort by relevance if requested (title matches first)
    if (filters.sortBy === 'relevance') {
      matchingPosts.sort((a, b) => {
        // Title matches come first
        if (a.titleMatch && !b.titleMatch) return -1;
        if (!a.titleMatch && b.titleMatch) return 1;
        
        // Within same match type, sort by views (most popular)
        return (b.data.views || 0) - (a.data.views || 0);
      });
    }

    return matchingPosts;
  }

  // Get all unique authors for the author filter dropdown
  getAuthors(): Observable<string[]> {
    return from(this.getAllAuthors());
  }

  private async getAllAuthors(): Promise<string[]> {
    const postsRef = collection(this.firestore, 'posts');
    const snapshot = await getDocs(postsRef);
    
    const authors = new Set<string>();
    snapshot.docs.forEach(doc => {
      const author = doc.data()['author'];
      if (author) {
        authors.add(author);
      }
    });

    return Array.from(authors).sort();
  }

  // Get all subcategories for the subcategory filter dropdown
  getSubcategories(): Observable<string[]> {
    return from(this.getAllSubcategories());
  }

  private async getAllSubcategories(): Promise<string[]> {
    const subcategoriesRef = collection(this.firestore, 'subcategories');
    const snapshot = await getDocs(subcategoriesRef);
    
    const subcategories: string[] = [];
    snapshot.docs.forEach(doc => {
      const name = doc.data()['name'];
      if (name) {
        subcategories.push(name);
      }
    });

    return subcategories.sort();
  }
}
