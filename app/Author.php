<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

/**
 * Author class
 *
 * @property string                                   $id
 * @property string                                   $name
 * @property \Illuminate\Database\Eloquent\Collection $books
 * @method static \App\Author find($column, $value = null)
 * @method static \Illuminate\Database\Eloquent\Builder where($column, $operator = null, $value = null, $boolean = null)
 * @method static \Illuminate\Database\Eloquent\Builder create(array $attributes = [])
 * @method public \Illuminate\Database\Eloquent\Builder update(array $values)
 * @package App
 */
class Author extends Model
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
     * fillable
     *
     * @var array
     */
    protected $fillable = [
        'name'
    ];

    public function books()
    {
        return $this->hasMany(Book::class);
    }
}
