const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const workflow = JSON.parse(
  fs.readFileSync('workflows/sentry-issue-to-mattermost-notification.json', 'utf8'),
);
const resolveEnvironmentNode = workflow.nodes.find((node) => node.name === 'Resolve Environment');

function runResolveEnvironment({ webhook = {}, issue = {}, latestEvent = {} }) {
  const nodes = {
    'Sentry Webhook': webhook,
    'Get Issue Details': issue,
  };
  const $ = (name) => ({
    first: () => ({ json: nodes[name] }),
  });
  const $input = {
    first: () => ({ json: latestEvent }),
  };

  return Function('$', '$input', resolveEnvironmentNode.parameters.jsCode)($, $input)[0].json;
}

test('workflow JSON に Resolve Environment node がある', () => {
  assert.ok(resolveEnvironmentNode);
  assert.equal(resolveEnvironmentNode.type, 'n8n-nodes-base.code');
});

test('baggage より latest event の environment を優先する', () => {
  const result = runResolveEnvironment({
    webhook: {
      headers: {
        baggage: 'sentry-environment=prod',
      },
    },
    issue: {
      id: '6813625483',
      shortId: 'WOLF-BACK-Z',
    },
    latestEvent: {
      id: 'event-1',
      environment: 'development',
    },
  });

  assert.equal(result.notificationEnvironment, 'development');
  assert.equal(result.environmentSource, 'latest_event');
  assert.equal(result.latestEventId, 'event-1');
});

test('Sentry event の eventID を latestEventId として返す', () => {
  const result = runResolveEnvironment({
    issue: { id: '6813625483' },
    latestEvent: {
      eventID: 'event-from-sentry',
      tags: {
        environment: 'dev',
      },
    },
  });

  assert.equal(result.notificationEnvironment, 'dev');
  assert.equal(result.environmentSource, 'latest_event');
  assert.equal(result.latestEventId, 'event-from-sentry');
});

test('webhook event の environment がある場合はそれを使う', () => {
  const result = runResolveEnvironment({
    webhook: {
      headers: {
        baggage: 'sentry-environment=prod',
      },
      body: {
        data: {
          event: {
            environment: 'staging',
          },
        },
      },
    },
  });

  assert.equal(result.notificationEnvironment, 'staging');
  assert.equal(result.environmentSource, 'webhook');
});

test('webhook event の environment tag を使う', () => {
  const result = runResolveEnvironment({
    webhook: {
      body: {
        data: {
          event: {
            tags: [
              { key: 'level', value: 'error' },
              { key: 'environment', value: 'production' },
            ],
          },
        },
      },
    },
  });

  assert.equal(result.notificationEnvironment, 'production');
  assert.equal(result.environmentSource, 'webhook');
});

test('より確かな source がない場合だけ decode 済み baggage に fallback する', () => {
  const result = runResolveEnvironment({
    webhook: {
      headers: {
        baggage: 'sentry-trace_id=abc,sentry-environment=dev%2Fedge',
      },
    },
  });

  assert.equal(result.notificationEnvironment, 'dev/edge');
  assert.equal(result.environmentSource, 'baggage');
});

test('不正な percent encoding の baggage は元の値で fallback する', () => {
  const result = runResolveEnvironment({
    webhook: {
      headers: {
        baggage: 'sentry-trace_id=abc,sentry-environment=dev%zz',
      },
    },
  });

  assert.equal(result.notificationEnvironment, 'dev%zz');
  assert.equal(result.environmentSource, 'baggage');
});

test('environment が存在しない場合は unknown を返す', () => {
  const result = runResolveEnvironment({
    webhook: {
      body: {
        data: {
          issue: { id: '1' },
        },
      },
    },
    issue: { id: '1' },
    latestEvent: { id: 'event-1' },
  });

  assert.equal(result.notificationEnvironment, 'unknown');
  assert.equal(result.environmentSource, 'unknown');
});
