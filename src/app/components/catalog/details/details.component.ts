import { Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Book } from 'src/app/models/book';
import { BookService } from 'src/app/services/book.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.css']
})
export class DetailsComponent {
  public id: number = 0;

  constructor(private _activatedRoute: ActivatedRoute, private _bookService: BookService, private _router:Router) {
    this._activatedRoute.params.subscribe(
      (params: Params) => {
        this.id = Number(params['id']);
      }
    );
  }

  lBooks: Book[] = [];

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this._bookService.getBooks().subscribe(
      (data: Book[]) => {
        this.lBooks = data;
      },
      error => {
        console.error('Error al obtener libros', error);
      }
    );
  }

  reserveCopyCatalog(book: Book): void {
    if (book.nCopies > 0) {
      this._bookService.reserveCopy(book, 1);
    }
  }

  returnCopyCatalog(book: Book): void {
    if (book.nBorrowedCopies > 0) {
      this._bookService.returnCopy(book, 1);
    }
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
    this.loadBooks();
  }

  updateCopiesCatalog(libro: Book, nuevasCopias: number): void {
    this._bookService.updateCopies(libro.title, libro.author, nuevasCopias);
    this.loadBooks();
  }


  seeNextBook() {
    this.id++;
    this._router.navigate(['catalog', this.id]);
    console.log(this.lBooks.length);
  }

  seePreviousBook() {
    this.id--;
    this._router.navigate(['catalog', this.id]);
  }

}
