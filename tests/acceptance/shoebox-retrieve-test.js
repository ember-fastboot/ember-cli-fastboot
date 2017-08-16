import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';

moduleForAcceptance('browser acceptance test | shoebox retrieve');

test('it can retrieve items from the shoebox', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/');
    assert.equal(find('.shoebox').text().replace(/\s+/g, ' ').trim(), 'bar zap', 'the data was retreived from the shoebox');
  });
});