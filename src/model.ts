export default interface SlackMessage {
  channel: string
  username: string
  text: string
  attachments: SlackAttachment[]
}

interface SlackAttachment {
  fallback: string
  color: string
  footer: string
  footerIcon: string
  ts: number
  fields: SlackField[]
  actions: SlackAction[]
}

interface SlackField {
  title: string
  value: string
  short: boolean
}

interface SlackAction {
  type: string
  text: string
  url: string
}
