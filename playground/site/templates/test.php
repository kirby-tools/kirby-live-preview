<?php snippet('header') ?>

<article>
  <h1 class="h1"><?= $page->title()->esc() ?></h1>
  <div class="text">
    <?= $page->text()->toBlocks() ?>
    <?php foreach ($page->structure()->toStructure() as $item): ?>
      <p><?= $item->platform() ?></p>
    <?php endforeach ?>
  </div>
</article>

<?php snippet('footer') ?>
