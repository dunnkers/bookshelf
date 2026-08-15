# bookshelf
Hi! This is my bookshelf. It pulls publicly available information from [Goodreads](https://goodreads.com/), including book cover images that are scraped from each book's page (not available through the Goodreads API).

![bookshelf example](https://user-images.githubusercontent.com/744430/80863557-93ff3c80-8c7d-11ea-9453-0c832e96842d.png)

^ example of the bookshelf.

## Architecture

This repo is fully self-contained — there's no external service or database involved. The daily [GitHub Action](.github/workflows/update-website.yml) does everything:

1. `scripts/fetch_shelves.rb` calls the Goodreads API for the "read" and "currently-reading" shelves and writes the result to `data/shelves.json`.
2. Cover images aren't available through the Goodreads API, so they're scraped from each book's page with Nokogiri. Scraped URLs are cached in [`data/cover_cache.json`](data/cover_cache.json) — a plain JSON file committed straight back to the repo by the workflow — so a book is only ever scraped once. If a book's page is temporarily unreachable (Goodreads occasionally returns a 503), the fetch is retried a few times with backoff; if it still fails, that one cover is just skipped for the day rather than failing the whole run.
3. `compile-website.mjs` reads `data/shelves.json` and renders the static site into `build/`.
4. The result is deployed to the `gh-pages` branch, served at [dunnkers.com/bookshelf](https://dunnkers.com/bookshelf).

(This used to call out to a separate [`goodreads-api`](https://github.com/dunnkers/goodreads-api) Google Cloud Function — that service has since been retired in favor of the pipeline above.)

### Required repository secrets

The GitHub Action needs two secrets configured on this repo (**Settings → Secrets and variables → Actions**):

- `GOODREADS_API_KEY` — see [obtaining an API key](https://www.goodreads.com/api/keys)
- `GOODREADS_USER_ID` — visible in your Goodreads profile link

## Usage

1. Install deps:

    ```
    yarn
    bundle install
    ```

2. Configure the same two environment variables locally:

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
