<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Series extends Model
{
    use Uuids;

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    public $keyType      = 'string';

    public function books()
    {
        return $this->hasMany(Book::class);
    }
}
