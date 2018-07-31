<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Genre extends Model
{
    use Uuids;

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public    $incrementing = false;

    public    $keyType      = 'string';

    protected $fillable     = [
        'name'
    ];

    public function books()
    {
        return $this->belongsToMany(Book::class);
    }
}
