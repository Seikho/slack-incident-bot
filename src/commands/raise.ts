import { register, Incident } from '../config'
import * as incident from './incident'
import { getRulesOfEngagement } from './incident-help'
import { sleep } from './util'
import { readMessage } from 'slacklib'

register('raise', `Raise an incident record in JIRA`, async (bot, msg, cfg, params) => {
  const baseMsg = {
    channel: msg.channel,
    ...cfg.defaultParams
  }

  if (!msg.channel.startsWith('C')) {
    await bot.postMessage({
      ...baseMsg,
      text: '*Error*: Please raise the incident in a new channel'
    })
    return
  }

  await bot.postMessage({
    ...baseMsg,
    text: [
      'Please enter a severity by corresponding with the number:',
      '*1*: Full or major site outage',
      '*2*: Partial site or feature degration',
      '*3*: Issue requires immediate remediation',
      '*4*: Issue requires attention and priority scheduling for remediation'
    ].join('\n')
  })

  const getSeverity = async (): Promise<Incident['severity']> => {
    const response = await readMessage(bot, msg.user, { timeout: 120 })
    const severity = Number(response)

    if (severity < 1 || severity > 4) {
      await bot.postMessage({
        ...baseMsg,
        text: `Please specify a valid severity (1-4)`
      })

      return getSeverity()
    }

    return response as any
  }

  const getDescription = async (): Promise<string> => {
    await bot.postMessage({ ...baseMsg, text: 'Please enter a brief description of the issue:' })
    const response = await readMessage(bot, msg.user, { timeout: 120 })
    return response
  }

  try {
    const severity = await getSeverity()
    const description = await getDescription()
    await bot.postMessage({
      channel: msg.channel,
      text: `K. Hold on...`,
      ...cfg.defaultParams
    })

    await sleep(250)
    await bot.postMessage({
      ...baseMsg,
      text: getRulesOfEngagement(bot)
    })

    const result = await incident.create(bot, msg, severity, description)
    const text = getResultText(result)

    await bot.postMessage({
      channel: msg.channel,
      text
    })

    await sleep(250)
    const channel = await bot.getChannel(msg.channel)
    await sleep(250)

    await bot.postMessage({
      channel: cfg.channel,
      text: [
        `:rotating_light: An incident has been raised in <#${msg.channel}|${
          channel.name
        }> :rotating_light:`,
        `*Severity*: ${severity}`,
        `*Issue*: ${description}`
      ].join('\n'),
      ...cfg.defaultParams
    })
  } catch (ex) {
    await bot.postMessage({
      channel: msg.channel,
      text: ex.message,
      ...cfg.defaultParams
    })
  }
})

function getResultText(result?: Incident) {
  if (!result) {
    return `Yep. Good. I've raised the incident.`
  }

  return [
    `Yep. Good.`,
    `I've raised *${result.ticketId}* (${result.jiraUrl})`,
    `*Journal*: ${result.confluenceUrl}`
  ].join('\n')
}
