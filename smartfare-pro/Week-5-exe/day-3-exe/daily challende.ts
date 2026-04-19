//  Interface
interface Book {
    title: string;
    author: string;
    isbn: string;
    publishedYear: number;
    genre?: string; // optional
}

//  Base Class
class Library {
    private books: Book[] = [];

    // Add a book
    public addBook(book: Book): void {
        this.books.push(book);
    }

    // Get book by ISBN
    public getBookDetails(isbn: string): Book | undefined {
        return this.books.find(book => book.isbn === isbn);
        
    }

    // Protected (so child class can access)
    protected getAllBooks(): Book[] {
        return this.books;
    }
}

//  Child Class (Inheritance)
class DigitalLibrary extends Library {
    readonly website: string;

    constructor(website: string) {
        super();
        this.website = website;
    }

    // List all book titles
    public listBooks(): string[] {
        return this.getAllBooks().map(book => book.title);
    }
}

//  Usage
const myLibrary = new DigitalLibrary("https://mylibrary.com");

// Add books
myLibrary.addBook({
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "111",
    publishedYear: 2008,
    genre: "Programming"
});

myLibrary.addBook({
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    isbn: "222",
    publishedYear: 1999
});

// Get details
console.log(myLibrary.getBookDetails("111"));

// List all titles
console.log(myLibrary.listBooks());