const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function dashboard(window = {}) {
  const elements = new Map();
  const document = { querySelector: selector => {
    if (!elements.has(selector)) elements.set(selector, {
      textContent: '', innerHTML: '', listeners: {},
      addEventListener(event, listener) { this.listeners[event] = listener; }
    });
    return elements.get(selector);
  } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, 'app.js'), 'utf8'), { document, window });
  const click = (index, action) => elements.get('#milestones').listeners.click({
    target: { closest: () => ({ dataset: { index: String(index), action } }) }
  });
  return { elements, click };
}

test('demo walks through evidence, partial release, completion, and reset', () => {
  const { elements, click } = dashboard();
  assert.equal(elements.get('#escrow').textContent, '1,200 POT (simulated)');
  click(0, 'approve');
  assert.equal(elements.get('#released-count').textContent, '0');
  click(0, 'submit');
  assert.match(elements.get('#milestones').innerHTML, /awaiting sponsor review/);
  click(0, 'approve');
  assert.equal(elements.get('#escrow').textContent, '600 POT (simulated)');
  assert.equal(elements.get('#grant-status').textContent, 'DEMO ACTIVE');
  click(0, 'approve');
  assert.equal(elements.get('#released-count').textContent, '1');
  click(1, 'submit');
  click(1, 'approve');
  assert.equal(elements.get('#grant-status').textContent, 'DEMO COMPLETED');
  assert.equal(elements.get('#escrow').textContent, '0 POT (simulated)');
  elements.get('#demo').listeners.click();
  assert.equal(elements.get('#grant-status').textContent, 'DEMO ACTIVE');
  assert.equal(elements.get('#released-count').textContent, '0');
});

test('invalid milestone actions cannot mutate the grant', () => {
  const { elements, click } = dashboard();
  for (const index of [-1, 2, 0.5, NaN]) click(index, 'submit');
  click(0, 'unknown');
  assert.equal(elements.get('#released-count').textContent, '0');
  assert.doesNotMatch(elements.get('#milestones').innerHTML, /awaiting sponsor review/);
});

for (const [label, window, expected] of [
  ['no wallet', {}, 'No compatible wallet'],
  ['EVM-only wallet', { ethereum: {} }, 'No compatible wallet'],
  ['empty injection', { injectedWeb3: {} }, 'No compatible wallet'],
  ['Substrate wallet', { injectedWeb3: { test: { enable() { throw new Error('must not request access'); } } } }, 'Wallet detected (not connected)']
]) {
  test(`${label} never changes the dashboard into live mode`, () => {
    const { elements } = dashboard(window);
    elements.get('#connect').listeners.click();
    assert.equal(elements.get('#connect').textContent, expected);
    assert.equal(elements.get('#network').textContent, 'DEMO MODE');
  });
}
