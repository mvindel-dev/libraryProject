// catalog.component.ts
import { Component, OnInit } from '@angular/core';
import { Book } from 'src/app/models/book';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.css'],
})
export class CatalogComponent implements OnInit {
  
  searchQuery: string = '';

  constructor(private _bookService: BookService) {}

  ngOnInit(): void {
    this._bookService.lBooks$.subscribe(
      (data: Book[]) => {
        this.lBooks = data;
      },
      (error) => {
        console.error('Error al obtener libros', error);
      }
    );
    this.loadBooks();
  }

  get lBooks(): Book[] {
    return this._bookService.lBooks;
  }

  set lBooks(books: Book[]) {
    this._bookService.lBooks = books;
  }

  loadBooks(): void {
    this._bookService.getBooks().subscribe(
      (data: Book[]) => {
        this.lBooks = data;
      },
      (error) => {
        console.error('Error al obtener libros', error);
      }
    );
  }

  addNewBookCatalog(): void {
    const nuevoLibro: Book = {
      title: 'Nuevo Libro',
      author: 'Nuevo Autor',
      description: 'Descripción del nuevo libro',
      nCopies: 10,
      nBorrowedCopies: 0,
      img: 'url_de_la_imagen',
    };

    this._bookService.addBook(nuevoLibro);
  }

  updateCopies(title: string, author: string, newCopies: number): void {
    this._bookService.updateCopies(title, author, newCopies);
  }

  reserveCopy(book: Book, copiesReserved: number): void {
    this._bookService.reserveCopy(book, copiesReserved);
  }

  returnCopy(book: Book, returnedCopies: number): void {
    this._bookService.returnCopy(book, returnedCopies);
  }

  onSearchChange(): void {
    this._bookService.searchSubject.next(this.searchQuery);
  }
}
