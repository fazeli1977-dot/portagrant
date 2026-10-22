const milestones = [
  { title: 'Architecture & prototype', amount: 600, submitted: false, done: false },
  { title: 'Testnet launch & docs', amount: 600, submitted: false, done: false }
];

const milestonesElement = document.querySelector('#milestones');
const demoButton = document.querySelector('#demo');
const connectButton = document.querySelector('#connect');
const statusElement = document.querySelector('#status');
const networkElement = document.querySelector('#network');
const grantStatusElement = document.querySelector('#grant-status');
const escrowElement = document.querySelector('#escrow');
const releasedElement = document.querySelector('#released-count');

function renderMilestones() {
  const released = milestones.filter(milestone => milestone.done).length;
  releasedElement.textContent = String(released);
  grantStatusElement.textContent = released === milestones.length ? 'DEMO COMPLETED' : 'DEMO ACTIVE';
  escrowElement.textContent = `${milestones.filter(milestone => !milestone.done).reduce((total, milestone) => total + milestone.amount, 0).toLocaleString('en-US')} POT (simulated)`;
  milestonesElement.innerHTML = milestones.map((milestone, index) => `
    <article class="milestone">
      <span class="dot ${milestone.done ? '' : 'pending'}" aria-hidden="true"></span>
      <div class="milestone-copy"><h3>${index + 1}. ${milestone.title}</h3>
        <p>${milestone.done ? 'Simulated payment released' : milestone.submitted ? 'Demo evidence submitted; awaiting sponsor review' : 'Awaiting demo evidence'}</p>
        <button class="milestone-action" type="button" data-index="${index}" data-action="${milestone.submitted ? 'approve' : 'submit'}" ${milestone.done ? 'disabled' : ''}>
          ${milestone.done ? 'Demo released' : milestone.submitted ? 'Simulate sponsor approval' : 'Simulate builder evidence'}
        </button>
      </div>
      <span class="amount">${milestone.amount} POT</span>
    </article>
  `).join('');
}

milestonesElement.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const index = Number(button.dataset.index);
  if (!Number.isInteger(index) || index < 0 || index >= milestones.length) return;
  const milestone = milestones[index];
  if (milestone.done) return;
  if (button.dataset.action === 'submit') milestone.submitted = true;
  else if (button.dataset.action === 'approve' && milestone.submitted) milestone.done = true;
  else return;
  renderMilestones();
  statusElement.textContent = 'Local simulation updated. No wallet signature, transfer, or on-chain transaction occurred.';
});

demoButton.addEventListener('click', () => {
  for (const milestone of milestones) {
    milestone.submitted = false;
    milestone.done = false;
  }
  renderMilestones();
  statusElement.textContent = 'Demo reset. Simulate builder evidence, then sponsor approval. All values are illustrative.';
});

connectButton.addEventListener('click', () => {
  const providers = window.injectedWeb3;
  const hasSubstrateProvider = Boolean(providers && Object.values(providers).some(provider => typeof provider?.enable === 'function'));
  networkElement.textContent = 'DEMO MODE';
  if (hasSubstrateProvider) {
    statusElement.textContent = 'Substrate wallet detected, but not connected. This dashboard remains a local simulation; no account access was requested.';
    connectButton.textContent = 'Wallet detected (not connected)';
  } else {
    statusElement.textContent = 'No compatible Substrate wallet detected. An EVM-only wallet does not connect this ink! demo.';
    connectButton.textContent = 'No compatible wallet';
  }
});

renderMilestones();
