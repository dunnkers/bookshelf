import React, { Component } from 'react';
import ModalImage from 'react-modal-image'
import Skeleton from 'react-loading-skeleton';

import './App.css';
import ShelfIcon from './ShelfIcon';

class Book extends Component {
  render() {
    const { title, link, image_url, authors } = this.props.book;

    return (
      <div className="book">
        <ModalImage
          small={image_url}
          large={image_url}
          hideDownload={true}
          hideZoom={true}
        />
        <div className="title">
          <a href={link}>{title}</a>
        </div>
        <div className="author">
          {authors.author.name}
        </div>
      </div>
    );
  }
}

class Shelf extends Component {
  render() {
    let { books } = this.props.shelf;
    const dateCmp = (a, b) => (a < b) - (a > b); // stackoverflow q492994
    books = books.sort((a, b) => {
      if (a.read_at && b.read_at) {// has read_at data
        return dateCmp(new Date(a.read_at), new Date(b.read_at));
      }
      
      return 0;
    });

    return (
      <div className="shelf">
        {books.map((book, id) => (
          <Book book={book.book} key={id} />
        ))}
      </div>
    );
  }
}

class BookSkeleton extends Component {
  render() {
    const lines = Math.floor(Math.random() * 3) + 2;
    const lineArr = Array.from(Array(lines).keys());
    const width = () => Math.floor(Math.random() * 50) + 100;

    return (
      <div className="book">
        <Skeleton width={150} height={240} />
        <div className="title">
          {lineArr.map((_, index) => (
            <Skeleton width={width()} key={index} />
          ))}
        </div>
      </div>
    );
  }
}

class ShelfSkeleton extends Component {
  render() {
    return (
      <div className="shelf">
        {[1, 2, 3, 4, 5].map((book, id) => (
          <BookSkeleton key={id} />
        ))}
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shelf: false
    };
  }
  
  componentDidMount() {
    this.grab('https://goodreads-shelves.herokuapp.com/');
  }

  grab(url) {
    fetch(url).then((response) => response.json())
      .then(response => this.setState({ shelf: response }))
      .catch((error) => console.error(error));
  }

  update() {
    this.setState({ shelf: false });
    this.grab('https://goodreads-shelves.herokuapp.com/force-update');
  }

  render() {
    const year = new Date().getFullYear();

    return (
      <div className="App">
        <header className="App-header">
          Dunnkers' Digital Reading Shelf &nbsp;
          <ShelfIcon 
            loading={this.state.shelf ? false : true} 
            onClick={() => this.update()} />
        </header>
        <section>
          <h2 className="shelf-header">Currently reading</h2>
          {this.state.shelf ? <Shelf shelf={this.state.shelf.current} /> : <ShelfSkeleton />}
          <h2 className="shelf-header">Read</h2>
          {this.state.shelf ? <Shelf shelf={this.state.shelf.read} /> : <ShelfSkeleton />}
        </section>
        <footer>Dunnkers ♥ {year}</footer>
      </div>
    );
  }
}

export default App;
