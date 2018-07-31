<?php

namespace App;

use DateTime;
use ePub\Reader;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;
use function array_key_exists;
use function array_pop;
use function strtolower;

/**
 * Book class
 *
 * @property string         $id
 * @property string         $title
 * @property \App\Author    $author
 * @property \App\Publisher $publisher
 * @property \App\Series    $series
 * @property int            $series_index
 * @property string         $isbn
 * @property string         $asin
 * @property string         $sorting_name
 * @property string         $language
 * @property string         $description
 * @property \DateTime      $publishing_date
 *
 * @method static \Illuminate\Database\Eloquent\Builder newInstance()
 * @method static \App\Book find($column, $value = null)
 * @method static \Illuminate\Database\Eloquent\Builder where($column, $operator = null, $value = null, $boolean = null)
 * @method static \Illuminate\Database\Eloquent\Builder create(array $attributes = [])
 * @method public \Illuminate\Database\Eloquent\Builder update(array $values)
 *
 * @package App
 */
class Book extends Model
{
    use Uuids;

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    public $keyType      = 'string';

    /**
     * Holds all fillable fields
     *
     * @var array
     */
    protected $fillable = [
        'id',
        'title',
        'isbn',
        'asin',
        'publishing_date',
        'rating',
        'language',
        'description'
    ];

    /**
     * Parses an EPUB file
     *
     * @param \Illuminate\Http\File|\Illuminate\Http\UploadedFile $file
     *
     * @param bool                                                $includeCover
     *
     * @return array
     * @throws \ePub\Exception\OutOfBoundsException
     */
    public static function parseEpub($file, bool $includeCover = false)
    {
        $meta = [];

        $reader   = new Reader();
        $epub     = $reader->load($file);
        $metadata = $epub->getMetadata();

        if ($metadata->has('title')) {
            $meta['title'] = $metadata->getValue('title');
        }

        if ($metadata->has('creator')) {
            $meta['author'] = $metadata->getValue('creator');
        }

        if ($metadata->has('publisher')) {
            $meta['publisher'] = $metadata->getValue('publisher');
        }

        if ($metadata->has('language')) {
            $meta['language'] = $metadata->getValue('language');
        }

        if ($metadata->has('subject')) {
            $subjects       = $metadata->get('subject');
            $meta['genres'] = [];

            foreach ($subjects as $subject) {
                array_push($meta['genres'], $subject->value);
            }
        }

        if ($metadata->has('description')) {
            $meta['description'] = $metadata->getValue('description');
        }

        if ($metadata->has('date')) {
            $meta['publishing_date'] = new DateTime($metadata->getValue('date'));
        }

        if ($metadata->has('identifier')) {
            $identifiers = $metadata->get('identifier');

            foreach ($identifiers as $identifier) {
                /** @type \ePub\Definition\MetadataItem $identifier */

                if (array_key_exists('scheme', $identifier->attributes)) {

                    // remove any eventual uri prefixes
                    $parts           = explode(':', $identifier->value);
                    $identifierValue = array_pop($parts);

                    switch (strtolower((string)$identifier->attributes['scheme'][0])) {
                        case 'isbn':
                            $meta['isbn'] = $identifierValue;
                            break;

                        case 'mobi-asin':
                            $meta['asin'] = $identifierValue;
                            break;

                        case 'uuid':
                            $meta['id'] = $identifierValue;
                            break;
                    }
                }
            }
        }

        if ($includeCover && $epub->getManifest()->has('cover')) {
            /** @type \ePub\Definition\ManifestItem $cover */
            $cover         = $epub->getManifest()->get('cover');
            $meta['cover'] = $cover->getContent();
        }

        $meta['all'] = $metadata->all();

        return $meta;
    }

    public static function search(string $term)
    {
        $query = Book::query();

        $authorMatches = [];
        if (preg_match('/(author:(?:(\w+)|"(.+?)"))/', $term, $authorMatches)) {
            $term       = str_replace($authorMatches[0], '', $term);
            $authorName = last($authorMatches);
            $author     = Author::where('name', 'like', "%$authorName%")->first();

            if ($author instanceof Author) {
                $query->where('author_id', $author->id);
            } else {
                return new Collection();
            }
        }

        $publisherMatches = [];
        if (preg_match('/(publisher:(?:(\w+)|"(.+?)"))/', $term, $publisherMatches)) {
            $term          = str_replace($publisherMatches[0], '', $term);
            $publisherName = last($publisherMatches);
            $publisher     = Publisher::where('name', 'like', "%$publisherName%")->first();

            if ($publisher instanceof Publisher) {
                $query->where('publisher_id', $publisher->id);
            } else {
                return new Collection();
            }
        }

        $genreMatches = [];
        if (preg_match('/(genre:(?:(\w+)|"(.+?)"))/', $term, $genreMatches)) {
            $term      = str_replace($genreMatches[0], '', $term);
            $genreName = last($genreMatches);
            $genre     = Genre::where('name', 'like', "%$genreName%")->first();

            if ($genre instanceof Genre) {
                $query->whereHas('genres', function ($q) use ($genre) {
                    return $q->where('genre_id', 'like', $genre->id);
                });
            } else {
                return new Collection();
            }
        }

        $term = trim($term);

        if (strlen($term) > 0) {
            $query->where('title', 'like', "%$term%");
        }

        return $query->get();
    }

    public function author()
    {
        return $this->belongsTo(Author::class);
    }

    public function publisher()
    {
        return $this->belongsTo(Publisher::class);
    }

    public function series()
    {
        return $this->belongsTo(Series::class);
    }

    public function genres()
    {
        return $this->belongsToMany(Genre::class);
    }
}
