import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { catchError, tap, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  private _lbooks = 'assets/json/books.json';
  private _localStorageKey = 'booksData';
  public searchSubject: Subject<string> = new Subject<string>();

  constructor(private http: HttpClient) {
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((query) => this.searchBooks(query))
    ).subscribe(
      (data: Book[]) => {
        this.lBooksChanged.next(data);
      },
      (error) => {
        console.error('Error al buscar libros', error);
      }
    );
  }

  private lBooksChanged: Subject<Book[]> = new Subject<Book[]>();

  get lBooks$(): Observable<Book[]> {
    return this.lBooksChanged.asObservable();
  }

  private _lBooks: Book[] = [];

  get lBooks(): Book[] {
    return this._lBooks;
  }

  set lBooks(books: Book[]) {
    this._lBooks = books;
    this.lBooksChanged.next(books);
  }

  getBooks(): Observable<Book[]> {
    const cachedData = this.getCachedData();

    if (cachedData) {
      return of(cachedData);
    } else {
      return this.fetchBooksFromJson();
    }
  }

  addBook(newBook: Book): void {
    const existingData = this.getCachedData() || [];
    existingData.push(newBook);
    this.setLocalStorageData(existingData);
    this.lBooks = existingData;
  }

  searchBooks(query: string): Observable<Book[]> {
    const cachedData = this.getCachedData();

    if (cachedData) {
      const filteredBooks = cachedData.filter(
        (book) =>
          book.title.toLowerCase().includes(query.toLowerCase()) ||
          book.author.toLowerCase().includes(query.toLowerCase())
      );
      return of(filteredBooks);
    }

    return of([]);
  }

  updateCopies(title: string, author: string, newCopies: number): void {
    const existingData = this.getCachedData() || [];
    const updatedData = existingData.map((book) => {
      if (book.title === title && book.author === author) {
        return { ...book, nCopies: newCopies };
      }
      return book;
    });
    this.setLocalStorageData(updatedData);
    this.lBooks = updatedData;
  }

  reserveCopy(book: Book, copiesReserved: number): void {
    book.nBorrowedCopies += copiesReserved;
    book.nCopies--;
    this.updateBook(book);
  }

  returnCopy(book: Book, returnedCopies: number): void {
    book.nBorrowedCopies -= returnedCopies;
    book.nCopies++;
    this.updateBook(book);
  }

  getBook(title: string, author: string): Book | undefined {
    const cachedData = this.getCachedData();

    if (cachedData) {
      return cachedData.find((book) => book.title === title && book.author === author);
    }

    return undefined;
  }

  private fetchBooksFromJson(): Observable<Book[]> {
    return this.http.get<Book[]>(this._lbooks).pipe(
      tap((data) => {
        this.setLocalStorageData(data);
        this.lBooks = data;
      }),
      catchError((error) => {
        console.error('Error en la solicitud HTTP', error);
        throw error;
      })
    );
  }

  private getCachedData(): Book[] | null {
    const cachedDataString = localStorage.getItem(this._localStorageKey);

    if (cachedDataString) {
      return JSON.parse(cachedDataString);
    }

    return null;
  }

  private setLocalStorageData(data: Book[]): void {
    localStorage.setItem(this._localStorageKey, JSON.stringify(data));
  }

  private updateBook(book: Book): void {
    const existingData = this.getCachedData() || [];
    const index = existingData.findIndex((b) => b.title === book.title && b.author === book.author);

    if (index !== -1) {
      existingData[index] = book;
      this.setLocalStorageData(existingData);
      this.lBooks = existingData;
    }
  }
}
