/* eslint-disable no-console */
import * as core from '@actions/core'
import * as github from '@actions/github'
import fetch from 'node-fetch'

import SlackMessage from './model'

const START_COLOR = '#C8F1F3'
const SUCESS_COLOR = '#00C0C7'
const CANCELLED_COLOR = '#FFA900'
const FAILURE_COLOR = '#FF614E'

const DEV_CONTENTS_REPO = 'Dev-Contents-House'

const post = (slackMessage: SlackMessage): void => {
  const slackWebhookUrl = core.getInput('slack_webhook_url')

  fetch(slackWebhookUrl, {
    method: 'POST',
    body: JSON.stringify(slackMessage),
    headers: {'Content-Type': 'application/json'}
  }).catch(e => console.error(e))

  if (!core.getInput('slack_webhook_url')) {
    try {
      throw new Error(`[Error] Missing Slack Incoming Webhooks URL
           Please configure "SLACK_WEBHOOK" as environment variable or
           specify the key called "slack_webhook_url" in "with" section`)
    } catch (error) {
      console.error(error.message)
    }
  }
}

const getColor = (status: string): string => {
  if (status.toLowerCase() === 'success') {
    return SUCESS_COLOR
  }
  if (status.toLowerCase() === 'cancelled') {
    return CANCELLED_COLOR
  }
  if (status.toLowerCase() === 'failure') {
    return FAILURE_COLOR
  }
  return START_COLOR
}

const getText = (status: string): string => {
  const actor = github.context.actor
  const workflow = github.context.workflow

  const started =
    `<http://github.com/${actor}|${actor}>` +
    ' has *started* the "' +
    `${workflow}` +
    '"' +
    ' workflow '

  const succeeded =
    'The workflow "' +
    `${workflow}` +
    '"' +
    ' was completed *successfully* by ' +
    `<http://github.com/${actor}|${actor}>`

  const cancelled =
    ':warning: The workflow "' +
    `${workflow}` +
    '"' +
    ' was *canceled* by ' +
    `<http://github.com/${actor}|${actor}>`

  const failure = `<!here> The workflow "${workflow}"*failed*`

  if (status.toLowerCase() === 'success') {
    return succeeded
  }
  if (status.toLowerCase() === 'cancelled') {
    return cancelled
  }
  if (status.toLowerCase() === 'failure') {
    return failure
  }
  if (status.toLowerCase() === 'started') {
    return started
  }

  return 'status no valido'
}

const generateSlackMessage = (text: string): SlackMessage => {
  const {sha} = github.context
  const {owner, repo} = github.context.repo

  const status: string = core.getInput('status')
  const channel: string = core.getInput('slack_channel')
  const username: string = core.getInput('slack_username')

  return {
    channel,
    username,
    text:
      repo === DEV_CONTENTS_REPO
        ? '새로운 글이 추가되었습니다.'
        : getText(status),
    attachments: [
      {
        fallback: text,
        color: getColor(status),
        footer: `<https://github.com/Im-D/slack-hook-action|Powered By Im-D>`,
        footerIcon: `https://avatars1.githubusercontent.com/u/60920160?s=460&u=64291ae714c477c95ea26fdcd3b40ca837349d54&v=4`,
        ts: Math.floor(Date.now() / 1000),
        fields: [
          {
            title: 'README 확인하기',
            value: `<https://github.com/${owner}/${repo}|${owner}/${repo}>`,
            short: true
          }
        ],
        actions: [
          {
            type: 'button',
            text: 'Commit 확인',
            url: `https://github.com/${owner}/${repo}/commit/${sha}`
          },
          {
            type: 'button',
            text: 'READEME 확인',
            url: `https://github.com/${owner}/${repo}`
          }
        ]
      }
    ]
  }
}

try {
  post(generateSlackMessage('Sending message'))
} catch (error) {
  core.setFailed(
    `[Error] There was an error when sending the slack notification`
  )
}
