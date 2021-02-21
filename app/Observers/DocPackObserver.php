<?php

namespace App\Observers;

use App\CustomDoc;
use App\DocumentPack;

class DocPackObserver
{
    /**
     * Handle the document pack "created" event.
     *
     * @param  \App\DocumentPack  $documentPack
     * @return void
     */
    public function created(DocumentPack $documentPack)
    {
        $documentPack->createDefaultDocs();
    }

    /**
     * Handle the document pack "updated" event.
     *
     * @param  \App\DocumentPack  $documentPack
     * @return void
     */
    public function updated(DocumentPack $documentPack)
    {
        //
    }

    /**
     * Handle the document pack "deleted" event.
     *
     * @param  \App\DocumentPack  $documentPack
     * @return void
     */
    public function deleted(DocumentPack $documentPack)
    {
        CustomDoc::destroy($documentPack->customDocs->pluck('id'));
    }

    /**
     * Handle the document pack "restored" event.
     *
     * @param  \App\DocumentPack  $documentPack
     * @return void
     */
    public function restored(DocumentPack $documentPack)
    {
        //
    }

    /**
     * Handle the document pack "force deleted" event.
     *
     * @param  \App\DocumentPack  $documentPack
     * @return void
     */
    public function forceDeleted(DocumentPack $documentPack)
    {
        //
    }
}
