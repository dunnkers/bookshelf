# bookshelf
Hi! This is my bookshelf. It pulls publicly available information from [Goodreads](https://goodreads.com/), including book cover images that are scraped from each book's page (not available through the Goodreads API).

![bookshelf example](https://user-images.githubusercontent.com/744430/80863557-93ff3c80-8c7d-11ea-9453-0c832e96842d.png)

^ example of the bookshelf.

## Architecture

Previously this repo fetched book data from a separate [`goodreads-api`](https://github.com/dunnkers/goodreads-api) Google Cloud Function. That service has since been retired; fetching now happens inside this repo's own GitHub Action:

1. `scripts/fetch_shelves.rb` calls the Goodreads API for the "read" and "currently-reading" shelves, scrapes cover images with Nokogiri, and writes the result to `data/shelves.json`.
2. Cover image URLs are cached in `data/cover_cache.json`, which is committed back to the repo by the workflow so books don't need to be re-scraped on every run.
3. `compile-website.mjs` reads `data/shelves.json` and renders the static site into `build/`.

See `.github/workflows/update-website.yml` for the full pipeline, which runs daily on a schedule.

## Usage

1. Install deps:

    ```
    yarn
    bundle install
    ```

2. Configure two environment variables (see [obtaining an API key](https://www.goodreads.com/api/keys); user id is visible in your profile link):

    ```shell
    export GOODREADS_API_KEY=<your_api_key>
    export GOODREADS_USER_ID=<your_user_id>
    ```

3. Fetch your Goodreads shelves:

    ```
    bundle exec ruby scripts/fetch_shelves.rb
    ```

    This writes `data/shelves.json`.

4. Build the website:

    ```
    yarn build
    ```

    This now put a static website in `build`. You can deploy this to GitHub pages.

## About
Built by [Jeroen Overschie](https://jeroenoverschie.nl/).