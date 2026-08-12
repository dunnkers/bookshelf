require 'goodreads'
require 'nokogiri'
require 'open-uri'
require 'json'
require 'fileutils'

GOODREADS_API_KEY = ENV['GOODREADS_API_KEY']
GOODREADS_USER_ID = ENV['GOODREADS_USER_ID']

abort 'Error: Environment variable `GOODREADS_API_KEY` not set.' unless GOODREADS_API_KEY
abort 'Error: Environment variable `GOODREADS_USER_ID` not set.' unless GOODREADS_USER_ID

ROOT_DIR = File.expand_path('..', __dir__)
CACHE_FILE = File.join(ROOT_DIR, 'data', 'cover_cache.json')
SHELVES_FILE = File.join(ROOT_DIR, 'data', 'shelves.json')

$client = Goodreads::Client.new(api_key: GOODREADS_API_KEY)
$cover_cache = File.exist?(CACHE_FILE) ? JSON.parse(File.read(CACHE_FILE)) : {}

# Book cover images aren't available through the Goodreads API, so they are
# scraped from the book's page instead. Results are cached (and the cache is
# committed back to the repo) so we don't re-scrape a book we've already seen.
def grab_book_cover(book_link)
  doc = Nokogiri::HTML(URI.open(book_link))
  image_selector = '.BookCard__cover > .BookCover > .BookCover__image > div > img'
  image = doc.css(image_selector)
  image[0] if image && image.length > 0
end

def fix_book_cover(book)
  cache_key = book.id.to_s
  cached_image_url = $cover_cache[cache_key]

  if cached_image_url
    book.book.image_url = cached_image_url
    puts "From cache: #{cached_image_url}"
    return book
  end

  cover = grab_book_cover(book.book.link)
  if cover
    image_url = cover['src']
    book.book.image_url = image_url
    $cover_cache[cache_key] = image_url
    puts "Grabbed: #{image_url}"
  end

  book
end

def fetch_shelves
  read_options = { # See https://www.goodreads.com/api/index#reviews.list
    sort: 'date_read',
    per_page: 200 # max amount that goodreads lets us fetch.
    # -> if more than 200, will need to resort to: `page` option
  }

  read = $client.shelf(GOODREADS_USER_ID, 'read', read_options)
  read.books = read.books.map { |book| fix_book_cover(book) }
  current = $client.shelf(GOODREADS_USER_ID, 'currently-reading')
  current.books = current.books.map { |book| fix_book_cover(book) }

  {
    'read' => read,
    'current' => current
  }
end

shelves = fetch_shelves

FileUtils.mkdir_p(File.dirname(SHELVES_FILE))
File.write(SHELVES_FILE, JSON.generate(shelves))
File.write(CACHE_FILE, JSON.pretty_generate($cover_cache))

puts "Wrote #{SHELVES_FILE}"
