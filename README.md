Kiosk
=====
> Self-hosted ebook library with a gorgeous web interface, book collections, and metadata editing.

<img width="1723" alt="Screenshot of Kiosk" src="https://user-images.githubusercontent.com/6115429/214013069-f1f578e7-8e6a-4404-8b16-74b2f93c3f0e.png">

Kiosk allows you to manage your books, sort them into collections, and to read and download them. It is built on
[SvelteKit](https://kit.svelte.dev) and can run in serverless environments. Kiosk also employs password-less
authentication via [Passkeys](https://www.passkeys.io).

Features
--------

- Simple library management: Import your ebooks, update their metadata, and get a neat library accessible from any
  web browser.
- Automatic metadata retrieval: Kiosk will automatically fetch information about books, authors, and publishers from
  public knowledge graph data.
- Easy search integration: Kiosk integrates search services to index and search content in your library.
- Seamless passkey authentication: By using passkeys, you can sign in to Kiosk using Windows Hello, Touch ID or Face ID
  and similar authenticators.
- Book collections: Kiosk allows you to create collections for your books.
- Easy to self-host: Kiosk is built for maximum flexibility. Run it on Docker, Cloudflare, Vercel, AWS or directly on
  Node.js. Thanks to [SvelteKit](https://kit.svelte.dev), Kiosk can run pretty much anywhere.

Installation
------------
> For now, Kiosk has only been tested properly in a node.js environment. If you intend to host it in a serverless
> environment like Cloudflare Workers, Netlify or AWS Lambda, I'll do my best to support you!

To install Kiosk in a node environment, clone the repository:

```shell
npx create @project-kiosk/create
```

Modify the .env file to match your environment, then start the preview server:
```shell
npm run preview
```

Congrats &ndash; Kiosk should be running on [localhost:4173](http://localhost:4173)!

Configuration
-------------
Kiosk can be configured via environment variables. The reference is grouped in the following sections:

- [Database](#database)
- [JWT](#jwt)
- [Mail](#mail)
- [Key-Value Store](#key-value-store)
- [File Storage](#file-storage)
- [Knowledge Graph Search](#knowledge-graph-search)
- [Search](#search)

### Database
Used for storing metadata, library content, and user data. Supported providers: Anything
  [Prisma](https://www.prisma.io) supports &ndash; right now, that is:
- [PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)
- [MySQL](https://www.prisma.io/docs/concepts/database-connectors/mysql)
- [SQLite](https://www.prisma.io/docs/concepts/database-connectors/sqlite)
- [SQL Server](https://www.prisma.io/docs/concepts/database-connectors/sql-server)
- [MongoDB](https://www.prisma.io/mongodb)
- [CockroachDB](https://www.prisma.io/cockroachdb)

For all providers, you'll have to set the following variables:

- **`DATABASE_PROVIDER`**: Database type, as per the 
  [Prisma documentation](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#fields)
- **`DATABASE_URL`**: Connection URL, including authentication info, for the database to use.

### JWT
[**J**SON **W**eb **T**okens](https://jwt.io) are used to encode user authorization information along with their access
token and will be stored in a user cookie.

- **`JWT_SECRET`**: Secret to encode JSON web tokens with. Generate a unique value for this.
- **`JWT_COOKIE_NAME`**: Name of the JWT cookie. Defaults to `jwt`.
- **`SESSION_ID_COOKIE_NAME`**: Name of the authentication session cookie. Defaults to `ksid`

-----

### Mail
Used for sending out authentication pass codes and other account-related communication. Supported providers:
[Mailjet](https://www.mailjet.com), [Mailgun](https://www.mailgun.com),
[Cloudflare (via MailChannels)](https://blog.cloudflare.com/sending-email-from-workers-with-mailchannels/) or anything
[NodeMailer](https://nodemailer.com/about/) supports (using a [custom adapter](#add-an-email-adapter)).

- **`MAIL_ADAPTER`**: One of `mailjet`, `mailgun`, `cloudflare`.
- **`MAIL_SENDER_NAME`**: Name of the sender in outgoing emails. Defaults to `Kiosk`.
- **`MAIL_SENDER_ADDRESS`**: Email address of the sender in outgoing emails.

Depending on the chosen adapter, you'll need to provide the following values, too:

#### Mailjet

- **`MAILJET_API_KEY`**: API key for the Mailjet account.
- **`MAILJET_API_SECRET`**: API key secret for the Mailjet account.

#### Mailgun

- **`MAILJET_API_KEY`**: API key for the Mailgun account.

#### Cloudflare
> **Note:** Using the Cloudflare MailChannels integration is limited to Kiosk running in a Cloudflare Workers or Pages
> environment. While it works remarkably flawlessly, I'm a bit hesitant to rely on this service being free forever.  
> On the bright side of things, however, Kiosk makes switching the mail adapter exceptionally simple, so if any problems
> arise, you can just swap it out for one of the others.

-----

### Key-Value Store
Used for storing temporary KV data, mostly for caching. Supported providers: In-memory, [Redis](https://redis.io),
or [Cloudflare KV](https://www.cloudflare.com/products/workers-kv/).

- **`KEY_VALUE_ADAPTER`**: One of `memory`, `redis`, or `cloudflare`.

Depending on the chosen adapter, you'll need to provide the following values, too:

#### Cloudflare
> **Note:** Using KV is limited to Kiosk running in a Cloudflare Workers or Pages environment.

- **`KV_NAMESPACE`**: The
  [KV namespace](https://developers.cloudflare.com/workers/runtime-apis/kv/#referencing-kv-from-workers) to use.

#### Redis

- **`REDIS_URL`**: Connection URL for the redis instance to use, provided in the format
  `redis[s]://[[username][:password]@][host][:port][/db-number]`. Defaults to `redis://localhost`.
- **`REDIS_SOCKET`**: Path to the UNIX socket redis is listening on. Will be preferred over `REDIS_DSN`, if given.

-----

### File Storage
Used for storing books and images. Supported providers: Node (local filesystem), AWS S3 (https://aws.amazon.com/s3/),
or [Cloudflare R2](https://www.cloudflare.com/products/r2/).

- **`STORAGE_ADAPTER`**: One of `node`, `aws`, or `cloudflare`.

Depending on the chosen adapter, you'll need to provide the following values, too:

#### Node

- **`STORAGE_PATH`**: Absolute path to the storage root directory. Root traversal is prevented by Kiosk automatically.

#### AWS S3
TBD

#### Cloudflare
> **Note:** Using R2 is currently limited to Kiosk running in a Cloudflare Workers or Pages environment. This
> restriction could be removed in the future, however. [PRs welcome!](https://github.com/Radiergummi/kiosk/pulls)

- **`STORAGE_BUCKET_NAME`**: Name of the 
  [storage bucket](https://developers.cloudflare.com/r2/data-access/workers-api/workers-api-usage/#4-bind-your-bucket-to-a-worker)
  to write to and read from.

-----

### Knowledge Graph Search
Used for fetching information about authors, publishers and books automatically. Supported providers:
[Google Graph Search](https://developers.google.com/knowledge-graph),
[Google Enterprise KG Search](https://cloud.google.com/enterprise-knowledge-graph/docs/search-api),
[Wikidata](https://www.wikidata.org/wiki/Wikidata:SPARQL_query_service/A_gentle_introduction_to_the_Wikidata_Query_Service)
(in progress)

- **`KNOWLEDGE_GRAPH_ADAPTER`**: One of `googleKgSearch`, `googleEnterpriseKg`, or `wikidata`.

Depending on the chosen adapter, you'll need to provide the following values, too:

#### Google Knowledge Graph Search
Please note that Google is really ambiguous with the wording on the knowledge graph search API page; I cannot tell
whether they are going to deprecate the API, or whether you're just not supposed to use it in your own search engine.
Nevertheless, it's here, it's working, and has a generous quota, so there's that.

- **`PUBLIC_GOOGLE_KNOWLEDGE_GRAPH_API_KEY`**: Your Google API key.
  [Follow the directions here](https://developers.google.com/knowledge-graph/prereqs) to get one.
- **`PUBLIC_GOOGLE_KNOWLEDGE_GRAPH_API_URL`**: URL to the query endpoint. Usually not required. Defaults to
  `https://content-kgsearch.googleapis.com/v1/entities:search`.

#### Google Enterprise Knowledge Graph
This is Google's newer offering, purportedly for "Enterprise" customers, whatever that means. The product seems to be a
strange chimera of data enrichment and public knowledge graph search somehow tacked on as a neat side effect. Using the
enterprise graph search is free &ndash; for now, apparently &ndash; and works really reliably, so that is what I'd
recommend.

- **`GOOGLE_ENTERPRISE_KNOWLEDGE_GRAPH_API_CREDENTIALS`**: Your Google cloud credentials for the enterprise knowledge
  graph search API. These _must_ be provided as a base64-encoded string, which you'll want for storing in an environment
  variable anyway. [Follow the directions here](https://developers.google.com/knowledge-graph/how-tos/authorizing) to
  get credentials, then run `cat $CREDENTIALS_FILE | base64` to encode them into a string.
- **`GOOGLE_ENTERPRISE_KNOWLEDGE_GRAPH_API_URL`**: URL to the query endpoint. Note that it contains a placeholder for
  the Google Cloud project ID. Usually not required. Defaults to
  `https://enterpriseknowledgegraph.googleapis.com/v1/projects/${PROJECT_ID}/locations/global/publicKnowledgeGraphEntities:Search`.
- **`GOOGLE_ENTERPRISE_KNOWLEDGE_GRAPH_API_SCOPE`**: Scope for the OAuth token requested by the client. Usually not
  required. Defaults to `https://www.googleapis.com/auth/cloud-platform`.

#### Wikidata
Unfortunately, I wasn't able to implement the Wikidata adapter yet, because it's just so darn hard to ask them for a
person or thing reliably without studying some obscure query language for a few decades.  
If you have experience in working with the Wikipedia API, or the Wikidata SPARQL engine, please let me now!

-----

### Search
Used for indexing and searching for books and recommending content. Supported providers: Algolia.

> **Note:** Right now, there's only support for Algolia, although I plan to include an adapter for Elasticsearch (and 
> OpenSearch, by extension). Let me know if you're interested in helping out.

- **`SEARCH_ADAPTER`**: One of `algolia`.
- **`SEARCH_INDEX_BOOKS`**: Name of the search index for books. Defaults to `dev_books`.
- **`SEARCH_INDEX_AUTHORS`**: Name of the search index for authors. Defaults to `dev_authors`.

Depending on the chosen adapter, you'll need to provide the following values, too:

#### Algolia
- **`PUBLIC_ALGOLIA_SEARCH_API_KEY`**: Your Algolia search API key.
- **`PUBLIC_ALGOLIA_ADMIN_API_KEY`**: Your Algolia admin API key.
- **`ALGOLIA_APP_ID`**: Your Algolia app ID.

Project History
---------------
Originally, Kiosk was born from a Dribbble shot of a prototype library. Unfortunately, I can't find that shot anymore,
so I can't give credit to the designer. Back in 2017, I cobbled together an express server with redis and epub.js to get
a proof of concept. It worked, but was quite cumbersome to extend. Back then, I was working with PHP in my day job, so
after a while, I decided to build Kiosk from scratch, using PHP and Laravel. I never got quite around implementing all
functionality of the original app. This was a nice lesson on why you shouldn't rebuild things from scratch!  
Fast-forward a few years, I finally got back to working on Kiosk. PHP is annoying me more and more, and the frontend
world has progressed substantially. So this time, I've settled on a technology stack which feels just perfect for this
project: [SvelteKit](https://kit.svelte.dev) in conjunction with SQLite.

If you're interested in improving or extending Kiosk, please reach out. I'm quite preoccupied with my day job, family
duties and doing things away from a computer, so I cannot spend as much time on Kiosk as I'd like to.
